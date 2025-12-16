import React, { useRef } from 'react';
import { User, History, ClipboardList, Trash2, Plus, X, Save, Search, Camera, Edit2, Minus, Tag, LogOut } from 'lucide-react';
import { Product, Order, Inventory, ProfileTabState, NewProductForm } from '../types';

interface AdminPanelProps {
  profileTab: ProfileTabState;
  setProfileTab: (tab: ProfileTabState) => void;
  orderHistory: Order[];
  products: Product[];
  inventory: Inventory;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isAddingProduct: boolean;
  setIsAddingProduct: (isAdding: boolean) => void;
  newProductForm: NewProductForm;
  setNewProductForm: (form: NewProductForm) => void;
  onAddNewProduct: () => void;
  onClearHistory: () => void;
  onUpdateStock: (id: number, qty: number) => void;
  onUpdateDiscount: (id: number, off: number) => void;
  onRemoveProduct: (id: number) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, productId: number | null) => void;
  editingProductId: number | null;
  setEditingProductId: (id: number | null) => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  profileTab,
  setProfileTab,
  orderHistory,
  products,
  inventory,
  searchTerm,
  setSearchTerm,
  isAddingProduct,
  setIsAddingProduct,
  newProductForm,
  setNewProductForm,
  onAddNewProduct,
  onClearHistory,
  onUpdateStock,
  onUpdateDiscount,
  onRemoveProduct,
  onImageUpload,
  editingProductId,
  setEditingProductId,
  onLogout
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getStock = (id: number) => inventory[id] !== undefined ? inventory[id] : 0;

  return (
    <div className="pt-4 pb-20">
       <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Store Manager</h2>
              <p className="text-white/40 text-sm">Admin Access</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
       </div>

       {/* TABS */}
       <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-6 border border-white/10">
         <button onClick={() => setProfileTab('history')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${profileTab === 'history' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}>
           <History size={16} /> History
         </button>
         <button onClick={() => setProfileTab('inventory')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${profileTab === 'inventory' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}>
           <ClipboardList size={16} /> Inventory
         </button>
       </div>

       {/* HISTORY TAB */}
       {profileTab === 'history' && (
         <div className="space-y-4">
           {orderHistory.length === 0 ? (
             <div className="text-center py-20 text-white/20"><History size={48} className="mx-auto mb-4 opacity-50"/><p>No orders yet</p></div>
           ) : (
             orderHistory.map((order) => (
               <div key={order.id} className="bg-white/5 border border-white/5 rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-3">
                     <div><p className="text-white font-medium text-lg">Order #{order.id.toString().slice(-4)}</p><p className="text-white/40 text-xs">{order.date} • {order.time}</p></div>
                     <span className="text-pink-400 font-bold text-xl">{order.total}</span>
                  </div>
                  <div className="space-y-1 mb-3">
                    {Object.entries(order.items).map(([id, qty]) => {
                       const p = products.find(x => x.id === parseInt(id));
                       if(!p) return null;
                       const quantity = qty as number;
                       return (<div key={id} className="flex justify-between text-xs text-white/70"><span>{quantity}x {p.name}</span><span>{p.price * quantity}</span></div>)
                    })}
                  </div>
               </div>
             ))
           )}
           {orderHistory.length > 0 && (
             <button onClick={onClearHistory} className="w-full py-4 text-red-400 text-xs uppercase tracking-widest opacity-50 hover:opacity-100 flex items-center justify-center gap-2"><Trash2 size={14} /> Clear History</button>
           )}
         </div>
       )}

       {/* INVENTORY TAB */}
       {profileTab === 'inventory' && (
         <div className="space-y-4">
           
           {/* Add Product Button */}
           {!isAddingProduct && (
             <button 
               onClick={() => setIsAddingProduct(true)}
               className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-medium flex items-center justify-center gap-2 mb-4 transition-all"
             >
               <Plus size={18} /> Add New Product
             </button>
           )}

           {/* Add Product Form */}
           {isAddingProduct && (
             <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 animate-in slide-in-from-top duration-300">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-white font-bold">New Item</h3>
                 <button onClick={() => setIsAddingProduct(false)}><X size={18} className="text-white/60"/></button>
               </div>
               <div className="space-y-3">
                 <input 
                   type="text" placeholder="Product Name" className="w-full bg-black/20 text-white rounded-lg p-3 text-sm outline-none border border-white/5"
                   value={newProductForm.name} onChange={e => setNewProductForm({...newProductForm, name: e.target.value})}
                 />
                 <div className="flex gap-3">
                   <input 
                     type="number" placeholder="Price" className="w-1/2 bg-black/20 text-white rounded-lg p-3 text-sm outline-none border border-white/5"
                     value={newProductForm.price} onChange={e => setNewProductForm({...newProductForm, price: e.target.value})}
                   />
                   <select 
                     className="w-1/2 bg-black/20 text-white rounded-lg p-3 text-sm outline-none border border-white/5"
                     value={newProductForm.category} onChange={e => setNewProductForm({...newProductForm, category: e.target.value})}
                   >
                     <option>Hair Care</option>
                     <option>Skin Care</option>
                     <option>Makeup</option>
                     <option>Men's Grooming</option>
                     <option>Fragrance</option>
                   </select>
                 </div>
                 <div className="flex gap-3">
                    <div className="w-1/2 relative">
                        <input 
                            type="number" placeholder="Stock" className="w-full bg-black/20 text-white rounded-lg p-3 text-sm outline-none border border-white/5"
                            value={newProductForm.stock} onChange={e => setNewProductForm({...newProductForm, stock: e.target.value})}
                        />
                    </div>
                    <div className="w-1/2 relative">
                         <input 
                            type="number" placeholder="Discount %" className="w-full bg-black/20 text-white rounded-lg p-3 text-sm outline-none border border-white/5 pl-8"
                            value={newProductForm.off} onChange={e => setNewProductForm({...newProductForm, off: e.target.value})}
                        />
                         <span className="absolute left-3 top-3.5 text-white/40"><Tag size={14}/></span>
                    </div>
                 </div>
                 <input 
                   type="text" placeholder="Brand" className="w-full bg-black/20 text-white rounded-lg p-3 text-sm outline-none border border-white/5"
                   value={newProductForm.brand} onChange={e => setNewProductForm({...newProductForm, brand: e.target.value})}
                 />
                 <textarea 
                   placeholder="Description" className="w-full bg-black/20 text-white rounded-lg p-3 text-sm outline-none border border-white/5 h-20 resize-none"
                   value={newProductForm.desc} onChange={e => setNewProductForm({...newProductForm, desc: e.target.value})}
                 />
                 <button 
                   onClick={onAddNewProduct}
                   className="w-full py-3 bg-pink-500 hover:bg-pink-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 mt-2"
                 >
                   <Save size={18} /> Save Product
                 </button>
               </div>
             </div>
           )}

           {/* Search */}
           <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-2 mb-4">
             <Search size={18} className="text-white/40" />
             <input 
               type="text" placeholder="Search products..." className="bg-transparent text-white text-sm w-full outline-none placeholder:text-white/20"
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>

           {/* Product List */}
           {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => {
             const stock = getStock(p.id);
             return (
               <div key={p.id} className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-3 relative group">
                 <div className="flex items-center gap-4">
                    {/* Image Upload Trigger */}
                    <div 
                        className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 cursor-pointer"
                        onClick={() => {
                        setEditingProductId(p.id);
                        if(fileInputRef.current) fileInputRef.current.click();
                        }}
                    >
                    {p.image ? (
                        <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30"><Camera size={18}/></div>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Edit2 size={12} className="text-white"/>
                    </div>
                    </div>

                    <div className="flex-1 min-w-0">
                    <h4 className="text-white text-sm font-medium truncate">{p.name}</h4>
                    <p className="text-white/40 text-xs">{p.brand} • Price: {p.price}</p>
                    </div>

                     <button onClick={() => onRemoveProduct(p.id)} className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                        <Trash2 size={14} />
                    </button>
                 </div>
                 
                 {/* Controls Row */}
                 <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-2 mt-1">
                    <div className="flex items-center gap-2 bg-black/20 rounded-lg px-2 py-1 border border-white/5">
                        <span className="text-[10px] text-white/40 uppercase tracking-wider">Off%</span>
                        <input 
                            type="number"
                            value={p.off}
                            onChange={(e) => onUpdateDiscount(p.id, parseInt(e.target.value) || 0)}
                            className="w-8 bg-transparent text-white text-xs font-medium text-right outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1">
                        <button onClick={() => onUpdateStock(p.id, Math.max(0, stock - 1))} className="w-6 h-6 rounded flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10"><Minus size={12} /></button>
                        <input 
                             type="number"
                             value={stock}
                             onChange={(e) => onUpdateStock(p.id, parseInt(e.target.value) || 0)}
                             className="w-10 bg-transparent text-center text-sm font-mono font-bold text-white outline-none appearance-none"
                        />
                        <button onClick={() => onUpdateStock(p.id, stock + 1)} className="w-6 h-6 rounded flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10"><Plus size={12} /></button>
                    </div>
                 </div>
               </div>
             )
           })}
         </div>
       )}

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={(e) => onImageUpload(e, editingProductId)}
      />
    </div>
  );
};
