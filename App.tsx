import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Home, User, Lock } from 'lucide-react';
import { Product, Order, Inventory, CartItems, ViewState, ProfileTabState, NewProductForm } from './types';
import { INITIAL_CATALOG } from './constants';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { AdminPanel } from './components/AdminPanel';
import { Toast } from './components/Toast';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { uploadImageToCloudinary } from './utils/CloudinaryService';
import {
  seedInitialData,
  subscribeToProducts,
  subscribeToInventory,
  subscribeToHistory,
  addProduct,
  deleteProduct,
  updateProductDetails,
  updateProductImage,
  updateStock as firebaseUpdateStock,
  placeOrder,
  clearHistory
} from './utils/firebase';

export default function App() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItems>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>("home");
  const [profileTab, setProfileTab] = useState<ProfileTabState>("history");

  // Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");

  // UI States for adding/editing
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  // New State for Product Details Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [newProductForm, setNewProductForm] = useState<NewProductForm>({
    name: "",
    price: "",
    category: "Hair Care",
    brand: "",
    size: "",
    desc: "",
    stock: "50",
    off: "0"
  });

  // State (synced with Firebase)
  const [products, setProducts] = useState<Product[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<Inventory>({});
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // Helper Toast
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  // --- Firebase Subscriptions ---

  // Seed data on mount
  useEffect(() => {
    seedInitialData(INITIAL_CATALOG).catch(console.error);
  }, []);

  // Sync Products
  useEffect(() => {
    const unsubscribe = subscribeToProducts((data) => {
      setProducts(data);
      setIsLoading(false); // Data loaded
    });
    return () => unsubscribe();
  }, []);

  // Sync Inventory
  useEffect(() => {
    const unsubscribe = subscribeToInventory((data) => {
      setInventory(data);
    });
    return () => unsubscribe();
  }, []);

  // Sync History
  useEffect(() => {
    const unsubscribe = subscribeToHistory((data) => {
      setOrderHistory(data);
    });
    return () => unsubscribe();
  }, []);


  // --- Logic ---

  const getStock = (id: number) => inventory[id] !== undefined ? inventory[id] : 0;

  // Update stock wrapper to call Firebase
  const handleUpdateStock = (id: number, newQty: number) => {
    const newInventory = { ...inventory, [id]: newQty };
    firebaseUpdateStock(newInventory).catch(err => showToast("Failed to update stock"));
  };

  const copyToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      showToast(successful ? "Copied!" : "Copy failed");
    } catch (err) {
      showToast("Copy error");
    }
    document.body.removeChild(textArea);
  };

  const categories = ["All", ...new Set(products.map(p => p.category))].sort();

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term);
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, products]);

  // Actions
  const handleAdminLogin = () => {
    if (adminPasswordInput === "cosmetickingadmin@123") {
      setIsAdminAuthenticated(true);
      setAdminPasswordInput("");
      showToast("Welcome Admin");
    } else {
      showToast("Incorrect Password");
    }
  };

  const addToCart = (product: Product) => {
    const currentStock = getStock(product.id);
    const currentInCart = cart[product.id] || 0;
    if (currentInCart >= currentStock) {
      showToast("Out of Stock!");
      return;
    }
    setCart(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }));
    showToast(`Added ${product.name}`);
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) newCart[productId]--;
      else delete newCart[productId];
      return newCart;
    });
  };

  const totalItems = (Object.values(cart) as number[]).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((total, [id, qty]) => {
    const product = products.find(p => p.id === parseInt(id));
    return total + (product ? product.price * (qty as number) : 0);
  }, 0);

  const handleCheckout = () => {
    const newInventory = { ...inventory };
    let hasError = false;

    Object.entries(cart).forEach(([id, qty]) => {
      const productId = parseInt(id);
      const quantity = qty as number;
      const currentStock = newInventory[productId] !== undefined ? newInventory[productId] : 0;
      if (currentStock < quantity) hasError = true;
      newInventory[productId] = Math.max(0, currentStock - quantity);
    });

    if (hasError) showToast("Stock mismatch. Inventory updated.");

    // Sync Inventory to Firebase
    firebaseUpdateStock(newInventory);

    const newOrder: Order = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString(),
      items: cart,
      total: totalPrice
    };

    // Sync Order to Firebase
    placeOrder(newOrder);

    let text = `*🛍️ COSMETIC KING ORDER* \n`;
    text += `📅 Date: ${newOrder.date} at ${newOrder.time}\n------------------------------\n`;
    let idx = 1;
    Object.entries(cart).forEach(([id, qty]) => {
      const p = products.find(x => x.id === parseInt(id));
      const quantity = qty as number;
      if (p) {
        text += `*${idx}. ${p.name} (${p.size})*\n   ${quantity} x ${p.price} = ${p.price * quantity}\n`;
        idx++;
      }
    });
    text += `------------------------------\n*💰 GRAND TOTAL: ${totalPrice}*\n------------------------------\nCustomer Signature:`;

    copyToClipboard(text);
    setCart({});
    setIsCartOpen(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, productId: number | null) => {
    const file = e.target.files?.[0];
    if (file && productId) {
      if (file.size > 5000000) {
        showToast("Image too large (Max 5MB)");
        return;
      }

      showToast("Uploading to Cloud...");

      try {
        // Upload to Cloudinary
        const imageUrl = await uploadImageToCloudinary(file);

        // Update Firebase
        await updateProductImage(productId, imageUrl);

        showToast("Image Uploaded To Cloud!");
      } catch (error) {
        console.error(error);
        showToast("Upload Failed. Check Config.");
      }
    }
  };

  const handleAddNewProduct = () => {
    if (!newProductForm.name || !newProductForm.price) {
      showToast("Name and Price are required");
      return;
    }
    const price = parseInt(newProductForm.price);
    const initialStock = parseInt(newProductForm.stock) || 0;
    const initialOff = parseInt(newProductForm.off) || 0;

    const newProduct: Product = {
      id: Date.now(),
      name: newProductForm.name,
      price: price,
      mrp: Math.floor(price * (1 + (initialOff + 10) / 100)), // Approximate MRP logic
      off: initialOff,
      category: newProductForm.category,
      brand: newProductForm.brand || "Generic",
      size: newProductForm.size || "Standard",
      desc: newProductForm.desc || "New Product",
      image: null
    };

    // Sync to Firebase
    addProduct(newProduct);

    // Update Stock in Firebase
    const newInventory = { ...inventory, [newProduct.id]: initialStock };
    firebaseUpdateStock(newInventory);

    setNewProductForm({
      name: "", price: "", category: "Hair Care", brand: "", size: "", desc: "",
      stock: "50", off: "0"
    });
    setIsAddingProduct(false);
    showToast("Product Created in Cloud!");
  };

  const handleRemoveProduct = (id: number) => {
    if (window.confirm("Delete this product permanently?")) {
      deleteProduct(id);

      // Clean up inventory locally (optional, map stays in DB)
      // Clean up cart
      setCart(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      showToast("Product Deleted");
    }
  };

  const handleUpdateDiscount = (id: number, off: number) => {
    const p = products.find(prod => prod.id === id);
    if (p) {
      const newPrice = Math.floor(p.mrp * (1 - off / 100));
      const updatedProduct = { ...p, off, price: newPrice };
      // Sync to Firebase
      updateProductDetails(updatedProduct);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-bold animate-pulse">Loading Cosmetic King...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans flex justify-center overflow-hidden">

      {/* Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-pink-500/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md h-screen relative z-10 flex flex-col">

        {/* HEADER */}
        <header className="absolute top-0 left-0 right-0 z-30 px-6 py-6 pt-12 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-white font-black text-2xl tracking-tight">
              COSMETIC <span className="text-pink-500">KING</span>
            </h1>

            <button
              onClick={() => setIsCartOpen(true)}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 transition-all relative"
            >
              <ShoppingCart size={20} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-pink-500 rounded-full border border-black"></span>
              )}
            </button>
          </div>

          {view === 'home' && (
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 mask-linear-fade">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-sm font-medium transition-all whitespace-nowrap ${activeCategory === cat
                    ? "text-white border-b-2 border-pink-500 pb-1"
                    : "text-white/40 hover:text-white/70"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto no-scrollbar pt-44 pb-32 px-4 scroll-smooth">

          {view === 'home' ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map((product) => {
                const inCart = cart[product.id] || 0;
                const stock = getStock(product.id);

                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    inCart={inCart}
                    stock={stock}
                    onAddToCart={addToCart}
                    onRemoveFromCart={removeFromCart}
                    onOpenDetails={setSelectedProduct}
                  />
                );
              })}
            </div>
          ) : (
            // Authenticated Admin View
            isAdminAuthenticated ? (
              <AdminPanel
                profileTab={profileTab}
                setProfileTab={setProfileTab}
                orderHistory={orderHistory}
                products={products}
                inventory={inventory}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                isAddingProduct={isAddingProduct}
                setIsAddingProduct={setIsAddingProduct}
                newProductForm={newProductForm}
                setNewProductForm={setNewProductForm}
                onAddNewProduct={handleAddNewProduct}
                onClearHistory={clearHistory}
                onUpdateStock={handleUpdateStock}
                onUpdateDiscount={handleUpdateDiscount}
                onRemoveProduct={handleRemoveProduct}
                onImageUpload={handleImageUpload}
                editingProductId={editingProductId}
                setEditingProductId={setEditingProductId}
                onLogout={() => setIsAdminAuthenticated(false)}
              />
            ) : (
              // Admin Login Screen
              <div className="flex flex-col items-center justify-center h-full pb-20 px-6">
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl w-full max-w-sm backdrop-blur-md shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                  <div className="w-16 h-16 bg-gradient-to-tr from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-pink-400 border border-white/5 shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                    <Lock size={28} />
                  </div>
                  <h2 className="text-2xl font-bold text-white text-center mb-2">Admin Access</h2>
                  <p className="text-white/40 text-center mb-8 text-sm">Restricted Area. Enter password.</p>

                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-pink-500/50 focus:bg-black/60 transition-all mb-4 text-center tracking-[0.2em] placeholder:tracking-normal placeholder:text-white/20"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                  />

                  <button
                    onClick={handleAdminLogin}
                    className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors shadow-lg active:scale-95"
                  >
                    Login
                  </button>
                </div>
              </div>
            )
          )}

        </main>

        {/* FLOATING NAV */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-8 shadow-2xl z-40">
          <button onClick={() => setView('home')} className={`transition-colors relative ${view === 'home' ? 'text-white' : 'text-white/40 hover:text-white'}`}>
            <Home size={24} strokeWidth={1.5} />
            {view === 'home' && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>}
          </button>
          <div className="w-px h-6 bg-white/10"></div>
          <button onClick={() => setIsCartOpen(true)} className="text-white/40 hover:text-white relative">
            <ShoppingCart size={24} strokeWidth={1.5} />
            {totalItems > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-bounce"></span>}
          </button>
          <div className="w-px h-6 bg-white/10"></div>
          <button onClick={() => setView('profile')} className={`transition-colors relative ${view === 'profile' ? 'text-white' : 'text-white/40 hover:text-white'}`}>
            <User size={24} strokeWidth={1.5} />
            {view === 'profile' && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>}
          </button>
        </div>

        {/* CART DRAWER */}
        <CartDrawer
          isOpen={isCartOpen}
          cart={cart}
          products={products}
          totalItems={totalItems}
          totalPrice={totalPrice}
          onClose={() => setIsCartOpen(false)}
          onClear={() => setCart({})}
          onAddToCart={addToCart}
          onRemoveFromCart={removeFromCart}
          onCheckout={handleCheckout}
        />

        {/* PRODUCT DETAILS MODAL */}
        <ProductDetailsModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          inCart={selectedProduct ? (cart[selectedProduct.id] || 0) : 0}
          stock={selectedProduct ? getStock(selectedProduct.id) : 0}
          onAddToCart={addToCart}
          onRemoveFromCart={removeFromCart}
        />

        {toast && <Toast message={toast} />}
      </div>
    </div>
  );
}
