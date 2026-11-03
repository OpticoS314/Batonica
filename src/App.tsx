/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Heart, 
  ShoppingBag, 
  Sparkles, 
  Leaf, 
  PlusCircle, 
  ShieldCheck, 
  RefreshCw,
  X,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RotateCcw,
  Undo2,
  LayoutGrid,
  List,
  MessageCircle,
  Send,
  CheckSquare
} from 'lucide-react';
import { Plant, PlantCategory, CartItem } from './types/plant';
import { plantStorage } from './services/plantStorage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AndroidShell } from './components/AndroidShell';
import { PlantCard } from './components/PlantCard';
import { PlantListItem } from './components/PlantListItem';
import { PlantDetailModal } from './components/PlantDetailModal';
import { AdminPortal } from './components/AdminPortal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { CartDrawer } from './components/CartDrawer';
import { CareGuideTab } from './components/CareGuideTab';
import { WhatsAppCatalogueModal } from './components/WhatsAppCatalogueModal';

const CATEGORIES: PlantCategory[] = [
  'All',
  'Indoor',
  'Foliage',
  'Low Light',
  'Air Purifying',
  'Succulents',
  'Flowering',
  'Pet Friendly'
];

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name';

function MainApp() {
  const { isAdmin, showLoginModal, setShowLoginModal } = useAuth();

  // Plant catalog state from reactive storage
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Navigation & View tabs
  const [activeTab, setActiveTab] = useState<'catalog' | 'saved' | 'guide' | 'admin'>('catalog');

  // Search, category & sort
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<PlantCategory>('All');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [onlyPetFriendly, setOnlyPetFriendly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Quick plant removal mode (User's explicit requirement: enable plants to be removed from app)
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
  const [lastRemovedPlant, setLastRemovedPlant] = useState<Plant | null>(null);

  // Selected plant for detail modal (User requirement: click to see short description & price)
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  // Admin portal & quick edit plant
  const [editingPlantForAdmin, setEditingPlantForAdmin] = useState<Plant | null>(null);

  // Saved / Wishlist plants (saved in localStorage)
  const [savedPlantIds, setSavedPlantIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('botanica_saved_plants');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Cart / Nursery Reservation
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('botanica_cart_items');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // WhatsApp Catalogue Selection State
  const [selectedCataloguePlantIds, setSelectedCataloguePlantIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('botanica_catalogue_plants');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [isCatalogueModalOpen, setIsCatalogueModalOpen] = useState<boolean>(false);

  // Toast / notification
  const [toastNotice, setToastNotice] = useState<{
    text: string;
    isUndoable?: boolean;
    type?: 'success' | 'alert';
  } | null>(null);

  const showToast = (text: string, isUndoable = false, type: 'success' | 'alert' = 'success') => {
    setToastNotice({ text, isUndoable, type });
    setTimeout(() => {
      setToastNotice(current => current?.text === text ? null : current);
    }, 4000);
  };

  // Subscribe to real-time plant changes
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = plantStorage.subscribe((latestPlants) => {
      setPlants(latestPlants);
      setIsLoading(false);

      // Keep selected plant in sync if its pricing was changed
      setSelectedPlant(prev => {
        if (!prev) return null;
        const found = latestPlants.find(p => p.id === prev.id);
        return found || null;
      });
    });

    return () => unsubscribe();
  }, []);

  // Save wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('botanica_saved_plants', JSON.stringify(savedPlantIds));
  }, [savedPlantIds]);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('botanica_cart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  // Save selected catalogue plants to localStorage
  useEffect(() => {
    localStorage.setItem('botanica_catalogue_plants', JSON.stringify(selectedCataloguePlantIds));
  }, [selectedCataloguePlantIds]);

  // Toggle wishlist
  const handleToggleSave = (e: React.MouseEvent | string, plantId?: string) => {
    const id = typeof e === 'string' ? e : plantId;
    if (typeof e !== 'string') {
      e.stopPropagation();
    }
    if (!id) return;

    setSavedPlantIds(prev => {
      const isSaved = prev.includes(id);
      if (isSaved) {
        showToast('Removed from wishlist');
        return prev.filter(item => item !== id);
      } else {
        showToast('Saved to your wishlist! 🌿');
        return [...prev, id];
      }
    });
  };

  // Add to Cart
  const handleAddToCart = (plant: Plant) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.plant.id === plant.id);
      if (existingIdx !== -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += 1;
        return copy;
      } else {
        return [...prev, { plant, quantity: 1 }];
      }
    });
    showToast(`Added ${plant.name} to cart!`);
  };

  // Cart operations
  const handleUpdateCartQuantity = (plantId: string, delta: number) => {
    setCartItems(prev => {
      return prev
        .map(item => {
          if (item.plant.id === plantId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveCartItem = (plantId: string) => {
    setCartItems(prev => prev.filter(item => item.plant.id !== plantId));
    showToast('Item removed from cart');
  };

  // Pricing update handler (Admin requirement)
  const handleUpdatePricing = async (plantId: string, basePrice: number) => {
    await plantStorage.updatePlantPricing(plantId, basePrice);
  };

  // Add new plant handler (Admin requirement)
  const handleCreatePlant = async (newPlant: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>) => {
    await plantStorage.createPlant(newPlant);
  };

  // User requirement: ENABLE PLANTS TO BE REMOVED FROM THE APP
  const handleRemovePlant = async (e: React.MouseEvent | undefined, plant: Plant) => {
    if (e) e.stopPropagation();
    setLastRemovedPlant(plant);
    await plantStorage.deletePlant(plant.id);
    showToast(`Removed "${plant.name}" from catalog.`, true, 'alert');
  };

  // Undo plant removal
  const handleUndoRemove = async () => {
    if (lastRemovedPlant) {
      await plantStorage.restorePlant(lastRemovedPlant);
      showToast(`Restored "${lastRemovedPlant.name}" to catalog! 🌿`);
      setLastRemovedPlant(null);
    }
  };

  // Reset catalog to initial state
  const handleResetCatalog = async () => {
    await plantStorage.resetCatalog();
    showToast('Catalog restored to default botanical collection.');
  };

  // Quick edit pricing clicked from plant card
  const handleQuickEditPrice = (e: React.MouseEvent, plant: Plant) => {
    e.stopPropagation();
    setEditingPlantForAdmin(plant);
    setActiveTab('admin');
  };

  // WhatsApp Catalogue Selection Handlers
  const handleToggleCatalogueSelect = (plant: Plant) => {
    setSelectedCataloguePlantIds(prev => {
      const isSelected = prev.includes(plant.id);
      if (isSelected) {
        showToast(`Removed "${plant.name}" from catalogue`);
        return prev.filter(id => id !== plant.id);
      } else {
        showToast(`Added "${plant.name}" to catalogue! 🌿`);
        return [...prev, plant.id];
      }
    });
  };

  const handleSelectAllForCatalogue = () => {
    const ids = filteredPlants.map(p => p.id);
    setSelectedCataloguePlantIds(prev => Array.from(new Set([...prev, ...ids])));
    showToast(`Added ${ids.length} plants to WhatsApp catalogue`);
  };

  const handleClearCatalogueSelection = () => {
    setSelectedCataloguePlantIds([]);
    showToast('Cleared WhatsApp catalogue selection');
  };

  // Filtered & sorted plants
  const filteredPlants = useMemo(() => {
    let result = [...plants];

    // Filter by Wishlist tab
    if (activeTab === 'saved') {
      result = result.filter(p => savedPlantIds.includes(p.id));
    }

    // Category filter
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Pet Friendly') {
        result = result.filter(p => p.isPetFriendly);
      } else {
        result = result.filter(p => p.category === selectedCategory);
      }
    }

    // Pet friendly toggle
    if (onlyPetFriendly) {
      result = result.filter(p => p.isPetFriendly);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.scientificName.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      // default: popular first
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return 0;
    });

    return result;
  }, [plants, activeTab, savedPlantIds, selectedCategory, onlyPetFriendly, searchQuery, sortBy]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Selected plants for WhatsApp catalogue
  const selectedCataloguePlants = useMemo(() => {
    return plants.filter(p => selectedCataloguePlantIds.includes(p.id));
  }, [plants, selectedCataloguePlantIds]);

  return (
    <AndroidShell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      savedCount={savedPlantIds.length}
      cartCount={totalCartCount}
      onOpenCart={() => setIsCartOpen(true)}
      onOpenAdminPortal={() => setShowLoginModal(true)}
    >
      {/* Toast Notification with Undo button for plant removal */}
      {toastNotice && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-700/90 text-white px-4 py-2.5 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-3 animate-slideDown ring-1 ring-emerald-500/30">
          <div className="flex items-center gap-1.5">
            {toastNotice.type === 'alert' ? (
              <Trash2 className="w-4 h-4 text-red-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span className="text-slate-100">{toastNotice.text}</span>
          </div>

          {toastNotice.isUndoable && lastRemovedPlant && (
            <button
              onClick={handleUndoRemove}
              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[11px] flex items-center gap-1 transition-all active:scale-95 shadow-sm"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          )}

          <button
            onClick={() => setToastNotice(null)}
            className="text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Tab Routing */}
      {activeTab === 'admin' ? (
        <AdminPortal
          plants={plants}
          onUpdatePricing={handleUpdatePricing}
          onCreatePlant={handleCreatePlant}
          onDeletePlant={async (id) => {
            const target = plants.find(p => p.id === id);
            if (target) {
              await handleRemovePlant(undefined, target);
            } else {
              await plantStorage.deletePlant(id);
            }
          }}
          onResetCatalog={handleResetCatalog}
          onClose={() => setActiveTab('catalog')}
          onSelectPlantToPreview={(plant) => setSelectedPlant(plant)}
          initialEditPlant={editingPlantForAdmin}
        />
      ) : activeTab === 'guide' ? (
        <CareGuideTab
          plants={plants}
          onSelectPlant={(plant) => setSelectedPlant(plant)}
        />
      ) : (
        /* CATALOG OR WISHLIST VIEW - STITCH.AI ANDROID UI SPEC */
        <div className="flex-1 flex flex-col pb-20">
          {/* Android / Stitch Top App Bar */}
          <div className="p-4 pb-2 bg-slate-900/90 backdrop-blur-md sticky top-0 z-20 border-b border-slate-800/60">
            {/* Top Greeting & Brand Bar */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
                  <Leaf className="w-5 h-5 fill-slate-950" />
                </div>
                <div>
                  <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                    <span>Botanica</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      Stitch UI
                    </span>
                  </h1>
                  <p className="text-[11px] text-slate-400">Discover & Adopt Indoor Houseplants</p>
                </div>
              </div>

              {/* Actions: WhatsApp Catalogue, Remove Mode Toggle, Admin Mode, Cart */}
              <div className="flex items-center gap-1.5">
                {/* WhatsApp Catalogue Builder Button */}
                <button
                  onClick={() => {
                    if (selectedCataloguePlantIds.length > 0) {
                      setIsCatalogueModalOpen(true);
                    } else {
                      setIsSelectionMode(!isSelectionMode);
                      if (!isSelectionMode) {
                        showToast('Select plants to forward on WhatsApp! 🌿');
                      }
                    }
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedCataloguePlantIds.length > 0
                      ? 'bg-[#25D366] text-slate-950 border-[#25D366] shadow-sm shadow-[#25D366]/30'
                      : isSelectionMode
                      ? 'bg-[#25D366]/20 text-[#25D366] border-[#25D366]/50'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title={
                    selectedCataloguePlantIds.length > 0
                      ? `Forward ${selectedCataloguePlantIds.length} plants on WhatsApp`
                      : 'Select plants for WhatsApp catalogue'
                  }
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span className="text-[11px]">
                    {selectedCataloguePlantIds.length > 0
                      ? `WhatsApp (${selectedCataloguePlantIds.length})`
                      : isSelectionMode
                      ? 'Done'
                      : 'WhatsApp'}
                  </span>
                </button>

                {/* Remove Plants Mode Toggle (User's explicit requirement) */}
                <button
                  onClick={() => setIsDeleteMode(!isDeleteMode)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isDeleteMode
                      ? 'bg-red-500 text-white border-red-400 shadow-md shadow-red-950/50 animate-pulse'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title={isDeleteMode ? 'Exit Plant Removal Mode' : 'Toggle Quick Plant Removal Mode'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{isDeleteMode ? 'Exit Remove' : 'Remove Plants'}</span>
                </button>

                {isAdmin ? (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="flex items-center gap-1 bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 px-2.5 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-900 transition-colors"
                    title="Open Admin Portal to adjust pricing or add plants"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Admin</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                    title="Admin login"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}

                {/* Cart Button */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-200 transition-colors"
                  title="View nursery bag"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {totalCartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center animate-scaleIn">
                      {totalCartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Stitch Search Field */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plants, care needs, botanical species..."
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl pl-10 pr-9 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Stitch Category Chips */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pt-3 pb-1 -mx-4 px-4">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-950/40'
                        : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    {cat === 'Pet Friendly' ? '🐾 Pet Friendly' : cat}
                  </button>
                );
              })}
            </div>

            {/* WhatsApp Catalogue Selection Banner */}
            {(isSelectionMode || selectedCataloguePlantIds.length > 0) && (
              <div className="mt-2.5 p-2.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 shadow-md animate-fadeIn space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-[#25D366] flex items-center justify-center text-slate-950 shrink-0">
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-white truncate">
                        {selectedCataloguePlantIds.length === 0
                          ? 'Select plants below for WhatsApp'
                          : `${selectedCataloguePlantIds.length} plant${selectedCataloguePlantIds.length === 1 ? '' : 's'} in catalogue`}
                      </p>
                      <p className="text-[10px] text-emerald-300 truncate">
                        Tap any plant to toggle • Ready to send
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={handleSelectAllForCatalogue}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 transition-colors"
                    >
                      Select All
                    </button>

                    {selectedCataloguePlantIds.length > 0 && (
                      <button
                        onClick={handleClearCatalogueSelection}
                        className="text-[10px] font-semibold px-1.5 py-1 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        Clear
                      </button>
                    )}

                    <button
                      onClick={() => setIsCatalogueModalOpen(true)}
                      disabled={selectedCataloguePlantIds.length === 0}
                      className="flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span>Forward</span>
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Small thumbnail images of selected plants */}
                {selectedCataloguePlants.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 border-t border-emerald-800/40 scrollbar-thin">
                    {selectedCataloguePlants.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleToggleCatalogueSelect(p)}
                        title={`${p.name} - Tap to remove`}
                        className="relative shrink-0 cursor-pointer group"
                      >
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-7 h-7 rounded-lg object-cover border border-emerald-400/60 shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=100&q=80';
                          }}
                        />
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          ×
                        </span>
                      </div>
                    ))}
                    <span className="text-[10px] text-emerald-300/80 shrink-0 font-medium pl-1">
                      Tap thumbnail to remove
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Subheader: Active Remove Mode Indicator or Sort Bar */}
          {isDeleteMode ? (
            <div className="mx-4 my-2 p-2.5 rounded-xl bg-red-950/70 border border-red-500/40 flex items-center justify-between text-xs text-red-200">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
                <span><strong>Plant Removal Active:</strong> Tap the red trash icon on any plant to remove it.</span>
              </div>
              <button
                onClick={() => setIsDeleteMode(false)}
                className="px-2 py-0.5 rounded bg-red-800 hover:bg-red-700 text-white font-bold text-[10px]"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/40">
              <div className="flex items-center gap-1.5">
                {activeTab === 'saved' ? (
                  <span className="font-semibold text-slate-200">
                    Wishlist ({filteredPlants.length})
                  </span>
                ) : (
                  <span>
                    Showing <strong className="text-slate-200">{filteredPlants.length}</strong> plant varieties
                  </span>
                )}
              </div>

              {/* Right: View Mode Toggle & Sort selector */}
              <div className="flex items-center gap-3">
                {/* List / Grid Toggle */}
                <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1 rounded-md transition-all ${
                      viewMode === 'list'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Stitch UI List View"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1 rounded-md transition-all ${
                      viewMode === 'grid'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Grid Card View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    aria-label="Sort plants by"
                    className="bg-transparent text-slate-300 text-xs focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="featured" className="bg-slate-900 text-slate-200">Featured</option>
                    <option value="price-asc" className="bg-slate-900 text-slate-200">Price: Low to High</option>
                    <option value="price-desc" className="bg-slate-900 text-slate-200">Price: High to Low</option>
                    <option value="name" className="bg-slate-900 text-slate-200">Name (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Plant List or Grid View */}
          <div className="p-3 sm:p-4">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                <p className="text-xs">Fetching plant varieties from backend...</p>
              </div>
            ) : filteredPlants.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-3">
                <AlertCircle className="w-10 h-10 mx-auto text-slate-600" />
                <h3 className="font-bold text-slate-200 text-sm">No plants found</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  All plants in this category may have been removed or filters don't match.
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={handleResetCatalog}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-xl font-bold flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Default Plants</span>
                  </button>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-semibold border border-slate-700"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            ) : viewMode === 'list' ? (
              /* Stitch.ai UI List View (Exact Match to User Attachment) */
              <div className="bg-slate-900/90 rounded-3xl p-1.5 border border-slate-800 shadow-lg divide-y divide-slate-800/80">
                {filteredPlants.map((plant) => (
                  <PlantListItem
                    key={plant.id}
                    plant={plant}
                    isSaved={savedPlantIds.includes(plant.id)}
                    onToggleSave={(e) => handleToggleSave(e, plant.id)}
                    onSelectPlant={(p) => setSelectedPlant(p)}
                    onRemovePlant={(e, p) => handleRemovePlant(e, p)}
                    onQuickEditPrice={handleQuickEditPrice}
                    isDeleteMode={isDeleteMode}
                    isSelectionMode={isSelectionMode}
                    isSelectedForCatalogue={selectedCataloguePlantIds.includes(plant.id)}
                    onToggleCatalogueSelect={handleToggleCatalogueSelect}
                  />
                ))}
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredPlants.map((plant) => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    isSaved={savedPlantIds.includes(plant.id)}
                    onToggleSave={(e) => handleToggleSave(e, plant.id)}
                    onSelectPlant={(p) => setSelectedPlant(p)}
                    onRemovePlant={(e, p) => handleRemovePlant(e, p)}
                    onQuickEditPrice={handleQuickEditPrice}
                    isDeleteMode={isDeleteMode}
                    isSelectionMode={isSelectionMode}
                    isSelectedForCatalogue={selectedCataloguePlantIds.includes(plant.id)}
                    onToggleCatalogueSelect={handleToggleCatalogueSelect}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Bar for WhatsApp Catalogue Forwarding */}
      {selectedCataloguePlantIds.length > 0 && activeTab === 'catalog' && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-sm animate-slideUp">
          <div className="bg-[#0b141a]/95 backdrop-blur-md border border-emerald-500/50 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between gap-2 ring-2 ring-[#25D366]/20">
            <div className="flex items-center gap-2 min-w-0 pl-1">
              <div className="w-8 h-8 rounded-xl bg-[#25D366] flex items-center justify-center text-slate-950 shrink-0 shadow-md">
                <MessageCircle className="w-4 h-4 fill-slate-950" />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-xs text-white truncate">
                  {selectedCataloguePlantIds.length} Plants Selected
                </p>
                <p className="text-[10px] text-emerald-400 font-semibold truncate">
                  Ready to send WhatsApp catalogue
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsSelectionMode(!isSelectionMode)}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-200 px-2 py-1 transition-colors"
              >
                {isSelectionMode ? 'Hide Checks' : '+ Edit'}
              </button>

              <button
                onClick={() => setIsCatalogueModalOpen(true)}
                className="bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-slate-950 font-extrabold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 shadow-md shadow-[#25D366]/30 transition-transform active:scale-95"
              >
                <span>Forward</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) for Admin to Add New Plant */}
      {isAdmin && activeTab !== 'admin' && (
        <button
          onClick={() => setActiveTab('admin')}
          className="fixed bottom-20 right-6 z-40 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-400/50 transition-all hover:scale-105"
          title="Add new plant or update pricing"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-xs font-extrabold">Add Plant / Pricing</span>
        </button>
      )}

      {/* Plant Detail Modal */}
      <PlantDetailModal
        plant={selectedPlant}
        onClose={() => setSelectedPlant(null)}
        isSaved={selectedPlant ? savedPlantIds.includes(selectedPlant.id) : false}
        onToggleSave={(id) => handleToggleSave(id)}
        onAddToCart={handleAddToCart}
        onOpenAdminEdit={(plant) => {
          setSelectedPlant(null);
          setEditingPlantForAdmin(plant);
          setActiveTab('admin');
        }}
        onRemovePlant={(plant) => handleRemovePlant(undefined, plant)}
        isSelectedForCatalogue={selectedPlant ? selectedCataloguePlantIds.includes(selectedPlant.id) : false}
        onToggleCatalogueSelect={handleToggleCatalogueSelect}
        onOpenWhatsAppCatalogue={() => setIsCatalogueModalOpen(true)}
      />

      {/* Admin Login Dialog */}
      <AdminLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setActiveTab('admin');
          showToast('Signed in as Admin! Welcome to Pricing & Catalog tools.');
        }}
      />

      {/* Cart & Reservation Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
      />

      {/* WhatsApp Client Catalogue Forwarding Modal */}
      <WhatsAppCatalogueModal
        isOpen={isCatalogueModalOpen}
        onClose={() => setIsCatalogueModalOpen(false)}
        selectedPlants={selectedCataloguePlants}
        allPlants={plants}
        onToggleSelectPlant={handleToggleCatalogueSelect}
        onClearSelection={handleClearCatalogueSelection}
        onSelectAll={handleSelectAllForCatalogue}
      />
    </AndroidShell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
