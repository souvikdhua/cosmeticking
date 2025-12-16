import React from 'react';
import { Package, Minus, Plus, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Product, CartItems } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  cart: CartItems;
  products: Product[];
  totalItems: number;
  totalPrice: number;
  onClose: () => void;
  onClear: () => void;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (productId: number) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  cart,
  products,
  totalItems,
  totalPrice,
  onClose,
  onClear,
  onAddToCart,
  onRemoveFromCart,
  onCheckout
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute bottom-0 w-full max-w-md bg-[#1a1a1a] rounded-t-[2.5rem] shadow-2xl h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300 border-t border-white/10">
        <div className="w-full flex justify-center pt-4 pb-2" onClick={onClose}><div className="w-12 h-1 bg-white/20 rounded-full"></div></div>
        <div className="px-8 py-6 flex justify-between items-center border-b border-white/5">
          <h2 className="text-2xl font-light text-white">Cart <span className="text-white/40 text-lg">({totalItems})</span></h2>
          <button onClick={onClear} className="text-red-400 text-xs tracking-wider uppercase hover:text-red-300">Clear</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/20"><Package size={64} strokeWidth={0.5} /><p className="mt-4 font-light tracking-wide">Empty Collection</p></div>
          ) : (
            Object.entries(cart).map(([id, qty]) => {
              const product = products.find(p => p.id === parseInt(id));
              if (!product) return null;
              const quantity = qty as number;
              return (
                <div key={id} className="flex gap-4 items-center bg-white/5 p-3 rounded-[1.5rem] border border-white/5">
                  {product.image ? (
                    <img src={product.image} className="w-16 h-16 rounded-2xl object-cover opacity-80" alt={product.name}/>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center"><ImageIcon size={20} className="text-white/30"/></div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-white text-sm line-clamp-1">{product.name}</h4>
                    <p className="text-xs text-white/40 mb-3">{product.size}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-white text-lg font-light">{(product.price * quantity).toFixed(0)}</span>
                      <div className="flex items-center gap-4 bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
                        <button onClick={() => onRemoveFromCart(product.id)} className="text-white/60 hover:text-white"><Minus size={14}/></button>
                        <span className="font-medium text-white text-sm">{quantity}</span>
                        <button onClick={() => onAddToCart(product)} className="text-white/60 hover:text-white"><Plus size={14}/></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {totalItems > 0 && (
          <div className="p-8 pb-10 bg-[#1a1a1a] border-t border-white/5">
            <div className="flex justify-between items-end mb-8"><span className="text-white/40 text-xs font-bold uppercase tracking-widest">Total</span><span className="text-4xl font-light text-white tracking-tight">{totalPrice}</span></div>
            <button onClick={onCheckout} className="w-full bg-white text-black py-5 rounded-[1.5rem] font-bold text-sm tracking-widest uppercase hover:bg-gray-200 transition-colors shadow-lg active:scale-[0.98] flex items-center justify-center gap-2">Checkout via WhatsApp <ChevronRight size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
};