import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  Sun, 
  Droplets, 
  Wind, 
  ShieldCheck, 
  ShoppingBag, 
  Sparkles, 
  Check, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  Trash2,
  MessageCircle,
  Send
} from 'lucide-react';
import { Plant } from '../types/plant';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/currency';

interface PlantDetailModalProps {
  plant: Plant | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (plantId: string) => void;
  onAddToCart: (plant: Plant) => void;
  onOpenAdminEdit: (plant: Plant) => void;
  onRemovePlant: (plant: Plant) => void;
  isSelectedForCatalogue?: boolean;
  onToggleCatalogueSelect?: (plant: Plant) => void;
  onOpenWhatsAppCatalogue?: () => void;
}

export const PlantDetailModal: React.FC<PlantDetailModalProps> = ({
  plant,
  onClose,
  isSaved,
  onToggleSave,
  onAddToCart,
  onOpenAdminEdit,
  onRemovePlant,
  isSelectedForCatalogue = false,
  onToggleCatalogueSelect,
  onOpenWhatsAppCatalogue
}) => {
  const { isAdmin } = useAuth();
  const [activeImage, setActiveImage] = useState<string>('');
  const [addedNotice, setAddedNotice] = useState<boolean>(false);

  // Synchronize active image whenever plant changes
  useEffect(() => {
    if (plant?.imageUrl) {
      setActiveImage(plant.imageUrl);
    }
  }, [plant?.imageUrl]);

  if (!plant) return null;

  const images = [plant.imageUrl, ...(plant.additionalImages || [])];

  const handleAdd = () => {
    onAddToCart(plant);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const isAvailable = plant.inStock !== false && (plant.stockQuantity ?? 1) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal / Android Bottom Sheet Container */}
      <div 
        className="relative w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-y-auto flex flex-col z-10 no-scrollbar animate-slideUp"
      >
        {/* Android Sheet Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto mt-3 mb-1 shrink-0 sm:hidden"></div>

        {/* Hero Photo Carousel / Viewer */}
        <div className="relative w-full aspect-[16/10] bg-slate-950 overflow-hidden shrink-0">
          <img
            src={activeImage}
            alt={plant.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80';
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/30" />

          {/* Top Actions */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
              {plant.category}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (confirm(`Remove "${plant.name}" from the app catalog?`)) {
                    onRemovePlant(plant);
                    onClose();
                  }
                }}
                className="w-9 h-9 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-red-400 hover:border-red-500/40 transition-colors"
                title="Remove this plant from catalog"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onToggleSave(plant.id)}
                className="w-9 h-9 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-red-400 transition-colors"
                title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
              </button>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Thumbnails if multiple images */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-4 flex gap-2 z-10">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-9 h-9 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === img ? 'border-emerald-400 scale-105' : 'border-slate-700/80 opacity-70'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Pet Friendly Pill */}
          <div className="absolute bottom-3 right-4 z-10">
            {plant.isPetFriendly ? (
              <span className="bg-emerald-950/90 text-emerald-300 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1 backdrop-blur-sm">
                🐾 Pet Friendly
              </span>
            ) : (
              <span className="bg-slate-900/80 text-amber-300 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center gap-1 backdrop-blur-sm">
                ⚠️ Toxic to Pets
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col space-y-5">
          {/* Header & Botanical Name */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {plant.name}
                </h1>
                <p className="text-sm text-slate-400 italic font-serif">
                  {plant.scientificName}
                </p>
              </div>

              {/* Prominent Price Display */}
              <div className="text-right">
                <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                  Plant Price
                </div>
                <div className="flex items-baseline gap-1.5 justify-end">
                  <span className="text-2xl font-black text-emerald-400">
                    {formatPrice(plant.price)}
                  </span>
                  {plant.originalPrice && plant.originalPrice > plant.price && (
                    <span className="text-xs text-slate-500 line-through">
                      {formatPrice(plant.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Quick Action Button */}
            {isAdmin && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Admin Mode Active</span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdminEdit(plant);
                  }}
                  className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Plant & Pricing</span>
                </button>
              </div>
            )}
          </div>

          {/* Short Description (User's primary requirement: click plant -> short description and price) */}
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plant Overview</span>
            </h2>
            <p className="text-slate-200 text-sm leading-relaxed">
              {plant.shortDescription}
            </p>
          </div>

          {/* Plant Care Metrics Cards */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Plant Care Requirements
            </h2>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col items-center text-center">
                <Sun className="w-5 h-5 text-amber-400 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-medium">Sunlight</span>
                <span className="text-xs font-semibold text-slate-200 mt-0.5">{plant.light}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col items-center text-center">
                <Droplets className="w-5 h-5 text-cyan-400 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-medium">Watering</span>
                <span className="text-xs font-semibold text-slate-200 mt-0.5">{plant.watering}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col items-center text-center">
                <Wind className="w-5 h-5 text-purple-400 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-medium">Difficulty</span>
                <span className="text-xs font-semibold text-slate-200 mt-0.5">{plant.difficulty}</span>
              </div>
            </div>
          </div>

          {/* Detailed Botanical Description */}
          {plant.fullDescription && (
            <div className="text-xs text-slate-300 leading-relaxed space-y-1">
              <h2 className="font-semibold text-slate-200">About this specimen:</h2>
              <p>{plant.fullDescription}</p>
            </div>
          )}

          {/* Bottom Action Button */}
          <div className="pt-2">
            <button
              onClick={handleAdd}
              disabled={!isAvailable}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${
                addedNotice
                  ? 'bg-emerald-600 text-white'
                  : isAvailable
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/40'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              {addedNotice ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Added to Nursery Cart!</span>
                </>
              ) : isAvailable ? (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>Adopt Plant • {formatPrice(plant.price)}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5" />
                  <span>Currently Out of Stock</span>
                </>
              )}
            </button>
          </div>

          {/* WhatsApp Catalogue Forwarding Action */}
          {onToggleCatalogueSelect && (
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onToggleCatalogueSelect(plant);
                }}
                className={`flex-1 py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border ${
                  isSelectedForCatalogue
                    ? 'bg-[#25D366]/20 border-[#25D366] text-[#25D366]'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
              >
                <MessageCircle className="w-4 h-4 fill-current text-[#25D366]" />
                <span>
                  {isSelectedForCatalogue
                    ? 'In WhatsApp Catalogue ✓'
                    : '+ Add to WhatsApp Catalogue'}
                </span>
              </button>

              {onOpenWhatsAppCatalogue && (
                <button
                  type="button"
                  onClick={() => {
                    if (!isSelectedForCatalogue) {
                      onToggleCatalogueSelect(plant);
                    }
                    onClose();
                    onOpenWhatsAppCatalogue();
                  }}
                  className="py-2.5 px-3 rounded-2xl font-bold text-xs bg-[#25D366] hover:bg-[#20ba59] text-slate-950 flex items-center gap-1.5 shadow-md shadow-[#25D366]/20 transition-all active:scale-95"
                  title="Forward Catalogue Now"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Forward</span>
                </button>
              )}
            </div>
          )}

          {/* Secondary: Remove Plant from Catalog */}
          <div className="pt-1">
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to remove "${plant.name}" from the app catalog?`)) {
                  onRemovePlant(plant);
                  onClose();
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-950/30 border border-slate-800 hover:border-red-900/40 flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" />
              <span>Remove Plant from Catalog</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
