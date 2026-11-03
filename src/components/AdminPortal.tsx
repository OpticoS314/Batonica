import React, { useState, useRef } from 'react';
import { 
  DollarSign, 
  PlusCircle, 
  Image as ImageIcon, 
  Upload, 
  Save, 
  Check, 
  Trash2, 
  RotateCcw, 
  Sparkles, 
  Sun, 
  Droplets, 
  ShieldCheck, 
  LogOut, 
  Search, 
  SlidersHorizontal, 
  CheckCircle2, 
  ArrowLeft,
  Eye,
  Layers
} from 'lucide-react';
import { Plant, PlantCategory, LightLevel, WateringFrequency, CareDifficulty } from '../types/plant';
import { BOTANICAL_PHOTO_PRESETS } from '../data/seedPlants';
import { useAuth } from '../context/AuthContext';
import { formatPrice, CURRENCY } from '../utils/currency';

interface AdminPortalProps {
  plants: Plant[];
  onUpdatePricing: (plantId: string, price: number) => Promise<void>;
  onCreatePlant: (newPlant: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onDeletePlant: (plantId: string) => Promise<void>;
  onResetCatalog: () => Promise<void>;
  onClose: () => void;
  onSelectPlantToPreview: (plant: Plant) => void;
  initialEditPlant?: Plant | null;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  plants,
  onUpdatePricing,
  onCreatePlant,
  onDeletePlant,
  onResetCatalog,
  onClose,
  onSelectPlantToPreview,
  initialEditPlant
}) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'pricing' | 'add' | 'manage'>(
    initialEditPlant ? 'pricing' : 'pricing'
  );

  // Search & filter for pricing tab
  const [pricingSearch, setPricingSearch] = useState('');
  const [pricingCategoryFilter, setPricingCategoryFilter] = useState<string>('All');
  
  // Local state for pricing edits { [plantId]: { price: number } }
  const [pricingDrafts, setPricingDrafts] = useState<{
    [plantId: string]: {
      price: number;
      isDirty: boolean;
      isSaving: boolean;
      savedNotice: boolean;
    };
  }>(() => {
    const drafts: any = {};
    plants.forEach(p => {
      drafts[p.id] = {
        price: p.price,
        isDirty: false,
        isSaving: false,
        savedNotice: false,
      };
    });
    return drafts;
  });

  // --- Add New Plant Form State ---
  const [newPlantName, setNewPlantName] = useState('');
  const [newScientificName, setNewScientificName] = useState('');
  const [newCategory, setNewCategory] = useState<PlantCategory>('Indoor');
  const [newShortDesc, setNewShortDesc] = useState('');
  const [newFullDesc, setNewFullDesc] = useState('');
  const [newPrice, setNewPrice] = useState<string>('28.00');
  const [newStock, setNewStock] = useState<string>('15');
  const [newLight, setNewLight] = useState<LightLevel>('Indirect Bright');
  const [newWatering, setNewWatering] = useState<WateringFrequency>('Weekly');
  const [newDifficulty, setNewDifficulty] = useState<CareDifficulty>('Easy Care');
  const [newIsPetFriendly, setNewIsPetFriendly] = useState<boolean>(false);
  
  // Photo states for add plant
  const [photoMode, setPhotoMode] = useState<'presets' | 'url' | 'upload'>('presets');
  const [photoUrl, setPhotoUrl] = useState<string>(BOTANICAL_PHOTO_PRESETS[0].url);
  const [customPhotoInput, setCustomPhotoInput] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status message
  const [actionNotice, setActionNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setActionNotice({ text, type });
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Keep pricingDrafts in sync if plants change externally
  React.useEffect(() => {
    setPricingDrafts(prev => {
      const next = { ...prev };
      plants.forEach(p => {
        if (!next[p.id]) {
          next[p.id] = {
            price: p.price,
            isDirty: false,
            isSaving: false,
            savedNotice: false,
          };
        }
      });
      return next;
    });
  }, [plants]);

  // Handle Plant Price change in Pricing Manager
  const handleBasePriceChange = (plantId: string, val: number) => {
    setPricingDrafts(prev => {
      const current = prev[plantId];
      if (!current) return prev;
      return {
        ...prev,
        [plantId]: {
          ...current,
          price: Math.max(0, val),
          isDirty: true
        }
      };
    });
  };

  // Save pricing changes for a specific plant
  const handleSavePlantPricing = async (plantId: string) => {
    const draft = pricingDrafts[plantId];
    if (!draft) return;

    setPricingDrafts(prev => ({
      ...prev,
      [plantId]: { ...prev[plantId], isSaving: true }
    }));

    try {
      await onUpdatePricing(plantId, draft.price);
      setPricingDrafts(prev => ({
        ...prev,
        [plantId]: { 
          ...prev[plantId], 
          isSaving: false, 
          isDirty: false, 
          savedNotice: true 
        }
      }));
      showNotification('Plant price updated successfully!');
      setTimeout(() => {
        setPricingDrafts(prev => ({
          ...prev,
          [plantId]: { ...prev[plantId], savedNotice: false }
        }));
      }, 2000);
    } catch (e) {
      setPricingDrafts(prev => ({
        ...prev,
        [plantId]: { ...prev[plantId], isSaving: false }
      }));
      showNotification('Failed to update pricing', 'error');
    }
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setPhotoUrl(event.target.result);
        showNotification('Photo uploaded successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit new plant
  const handleCreateNewPlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlantName.trim()) {
      showNotification('Plant name is required', 'error');
      return;
    }
    if (!newShortDesc.trim()) {
      showNotification('Short description is required', 'error');
      return;
    }

    const basePriceNum = parseFloat(newPrice) || 28.00;
    const stockNum = parseInt(newStock) || 10;

    setIsSubmittingNew(true);

    try {
      await onCreatePlant({
        name: newPlantName.trim(),
        scientificName: newScientificName.trim() || newPlantName.trim(),
        category: newCategory,
        shortDescription: newShortDesc.trim(),
        fullDescription: newFullDesc.trim() || newShortDesc.trim(),
        price: basePriceNum,
        stockQuantity: stockNum,
        imageUrl: photoUrl || BOTANICAL_PHOTO_PRESETS[0].url,
        light: newLight,
        watering: newWatering,
        humidity: 'Medium',
        difficulty: newDifficulty,
        isPetFriendly: newIsPetFriendly,
        tags: [newCategory, newDifficulty],
      });

      showNotification(`"${newPlantName}" successfully added to plant catalog!`);
      // Reset form
      setNewPlantName('');
      setNewScientificName('');
      setNewShortDesc('');
      setNewFullDesc('');
      setNewPrice('28.00');
      setActiveTab('pricing');
    } catch (err) {
      showNotification('Failed to create plant', 'error');
    } finally {
      setIsSubmittingNew(false);
    }
  };

  // Filtered plants for pricing tab
  const filteredPricingPlants = plants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(pricingSearch.toLowerCase()) ||
                          p.scientificName.toLowerCase().includes(pricingSearch.toLowerCase());
    const matchesCat = pricingCategoryFilter === 'All' || p.category === pricingCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-900 text-slate-100 min-h-full">
      {/* Admin Top App Bar */}
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
            title="Return to Catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-white">Admin Workspace</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                Authorized
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Add Pricing, New Plants & Photos</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-red-950/50 hover:text-red-400 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
            title="Sign out of Admin mode"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div
          className={`px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            actionNotice.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="bg-slate-950/60 border-b border-slate-800 px-4 py-2 flex items-center gap-2 shrink-0 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'pricing'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Manage Pricing ({plants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'add'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Plant & Photos</span>
        </button>

        <button
          onClick={() => setActiveTab('manage')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'manage'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Catalog Tools</span>
        </button>
      </div>

      {/* TAB 1: PLANT PRICING MANAGER */}
      {activeTab === 'pricing' && (
        <div className="p-4 flex-1 flex flex-col space-y-4">
          {/* Search & Filter Header */}
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={pricingSearch}
                onChange={(e) => setPricingSearch(e.target.value)}
                placeholder="Search plant by name..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={pricingCategoryFilter}
              onChange={(e) => setPricingCategoryFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Categories</option>
              <option value="Indoor">Indoor</option>
              <option value="Foliage">Foliage</option>
              <option value="Low Light">Low Light</option>
              <option value="Air Purifying">Air Purifying</option>
              <option value="Succulents">Succulents</option>
              <option value="Flowering">Flowering</option>
              <option value="Pet Friendly">Pet Friendly</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Showing {filteredPricingPlants.length} plant types</span>
            <span className="text-[11px] text-emerald-400">Updates sync in real-time</span>
          </div>

          {/* Plant Pricing Cards List */}
          <div className="space-y-3 pb-8">
            {filteredPricingPlants.map(plant => {
              const draft = pricingDrafts[plant.id] || {
                price: plant.price,
                isDirty: false,
                isSaving: false,
                savedNotice: false,
              };

              return (
                <div
                  key={plant.id}
                  className={`bg-slate-800/80 border rounded-2xl p-3.5 transition-all ${
                    draft.isDirty
                      ? 'border-emerald-500/80 bg-slate-800/95 ring-1 ring-emerald-500/30'
                      : 'border-slate-700/60'
                  }`}
                >
                  {/* Top Plant Row */}
                  <div className="flex items-center gap-3">
                    <img
                      src={plant.imageUrl}
                      alt={plant.name}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-950 shrink-0 border border-slate-700"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-slate-100 truncate">
                          {plant.name}
                        </h3>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-900 text-emerald-300 border border-emerald-500/30 shrink-0">
                          {plant.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 italic truncate mb-1">
                        {plant.scientificName}
                      </p>

                      {/* Base Price Quick Input Controls */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400">Base Price:</span>
                        <div className="relative w-24">
                          <span className="absolute left-2.5 top-1 text-xs text-slate-400 font-bold">{CURRENCY}</span>
                          <input
                            type="number"
                            step="0.50"
                            min="1"
                            value={draft.price}
                            onChange={(e) => handleBasePriceChange(plant.id, parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-6 pr-2 py-0.5 text-xs font-extrabold text-emerald-400 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        {/* Quick +/- buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleBasePriceChange(plant.id, Math.max(1, draft.price - 1))}
                            className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-xs font-bold text-slate-200 flex items-center justify-center"
                            title="Decrease R1"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleBasePriceChange(plant.id, draft.price + 1)}
                            className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-xs font-bold text-slate-200 flex items-center justify-center"
                            title="Increase R1"
                          >
                            +1
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Save or Preview Action Button */}
                    <div className="flex flex-col gap-1.5 items-end">
                      <button
                        onClick={() => handleSavePlantPricing(plant.id)}
                        disabled={draft.isSaving}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                          draft.savedNotice
                            ? 'bg-emerald-600 text-white'
                            : draft.isDirty
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold animate-pulse'
                            : 'bg-slate-700/80 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {draft.isSaving ? (
                          <span>Saving...</span>
                        ) : draft.savedNotice ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>{draft.isDirty ? 'Save Price' : 'Saved'}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => onSelectPlantToPreview(plant)}
                        className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 py-0.5"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Preview</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ADD NEW PLANT & PHOTOS */}
      {activeTab === 'add' && (
        <div className="p-4 flex-1 flex flex-col max-w-2xl mx-auto w-full pb-10">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <h2 className="font-bold text-base text-white">Add New Plant Variety</h2>
                <p className="text-xs text-slate-400">Configure descriptions, pricing, and plant photography</p>
              </div>
            </div>

            <form onSubmit={handleCreateNewPlant} className="space-y-4">
              {/* Plant Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Plant Common Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPlantName}
                    onChange={(e) => setNewPlantName(e.target.value)}
                    placeholder="e.g. String of Hearts Variegated"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Botanical / Scientific Name
                  </label>
                  <input
                    type="text"
                    value={newScientificName}
                    onChange={(e) => setNewScientificName(e.target.value)}
                    placeholder="e.g. Ceropegia woodii"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Category & Base Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as PlantCategory)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Indoor">Indoor</option>
                    <option value="Foliage">Foliage</option>
                    <option value="Low Light">Low Light</option>
                    <option value="Air Purifying">Air Purifying</option>
                    <option value="Succulents">Succulents</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Pet Friendly">Pet Friendly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Base Pricing ({CURRENCY}) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">{CURRENCY}</span>
                    <input
                      type="number"
                      step="0.50"
                      required
                      min="1"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="28.00"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-xs font-bold text-emerald-400 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Initial Stock Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    placeholder="15"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Short Description (Crucial user requirement) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Short Description (Shown when clicked in app) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={newShortDesc}
                  onChange={(e) => setNewShortDesc(e.target.value)}
                  placeholder="Compact overview highlighting distinctive foliage, watering cues, and aesthetic appeal..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Full Botanical Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Description & Care Guide
                </label>
                <textarea
                  rows={3}
                  value={newFullDesc}
                  onChange={(e) => setNewFullDesc(e.target.value)}
                  placeholder="Detailed botanical background, potting mix instructions, and propagation tips..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Care Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Light Needs</label>
                  <select
                    value={newLight}
                    onChange={(e) => setNewLight(e.target.value as LightLevel)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-300"
                  >
                    <option value="Indirect Bright">Indirect Bright</option>
                    <option value="Low to Medium">Low to Medium</option>
                    <option value="Low Light">Low Light</option>
                    <option value="Direct Sunlight">Direct Sunlight</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Watering</label>
                  <select
                    value={newWatering}
                    onChange={(e) => setNewWatering(e.target.value as WateringFrequency)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-300"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="When Topsoil is Dry">When Dry</option>
                    <option value="Every 1-2 Weeks">1-2 Weeks</option>
                    <option value="Every 2-3 Weeks">2-3 Weeks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as CareDifficulty)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-300"
                  >
                    <option value="Easy Care">Easy Care</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Green Thumb">Green Thumb</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-900 p-2 rounded-lg border border-slate-700 text-xs text-slate-300 hover:border-emerald-500/50">
                    <input
                      type="checkbox"
                      checked={newIsPetFriendly}
                      onChange={(e) => setNewIsPetFriendly(e.target.checked)}
                      className="rounded accent-emerald-500 w-4 h-4"
                    />
                    <span className="font-semibold text-[11px]">Pet Friendly</span>
                  </label>
                </div>
              </div>

              {/* PHOTO SELECTION SECTION */}
              <div className="pt-2 border-t border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span>Plant Photo & Gallery Source *</span>
                  </label>

                  {/* Mode switcher */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPhotoMode('presets')}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                        photoMode === 'presets' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoMode('upload')}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                        photoMode === 'upload' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoMode('url')}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                        photoMode === 'url' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {/* Preset Gallery Picker */}
                {photoMode === 'presets' && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3">
                    {BOTANICAL_PHOTO_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPhotoUrl(preset.url)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                          photoUrl === preset.url ? 'border-emerald-400 scale-105 shadow-lg' : 'border-slate-700 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[9px] text-center truncate py-0.5 text-slate-300">
                          {preset.tag}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Upload File Input */}
                {photoMode === 'upload' && (
                  <div className="mb-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-4 px-4 border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl bg-slate-900/60 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <Upload className="w-6 h-6 text-emerald-400" />
                      <span className="text-xs font-semibold">Click to select image file from device</span>
                      <span className="text-[10px] text-slate-500">Supports PNG, JPG, WebP</span>
                    </button>
                  </div>
                )}

                {/* Custom URL Input */}
                {photoMode === 'url' && (
                  <div className="flex gap-2 mb-3">
                    <input
                      type="url"
                      value={customPhotoInput}
                      onChange={(e) => setCustomPhotoInput(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customPhotoInput) {
                          setPhotoUrl(customPhotoInput);
                          showNotification('Custom photo URL applied!');
                        }
                      }}
                      className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-semibold text-slate-200"
                    >
                      Apply
                    </button>
                  </div>
                )}

                {/* Current Photo Preview */}
                {photoUrl && (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-700/60">
                    <img
                      src={photoUrl}
                      alt="Selected preview"
                      className="w-16 h-16 rounded-lg object-cover bg-slate-950 shrink-0 border border-slate-700"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="font-bold text-slate-200">Selected Photo Preview</div>
                      <div className="text-[11px] text-slate-400 truncate">{photoUrl}</div>
                      <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Ready for catalog publication</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-[0.98]"
                >
                  {isSubmittingNew ? (
                    <span>Publishing to Catalog...</span>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      <span>Publish New Plant to Android Catalog</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: CATALOG TOOLS */}
      {activeTab === 'manage' && (
        <div className="p-4 flex-1 flex flex-col max-w-xl mx-auto w-full space-y-4 pb-12">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-center">
              <div className="text-xl font-extrabold text-emerald-400">{plants.length}</div>
              <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Total Plants</div>
            </div>

            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-center">
              <div className="text-xl font-extrabold text-white">
                {CURRENCY}{(plants.reduce((sum, p) => sum + p.price, 0) / (plants.length || 1)).toFixed(1)}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Avg Price</div>
            </div>

            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-center">
              <div className="text-xl font-extrabold text-purple-400">
                {plants.filter(p => p.isPetFriendly).length}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Pet Friendly</div>
            </div>
          </div>

          {/* Plant Removal / Management List */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
            <h3 className="font-bold text-sm text-slate-100 mb-2">Delete or Remove Plants</h3>
            <p className="text-xs text-slate-400 mb-3">Remove obsolete varieties from live catalog</p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 no-scrollbar">
              {plants.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-700/60 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={p.imageUrl} alt="" className="w-8 h-8 rounded object-cover" />
                    <div className="truncate">
                      <span className="font-semibold text-slate-200">{p.name}</span>
                      <span className="text-[10px] text-emerald-400 ml-1.5 font-bold">{formatPrice(p.price)}</span>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      if (confirm(`Are you sure you want to remove "${p.name}"?`)) {
                        await onDeletePlant(p.id);
                        showNotification(`Removed "${p.name}"`);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Delete plant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Factory Reset Catalog */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
            <h3 className="font-bold text-sm text-slate-100 mb-1">Reset to Original Plant Dataset</h3>
            <p className="text-xs text-slate-400 mb-3">
              Restores default botanical catalogue with 12 popular houseplant varieties and initial pricing.
            </p>

            <button
              onClick={async () => {
                if (confirm('Reset catalog back to the initial 12 houseplants and seed prices?')) {
                  await onResetCatalog();
                  showNotification('Catalog successfully reset to default plants!');
                }
              }}
              className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-red-950/60 hover:text-red-300 border border-slate-600 text-xs font-bold text-slate-200 flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Catalog to Defaults</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
