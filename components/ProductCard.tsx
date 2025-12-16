import React from 'react';
import { Minus, Plus, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { ProductPlaceholder } from './ProductPlaceholder';

interface ProductCardProps {
  product: Product;
  inCart: number;
  stock: number;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (productId: number) => void;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  inCart,
  stock,
  onAddToCart,
  onRemoveFromCart,
  onOpenDetails
}) => {
  const isOutOfStock = stock <= 0;

  return (
    <div className="relative w-full aspect-[3/5] rounded-[1.5rem] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/5 bg-gray-900 group">
      {/* Clickable Area for Modal */}
      <div 
        className="absolute inset-0 cursor-pointer z-10"
        onClick={() => onOpenDetails(product)}
      >
        {/* Image */}
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[1s] group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-40' : ''}`}
          />
        ) : (
          <div className={`w-full h-full ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}>
             <ProductPlaceholder name={product.name} />
          </div>
        )}

        {/* Stock Status */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
             <div className="bg-red-500/90 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-md transform -rotate-12 shadow-lg">
               Out of Stock
             </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
      </div>

      <div className="absolute inset-0 p-4 flex flex-col justify-end pointer-events-none z-20">
        <div className="mb-2">
          {product.off > 0 && (
            <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-bold text-white mb-1 inline-block border border-white/10">
              {product.off}% OFF
            </span>
          )}
          <h3 className="text-white font-medium leading-tight line-clamp-2 drop-shadow-md text-sm">
            {product.name}
          </h3>
          <p className="text-white/60 text-[10px] line-clamp-1 mt-1 font-light leading-relaxed">
            {product.desc}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="flex flex-col">
            <span className="text-white/40 text-[10px] line-through">₹{product.mrp}</span>
            <span className="text-white text-base font-bold">₹{product.price}</span>
          </div>

          <div className="pointer-events-auto">
            {isOutOfStock ? (
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <AlertCircle size={14} className="text-white/20"/>
              </div>
            ) : inCart > 0 ? (
              <div className="h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center px-1 gap-2 border border-white/10">
                <button onClick={(e) => { e.stopPropagation(); onRemoveFromCart(product.id); }} className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-white"><Minus size={10} /></button>
                <span className="font-bold text-white text-xs">{inCart}</span>
                <button onClick={(e) => { e.stopPropagation(); onAddToCart(product); }} className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center"><Plus size={10} /></button>
              </div>
            ) : (
              <button onClick={(e) => { e.stopPropagation(); onAddToCart(product); }} className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-200 active:scale-90 transition-all shadow-lg"><Plus size={16} strokeWidth={3} /></button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
