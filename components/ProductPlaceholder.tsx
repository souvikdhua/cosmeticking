import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ProductPlaceholderProps {
  name: string;
}

export const ProductPlaceholder: React.FC<ProductPlaceholderProps> = ({ name }) => (
  <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center p-4 text-center">
    <ImageIcon size={32} className="text-slate-300 mb-2" />
    <span className="text-xs text-slate-400 font-medium tracking-wide">
      {name || "Image"}
    </span>
  </div>
);
