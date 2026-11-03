import React, { useState, useMemo } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  Phone, 
  User, 
  Sparkles, 
  Share2, 
  MessageCircle, 
  FileText, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  Plus,
  Image as ImageIcon,
  Sun,
  Droplets,
  Layers,
  Eye
} from 'lucide-react';
import { Plant } from '../types/plant';
import { formatPrice, CURRENCY } from '../utils/currency';

interface WhatsAppCatalogueModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlants: Plant[];
  allPlants: Plant[];
  onToggleSelectPlant: (plant: Plant) => void;
  onClearSelection: () => void;
  onSelectAll: () => void;
}

export const WhatsAppCatalogueModal: React.FC<WhatsAppCatalogueModalProps> = ({
  isOpen,
  onClose,
  selectedPlants,
  allPlants,
  onToggleSelectPlant,
  onClearSelection,
  onSelectAll
}) => {
  const [clientPhone, setClientPhone] = useState('');
  const [clientName, setClientName] = useState('');
  const [customGreeting, setCustomGreeting] = useState(
    'Hello! Here is our current curated plant catalogue with pricing and care details from Botanica Nursery:'
  );
  const [customClosing, setCustomClosing] = useState(
    'Please reply to this message with the plant varieties and quantities you would like reserved for pickup or delivery!'
  );
  const [includeCareInfo, setIncludeCareInfo] = useState(true);
  const [includeScientificNames, setIncludeScientificNames] = useState(true);
  const [includeDescriptions, setIncludeDescriptions] = useState(true);
  const [includeImageLinks, setIncludeImageLinks] = useState(true);
  const [previewSubMode, setPreviewSubMode] = useState<'visual' | 'text'>('visual');
  
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'customize' | 'manage'>('preview');

  // Calculate totals
  const totalItems = selectedPlants.length;
  const totalPrice = selectedPlants.reduce((sum, p) => sum + p.price, 0);

  // Clean phone number for WhatsApp wa.me link
  const sanitizePhoneNumber = (input: string): string => {
    // Remove spaces, dashes, brackets
    let cleaned = input.replace(/[^0-9+]/g, '');
    // If starts with 0 (e.g., South Africa 082 123 4567), replace leading 0 with 27
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '27' + cleaned.substring(1);
    }
    // Remove leading '+' if present for wa.me API
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    return cleaned;
  };

  // Generate formatted WhatsApp message with native WhatsApp markdown (*bold*, _italics_)
  const generatedMessage = useMemo(() => {
    if (selectedPlants.length === 0) {
      return 'No plants selected yet. Please select at least one plant to generate your catalogue.';
    }

    const dateStr = new Date().toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    let msg = `🌿 *BOTANICA NURSERY — PLANT CATALOGUE*\n`;
    msg += `📅 Date: ${dateStr}\n`;
    if (clientName.trim()) {
      msg += `👤 Prepared for: *${clientName.trim()}*\n`;
    }
    msg += `\n${customGreeting.trim()}\n\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;

    selectedPlants.forEach((plant, idx) => {
      msg += `${idx + 1}. *${plant.name}*`;
      if (includeScientificNames && plant.scientificName) {
        msg += ` (_${plant.scientificName}_)`;
      }
      msg += `\n`;
      msg += `   💰 *Price:* ${formatPrice(plant.price)}\n`;

      if (includeCareInfo) {
        msg += `   ☀️ *Light:* ${plant.light}  |  💧 *Water:* ${plant.watering}\n`;
      }

      if (includeDescriptions && plant.shortDescription) {
        msg += `   🌱 *Notes:* ${plant.shortDescription}\n`;
      }

      if (includeImageLinks && plant.imageUrl) {
        const fullPhotoUrl = plant.imageUrl.startsWith('http')
          ? plant.imageUrl
          : `${typeof window !== 'undefined' ? window.location.origin : ''}${plant.imageUrl}`;
        msg += `   🖼️ *Photo:* ${fullPhotoUrl}\n`;
      }

      msg += `\n`;
    });

    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📊 *CATALOGUE SUMMARY*\n`;
    msg += `• Total Varieties: *${totalItems} plant${totalItems === 1 ? '' : 's'}*\n`;
    msg += `• Total Catalog Value: *${formatPrice(totalPrice)}*\n`;
    msg += `• Currency: *South African Rand (${CURRENCY})*\n\n`;

    if (customClosing.trim()) {
      msg += `${customClosing.trim()}\n\n`;
    }

    msg += `📍 *Botanica Plant Nursery*\n`;
    msg += `WhatsApp Orders & Inquiries: +27 82 000 1234\n`;

    return msg;
  }, [
    selectedPlants, 
    clientName, 
    customGreeting, 
    customClosing, 
    includeCareInfo, 
    includeScientificNames, 
    includeDescriptions,
    includeImageLinks,
    totalItems, 
    totalPrice
  ]);

  // Copy catalogue to clipboard
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generatedMessage);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = generatedMessage;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  // Open WhatsApp with pre-filled message
  const handleOpenWhatsApp = () => {
    const encodedText = encodeURIComponent(generatedMessage);
    const cleanedPhone = sanitizePhoneNumber(clientPhone);

    let url = '';
    if (cleanedPhone) {
      // Direct message to the specified phone number
      url = `https://wa.me/${cleanedPhone}?text=${encodedText}`;
    } else {
      // Open WhatsApp contact / conversation picker
      url = `https://api.whatsapp.com/send?text=${encodedText}`;
    }

    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  };

  // Native share sheet (Android/Chrome)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Botanica Plant Catalogue (${totalItems} Plants)`,
          text: generatedMessage
        });
      } catch (err) {
        // User cancelled or share failed, fallback to WhatsApp link
        handleOpenWhatsApp();
      }
    } else {
      handleOpenWhatsApp();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-slideUp">
        
        {/* Header with WhatsApp Branding */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 p-4 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-inner">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-extrabold text-base tracking-tight">WhatsApp Catalogue Forwarder</h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/25">
                  Client Ready
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                {totalItems} plant{totalItems === 1 ? '' : 's'} selected ({formatPrice(totalPrice)})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 text-xs font-semibold px-3 shrink-0">
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('customize')}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'customize'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Client & Details</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'manage'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Select Plants ({totalItems})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-200 text-xs">
          
          {/* TAB 1: PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-3">
              {/* Client Quick Phone Input */}
              <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl flex flex-col sm:flex-row items-center gap-2">
                <div className="flex-1 w-full">
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Client WhatsApp Number (Optional):
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="e.g. 082 123 4567 or +27 82 123 4567"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Leave blank to open WhatsApp and select from your contacts or chats.
                  </span>
                </div>

                <div className="w-full sm:w-auto shrink-0 pt-1 sm:pt-4">
                  <button
                    onClick={() => setActiveTab('customize')}
                    className="w-full text-[11px] font-bold text-emerald-400 hover:underline text-center sm:text-right block py-1"
                  >
                    + Add Client Name / Note
                  </button>
                </div>
              </div>

              {/* Thumbnail Strip Reel of Selected Plants */}
              {selectedPlants.length > 0 && (
                <div className="bg-slate-800/60 p-2.5 rounded-2xl border border-slate-700/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                      Selected Plants Thumbnails ({totalItems})
                    </span>
                    <span className="text-[10px] text-slate-500">Tap thumbnail to remove</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                    {selectedPlants.map((plant) => (
                      <div
                        key={plant.id}
                        onClick={() => onToggleSelectPlant(plant)}
                        title={`${plant.name} - ${formatPrice(plant.price)} (Click to remove)`}
                        className="group relative shrink-0 cursor-pointer"
                      >
                        <img
                          src={plant.imageUrl}
                          alt={plant.name}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500/70 shadow-sm transition-transform group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=200&q=80';
                          }}
                        />
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500/90 hover:bg-red-600 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow">
                          ×
                        </span>
                        <p className="text-[9px] text-slate-300 font-medium truncate max-w-[50px] text-center mt-0.5">
                          {plant.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View Switcher: Visual Catalogue Cards vs WhatsApp Text */}
              <div className="flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewSubMode('visual')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                    previewSubMode === 'visual'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Visual Catalogue ({totalItems} with Thumbnails)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSubMode('text')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                    previewSubMode === 'text'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Message Text</span>
                </button>
              </div>

              {/* VIEW 1: VISUAL CATALOGUE CARDS WITH THUMBNAILS */}
              {previewSubMode === 'visual' && (
                <div className="space-y-2">
                  {selectedPlants.length === 0 ? (
                    <div className="text-center py-8 px-4 bg-slate-800/40 rounded-2xl border border-dashed border-slate-700">
                      <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-300">No plants selected in catalogue</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 mb-3">
                        Choose varieties from your inventory to create the client catalogue.
                      </p>
                      <button
                        onClick={() => setActiveTab('manage')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Select Plants Now</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {selectedPlants.map((plant, idx) => (
                        <div
                          key={plant.id}
                          className="bg-slate-800/70 hover:bg-slate-800/90 border border-slate-700/80 rounded-2xl p-2.5 flex items-center gap-3 transition-colors shadow-sm"
                        >
                          {/* Small Thumbnail Image */}
                          <div className="relative shrink-0">
                            <img
                              src={plant.imageUrl}
                              alt={plant.name}
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-slate-700 shadow shrink-0 bg-slate-900"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=200&q=80';
                              }}
                            />
                            <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shadow">
                              {idx + 1}
                            </span>
                          </div>

                          {/* Plant Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="font-bold text-xs text-white truncate">
                                {plant.name}
                              </h4>
                              <span className="font-black text-xs text-emerald-400 shrink-0">
                                {formatPrice(plant.price)}
                              </span>
                            </div>

                            {plant.scientificName && (
                              <p className="text-[10px] text-slate-400 italic truncate -mt-0.5">
                                {plant.scientificName}
                              </p>
                            )}

                            {/* Care Badges */}
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                              <span className="flex items-center gap-1 bg-slate-900/60 px-1.5 py-0.5 rounded-md border border-slate-700/50">
                                <Sun className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                <span className="truncate max-w-[85px]">{plant.light}</span>
                              </span>
                              <span className="flex items-center gap-1 bg-slate-900/60 px-1.5 py-0.5 rounded-md border border-slate-700/50">
                                <Droplets className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                                <span className="truncate max-w-[85px]">{plant.watering}</span>
                              </span>
                            </div>

                            {plant.shortDescription && (
                              <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">
                                {plant.shortDescription}
                              </p>
                            )}
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => onToggleSelectPlant(plant)}
                            title="Remove from catalogue"
                            className="p-1.5 rounded-lg hover:bg-red-950/60 text-slate-500 hover:text-red-400 transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 2: WHATSAPP MESSAGE BUBBLE SIMULATION */}
              {previewSubMode === 'text' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Live WhatsApp Message View
                    </span>
                    <span className="text-[10px] text-slate-500">Includes Photo Thumbnail Links</span>
                  </div>

                  <div className="bg-[#0b141a] p-3.5 rounded-2xl border border-slate-800 font-mono text-[11px] leading-relaxed relative shadow-inner">
                    {/* WhatsApp chat bubble */}
                    <div className="bg-[#005c4b] text-emerald-50 p-3 rounded-2xl rounded-tr-none shadow-md max-w-full overflow-x-auto whitespace-pre-wrap">
                      {generatedMessage}
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-500 font-sans">
                      <span>Ready to send</span>
                      <span className="text-emerald-400 font-bold">✓✓</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary Pill */}
              <div className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs">
                <span className="text-slate-300">
                  <strong className="text-white font-bold">{totalItems}</strong> plant{totalItems === 1 ? '' : 's'} in catalogue
                </span>
                <span className="text-emerald-400 font-extrabold text-sm">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOMIZE DETAILS */}
          {activeTab === 'customize' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Client / Customer Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Sarah van der Merwe / Urban Oasis Studio"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Client WhatsApp Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="e.g. +27 82 123 4567 or 082 123 4567"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setClientPhone('+27 ')}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] text-slate-300"
                  >
                    +27 (South Africa)
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientPhone('')}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] text-slate-400"
                  >
                    Clear Number
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Introductory Greeting Note
                </label>
                <textarea
                  rows={2}
                  value={customGreeting}
                  onChange={(e) => setCustomGreeting(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Closing Call-to-Action Note
                </label>
                <textarea
                  rows={2}
                  value={customClosing}
                  onChange={(e) => setCustomClosing(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Toggles */}
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
                <span className="block font-bold text-xs text-slate-300 mb-1">Include in Catalogue:</span>
                
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={includeImageLinks}
                    onChange={(e) => setIncludeImageLinks(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-slate-900 border-slate-700"
                  />
                  <span>Plant Photo Preview Links (Enables image cards in WhatsApp)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={includeCareInfo}
                    onChange={(e) => setIncludeCareInfo(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-slate-900 border-slate-700"
                  />
                  <span>Light & Watering Care Instructions</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={includeDescriptions}
                    onChange={(e) => setIncludeDescriptions(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-slate-900 border-slate-700"
                  />
                  <span>Plant Botanical Descriptions</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={includeScientificNames}
                    onChange={(e) => setIncludeScientificNames(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-slate-900 border-slate-700"
                  />
                  <span>Latin Scientific Names (in italics)</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGE SELECTED PLANTS */}
          {activeTab === 'manage' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-semibold">
                  {totalItems} of {allPlants.length} plants selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onSelectAll}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
                  >
                    Select All ({allPlants.length})
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    onClick={onClearSelection}
                    className="text-[11px] font-bold text-slate-400 hover:text-red-400"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Quick toggle list with small thumbnail images */}
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {allPlants.map(plant => {
                  const isChecked = selectedPlants.some(p => p.id === plant.id);
                  return (
                    <div
                      key={plant.id}
                      onClick={() => onToggleSelectPlant(plant)}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-950/40 border-emerald-500/60 text-white shadow-sm ring-1 ring-emerald-500/30'
                          : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent onClick
                          className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-slate-900 border-slate-700 shrink-0"
                        />
                        {/* Small plant thumbnail */}
                        <img
                          src={plant.imageUrl}
                          alt={plant.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-sm shrink-0 bg-slate-900"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=200&q=80';
                          }}
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-xs truncate text-white">{plant.name}</p>
                          <p className="text-[10px] text-slate-400 truncate italic">{plant.scientificName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-400">
                            <span>{plant.light}</span>
                            <span>•</span>
                            <span>{plant.category}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <span className="font-black text-xs text-emerald-400 block">
                          {formatPrice(plant.price)}
                        </span>
                        <span className={`text-[9px] font-semibold ${isChecked ? 'text-emerald-300' : 'text-slate-500'}`}>
                          {isChecked ? 'Included' : '+ Add'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Copy Button */}
            <button
              onClick={handleCopyText}
              className="w-full py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Catalogue Text</span>
                </>
              )}
            </button>

            {/* Primary WhatsApp Share Button */}
            <button
              onClick={handleOpenWhatsApp}
              disabled={totalItems === 0}
              className="w-full py-2.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              <span>Forward on WhatsApp</span>
              <Send className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          {/* Quick Native Share Alternative */}
          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <button
              onClick={handleNativeShare}
              disabled={totalItems === 0}
              className="w-full py-1.5 text-center text-[11px] text-slate-400 hover:text-emerald-400 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3 h-3" />
              <span>More sharing options (Android Share Sheet)</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
