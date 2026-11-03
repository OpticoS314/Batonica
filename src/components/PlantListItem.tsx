import React from 'react';
import { Heart, Trash2, Edit3, ChevronRight, CheckCircle2, Circle, MessageCircle } from 'lucide-react';
import { Plant } from '../types/plant';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/currency';

interface PlantListItemProps {
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

export const PlantListItem: React.FC<PlantListItemProps> = ({
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
      className={`group flex items-center justify-between py-3.5 px-3 rounded-2xl transition-all cursor-pointer relative border-b border-slate-800/70 ${
        isSelectedForCatalogue
          ? 'bg-emerald-950/40 hover:bg-emerald-950/60 ring-1 ring-emerald-500/50'
          : 'hover:bg-slate-800/80 active:bg-slate-800'
      }`}
    >
      {/* Left: Checkbox (if in selection mode) + Thumbnail & Plant Typography */}
      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
        {/* Selection Checkbox */}
        {isSelectionMode && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCatalogueSelect?.(plant);
            }}
            className="shrink-0 p-1 rounded-full text-slate-500 hover:text-emerald-400 transition-colors"
          >
            {isSelectedForCatalogue ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
            ) : (
              <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
            )}
          </button>
        )}

        {/* Rounded-2xl Thumbnail */}
        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700/60 shadow-sm group-hover:scale-105 transition-transform">
          <img
            src={plant.imageUrl}
            alt={plant.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80';
            }}
          />
        </div>

        {/* Plant Name & Scientific Name */}
        <div className="min-w-0 flex-1">
          <h3 className="font-serif font-bold text-slate-100 text-[15px] sm:text-base leading-snug tracking-tight group-hover:text-emerald-400 transition-colors truncate">
            {plant.name}
          </h3>
          <p className="font-serif italic text-xs text-slate-400 truncate mt-0.5">
            {plant.scientificName}
          </p>
        </div>
      </div>

      {/* Right: Price & Quick Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right">
          <div className="text-sm sm:text-base font-extrabold text-emerald-400">
            {formatPrice(plant.price)}
          </div>
          {plant.originalPrice && plant.originalPrice > plant.price && (
            <div className="text-[10px] text-slate-500 line-through">
              {formatPrice(plant.originalPrice)}
            </div>
          )}
        </div>

        {/* WhatsApp Catalogue quick toggle button */}
        {onToggleCatalogueSelect && !isDeleteMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCatalogueSelect(plant);
            }}
            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
              isSelectedForCatalogue
                ? 'bg-[#25D366] text-slate-950 font-bold shadow-sm shadow-[#25D366]/30 ring-1 ring-white/30'
                : 'text-slate-400 hover:text-[#25D366] hover:bg-emerald-950/40'
            }`}
            title={isSelectedForCatalogue ? 'Remove from WhatsApp catalogue' : 'Add to WhatsApp catalogue'}
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
          </button>
        )}

        {/* Quick Admin Price Edit button */}
        {isAdmin && onQuickEditPrice && (
          <button
            onClick={(e) => onQuickEditPrice(e, plant)}
            className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold flex items-center transition-colors"
            title="Admin: Edit Plant Pricing"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Quick Remove Plant Button (User's explicit requirement) */}
        <button
          onClick={(e) => onRemovePlant(e, plant)}
          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
            isDeleteMode
              ? 'bg-red-500 text-white animate-pulse ring-2 ring-red-400'
              : 'text-slate-500 hover:text-red-400 hover:bg-red-950/40'
          }`}
          title="Remove this plant from app"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Favorite Heart */}
        <button
          onClick={(e) => onToggleSave(e, plant.id)}
          className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors"
          title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-transform active:scale-125 ${
              isSaved ? 'fill-red-500 text-red-500' : ''
            }`}
          />
        </button>

        {!isSelectionMode && (
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
        )}
      </div>
    </div>
  );
};
