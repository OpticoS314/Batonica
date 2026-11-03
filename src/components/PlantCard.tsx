import React from 'react';
import { Heart, Sun, Droplets, Trash2, Edit3, ArrowRight, Sparkles, CheckCircle2, Circle, MessageCircle } from 'lucide-react';
import { Plant } from '../types/plant';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/currency';

interface PlantCardProps {
  plant: Plant;
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent, plantId: string) => void;
  onSelectPlant: (plant: Plant) => void;
  onRemovePlant: (e: React.MouseEvent, plant: Plant) => void;
  onQuickEditPrice?: (e: React.MouseEvent, plant: Plant) => void;
  isDeleteMode?: boolean;
  isSelectionMode?: boolean;
  isSelectedForCatalogue?: boolean;
  onToggleCatalogueSelect?: (plant: Plant) => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({
  plant,
  isSaved,
  onToggleSave,
  onSelectPlant,
  onRemovePlant,
  onQuickEditPrice,
  isDeleteMode = false,
  isSelectionMode = false,
  isSelectedForCatalogue = false,
  onToggleCatalogueSelect
}) => {
  const { isAdmin } = useAuth();

  const handleClick = () => {
    if (isSelectionMode && onToggleCatalogueSelect) {
      onToggleCatalogueSelect(plant);
    } else {
      onSelectPlant(plant);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group bg-slate-800/90 hover:bg-slate-800 border rounded-3xl p-3.5 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl hover:shadow-emerald-950/20 flex flex-col justify-between relative overflow-hidden ${
        isSelectedForCatalogue
          ? 'border-emerald-500/80 ring-2 ring-emerald-500/40 bg-slate-800/95'
          : 'border-slate-700/70 hover:border-emerald-500/50'
      }`}
    >
      {/* Top Media Container */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 mb-3">
        <img
          src={plant.imageUrl}
          alt={plant.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Gradient for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />

        {/* Category Pill & Selection Checkbox */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          {isSelectionMode && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCatalogueSelect?.(plant);
              }}
              className="w-7 h-7 rounded-full bg-slate-950/80 backdrop-blur-md flex items-center justify-center border border-slate-700/60"
            >
              {isSelectedForCatalogue ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
              ) : (
                <Circle className="w-4 h-4 text-slate-400" />
              )}
            </button>
          )}

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-slate-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
            {plant.category}
          </span>
        </div>

        {/* Top-Right Action Row: WhatsApp Toggle, Trash (Remove) & Heart (Wishlist) */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {/* Quick WhatsApp Catalogue toggle */}
          {onToggleCatalogueSelect && !isDeleteMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCatalogueSelect(plant);
              }}
              className={`w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                isSelectedForCatalogue
                  ? 'bg-[#25D366] text-slate-950 font-bold shadow-md shadow-[#25D366]/40'
                  : 'bg-slate-950/70 hover:bg-[#25D366] text-slate-300 hover:text-slate-950 border border-slate-700/60'
              }`}
              title={isSelectedForCatalogue ? 'Remove from WhatsApp catalogue' : 'Add to WhatsApp catalogue'}
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          {/* Quick Remove Plant Button (User's explicit requirement) */}
          <button
            onClick={(e) => onRemovePlant(e, plant)}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              isDeleteMode
                ? 'bg-red-500 text-white animate-pulse shadow-lg ring-2 ring-red-400'
                : 'bg-slate-950/70 hover:bg-red-950/90 text-slate-400 hover:text-red-400 border border-slate-700/60'
            }`}
            title="Remove this plant from catalog"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Favorite Heart Button */}
          <button
            onClick={(e) => onToggleSave(e, plant.id)}
            className="w-7 h-7 rounded-full bg-slate-950/70 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-red-400 border border-slate-700/60 transition-colors"
            title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                isSaved ? 'fill-red-500 text-red-500' : ''
              }`}
            />
          </button>
        </div>

        {/* Bottom Tags inside Image */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-slate-300">
          <div className="flex items-center gap-2 bg-slate-950/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px]">
            <span className="flex items-center gap-1 text-amber-300 font-medium">
              <Sun className="w-3 h-3" />
              <span>{plant.light.split(' ')[0]}</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-cyan-300 font-medium">
              <Droplets className="w-3 h-3" />
              <span>{plant.watering.includes('Weekly') ? 'Weekly' : 'Dry'}</span>
            </span>
          </div>

          {plant.isPetFriendly && (
            <span className="bg-emerald-950/95 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/40">
              🐾 Pet Safe
            </span>
          )}
        </div>
      </div>

      {/* Plant Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-bold text-slate-100 text-sm leading-snug line-clamp-1 group-hover:text-emerald-400 transition-colors">
              {plant.name}
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 italic line-clamp-1 mb-1.5 font-serif">
            {plant.scientificName}
          </p>

          {/* Short description */}
          <p className="text-xs text-slate-300/90 line-clamp-2 leading-relaxed mb-2 font-normal">
            {plant.shortDescription}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between mt-auto">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Price
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-emerald-400">
                {formatPrice(plant.price)}
              </span>
              {plant.originalPrice && plant.originalPrice > plant.price && (
                <span className="text-[11px] text-slate-500 line-through">
                  {formatPrice(plant.originalPrice)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isAdmin && onQuickEditPrice && (
              <button
                onClick={(e) => onQuickEditPrice(e, plant)}
                className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                title="Admin: Edit Plant Pricing"
              >
                <Edit3 className="w-3 h-3" />
                <span className="hidden sm:inline">Price</span>
              </button>
            )}

            <button
              onClick={() => onSelectPlant(plant)}
              className="w-7 h-7 rounded-xl bg-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-slate-950 text-emerald-400 flex items-center justify-center transition-all shadow-sm"
              title="View Plant Details & Short Description"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
