import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, CheckCircle2, Plus, Minus } from 'lucide-react';
import { CartItem } from '../types/plant';
import { formatPrice } from '../utils/currency';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (plantId: string, delta: number) => void;
  onRemoveItem: (plantId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}) => {
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + (item.plant.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleCheckout = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClearCart();
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col z-10 animate-slideLeft">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-sm">Your Plant Adoption Bag</h2>
              <p className="text-[11px] text-slate-400">{items.length} species selected</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {isSuccess ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-white">Order Confirmed!</h3>
              <p className="text-xs text-slate-300">
                Your plants have been reserved at the nursery. We are carefully inspecting foliage and roots for pickup!
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
              <ShoppingBag className="w-12 h-12 stroke-1" />
              <p className="text-sm font-medium text-slate-400">Your bag is empty</p>
              <p className="text-xs text-slate-500 max-w-xs">
                Explore our botanical collection and tap "Adopt Plant" to reserve your favorites.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.plant.id}
                className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 flex gap-3 items-center"
              >
                <img
                  src={item.plant.imageUrl}
                  alt={item.plant.name}
                  className="w-16 h-16 rounded-xl object-cover bg-slate-950 shrink-0 border border-slate-700"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-slate-100 truncate">{item.plant.name}</h4>
                  <div className="text-[11px] text-slate-400 italic font-serif">{item.plant.scientificName}</div>
                  <div className="text-xs font-extrabold text-emerald-400 mt-0.5">
                    {formatPrice(item.plant.price * item.quantity)}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => onRemoveItem(item.plant.id)}
                    className="text-slate-500 hover:text-red-400 p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg p-0.5">
                    <button
                      onClick={() => onUpdateQuantity(item.plant.id, -1)}
                      className="w-5 h-5 rounded hover:bg-slate-800 text-slate-300 flex items-center justify-center text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center text-slate-200">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.plant.id, 1)}
                      className="w-5 h-5 rounded hover:bg-slate-800 text-slate-300 flex items-center justify-center text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {items.length > 0 && !isSuccess && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-200 font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Nursery Tax</span>
                <span className="text-slate-200 font-semibold">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-slate-800">
                <span>Total</span>
                <span className="text-emerald-400 font-extrabold">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-[0.98]"
            >
              <span>Complete Reservation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
