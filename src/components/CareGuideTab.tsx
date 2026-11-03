import React, { useState } from 'react';
import { Sun, Droplets, Wind, ShieldAlert, Sparkles, CheckCircle2, Search } from 'lucide-react';
import { Plant } from '../types/plant';
import { formatPrice } from '../utils/currency';

interface CareGuideTabProps {
  plants: Plant[];
  onSelectPlant: (plant: Plant) => void;
}

export const CareGuideTab: React.FC<CareGuideTabProps> = ({ plants, onSelectPlant }) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Low Light' | 'Pet Safe' | 'Air Purifier'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = plants.filter(plant => {
    const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeFilter === 'Low Light') return matchesSearch && (plant.light.includes('Low') || plant.category === 'Low Light');
    if (activeFilter === 'Pet Safe') return matchesSearch && plant.isPetFriendly;
    if (activeFilter === 'Air Purifier') return matchesSearch && (plant.category === 'Air Purifying' || plant.tags.includes('Air Purifier'));
    return matchesSearch;
  });

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span>Botanica Care Guide</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Master lighting, soil moisture, and indoor care for your plant collection
        </p>
      </div>

      {/* Quick Care Rule Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs mb-1">
            <Sun className="w-4 h-4" />
            <span>Light Golden Rule</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Bright indirect light is ideal for most tropical foliage. Avoid intense midday direct rays that scorch leaf tissue.
          </p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs mb-1">
            <Droplets className="w-4 h-4" />
            <span>The Knuckle Test</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Insert finger 1-2 inches into potting mix. If dry, water deeply until water drains freely from nursery pot holes.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
        {(['All', 'Low Light', 'Pet Safe', 'Air Purifier'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === tab
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Plant Care Directory */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Species Care Cheat Sheet ({filtered.length})
        </h3>

        {filtered.map(plant => (
          <div
            key={plant.id}
            onClick={() => onSelectPlant(plant)}
            className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={plant.imageUrl}
                alt={plant.name}
                className="w-12 h-12 rounded-xl object-cover bg-slate-950 shrink-0 border border-slate-700"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-slate-100 truncate">{plant.name}</h4>
                <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="text-amber-300">☀️ {plant.light}</span>
                  <span>•</span>
                  <span className="text-cyan-300">💧 {plant.watering}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs font-extrabold text-emerald-400">{formatPrice(plant.price)}</div>
              <span className="text-[10px] text-slate-400 block">{plant.difficulty}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
