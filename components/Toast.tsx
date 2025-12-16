import React from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string;
}

export const Toast: React.FC<ToastProps> = ({ message }) => (
  <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center gap-3 text-white animate-in slide-in-from-top-10 duration-500">
    <div className="bg-white/20 rounded-full p-1">
      <Check size={14} strokeWidth={3} />
    </div>
    <span className="text-sm font-medium tracking-wide drop-shadow-md">
      {message}
    </span>
  </div>
);
