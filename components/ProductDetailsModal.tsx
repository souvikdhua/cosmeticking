import React from 'react';
import { X, Minus, Plus, AlertCircle, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { ProductPlaceholder } from './ProductPlaceholder';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  inCart: number;
  stock: number;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (productId: number) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  inCart,
  stock,
  onAddToCart,
  onRemoveFromCart
}) => {
  if (!isOpen || !product) return null;

  const isOutOfStock = stock <= 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-sm bg-[#1e293b] rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/40 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Image Section */}
        <div className="relative w-full aspect-square bg-white/5">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale opacity-50' : ''}`} 
            />
          ) : (
             <ProductPlaceholder name={product.name} />
          )}
          
          {product.off > 0 && (
             <div className="absolute bottom-4 left-4 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                {product.off}% OFF
             </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
               <div className="bg-red-500 text-white font-bold px-4 py-2 rounded-lg transform -rotate-6 shadow-xl border border-white/20">
                 OUT OF STOCK
               </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-1 overflow-y-auto no-scrollbar">
          <div className="mb-1">
             <span className="text-pink-400 text-xs font-bold uppercase tracking-wider">{product.brand}</span>
             <h2 className="text-2xl font-bold text-white leading-tight mt-1">{product.name}</h2>
             <span className="text-white/40 text-sm">{product.size}</span>
          </div>

          <p className="text-white/70 text-sm leading-relaxed mt-4 mb-6">
            {product.desc}
          </p>

          <div className="mt-auto">
            <div className="flex items-center justify-between mb-6">
               <div className="flex flex-col">
                  <span className="text-white/40 text-sm line-through">₹{product.mrp}</span>
                  <span className="text-3xl font-bold text-white">₹{product.price}</span>
               </div>
               
               {/* Cart Controls */}
               {isOutOfStock ? (
                 <div className="px-6 py-3 bg-white/5 rounded-xl text-white/40 font-medium text-sm flex items-center gap-2 border border-white/5">
                    <AlertCircle size={16}/> Unavailable
                 </div>
               ) : inCart > 0 ? (
                 <div className="flex items-center gap-4 bg-white/10 rounded-full p-1 pl-4 border border-white/10">
                    <span className="font-bold text-white text-lg w-4 text-center">{inCart}</span>
                    <div className="flex gap-1">
                      <button onClick={() => onRemoveFromCart(product.id)} className="w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all"><Minus size={18}/></button>
                      <button onClick={() => onAddToCart(product)} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all shadow-lg"><Plus size={18}/></button>
                    </div>
                 </div>
               ) : (
                 <button 
                   onClick={() => onAddToCart(product)}
                   className="px-8 py-3 bg-white text-black rounded-full font-bold text-sm uppercase tracking-wide hover:bg-gray-200 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                 >
                   <ShoppingCart size={16} fill="currentColor" /> Add to Cart
                 </button>
               )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
