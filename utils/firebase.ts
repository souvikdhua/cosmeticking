import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, onSnapshot, setDoc, addDoc, updateDoc, getDocs, query, orderBy, writeBatch } from "firebase/firestore";
import { Product, Order, Inventory } from "../types";

const firebaseConfig = {
    apiKey: "AIzaSyBSxHtvqr-E1AwhnMwmBjsK96hEpQ6LJEY",
    authDomain: "cosmetic-king.firebaseapp.com",
    projectId: "cosmetic-king",
    storageBucket: "cosmetic-king.firebasestorage.app",
    messagingSenderId: "713122361160",
    appId: "1:713122361160:web:35902b37a2c021afcacd7d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// --- Products ---

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
    const q = query(collection(db, "products"), orderBy("id", "desc")); // Sort by ID desc (newest first)
    return onSnapshot(q, (snapshot) => {
        const products = snapshot.docs.map(doc => doc.data() as Product);
        callback(products);
    }, (error) => {
        console.error("Error subscribing to products:", error);
    });
};

export const addProduct = async (product: Product) => {
    // Use product.id as doc ID for simplicity in migration, or let Firestore generate one.
    // Here we use the numeric ID as a string to easy lookup/update.
    await setDoc(doc(db, "products", product.id.toString()), product);
};

export const deleteProduct = async (id: number) => {
    await import("firebase/firestore").then(({ deleteDoc }) =>
        deleteDoc(doc(db, "products", id.toString()))
    );
};

export const updateProductDetails = async (product: Product) => {
    await setDoc(doc(db, "products", product.id.toString()), product, { merge: true });
}

export const updateProductImage = async (productId: number, imageUrl: string) => {
    await updateDoc(doc(db, "products", productId.toString()), {
        image: imageUrl
    });
};

// --- Inventory ---
// We store inventory as a single document 'main' in 'inventory' collection for atomic map updates, 
// OR simpler: just merged into the products themselves? 
// The original app had separate inventory state. Let's keep it separate to match logic.

export const subscribeToInventory = (callback: (inventory: Inventory) => void) => {
    return onSnapshot(doc(db, "inventory", "main"), (doc) => {
        if (doc.exists()) {
            callback(doc.data() as Inventory);
        } else {
            callback({});
        }
    }, (error) => {
        console.error("Error subscribing to inventory:", error);
    });
};

export const updateStock = async (inventory: Inventory) => {
    // We overwrite the whole map or merge. For 'main' doc, set with merge is safe.
    await setDoc(doc(db, "inventory", "main"), inventory, { merge: true });
};


// --- History ---

export const subscribeToHistory = (callback: (history: Order[]) => void) => {
    const q = query(collection(db, "orders"), orderBy("id", "desc"));
    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => doc.data() as Order);
        callback(orders);
    }, (error) => {
        console.error("Error subscribing to history:", error);
    });
};

export const placeOrder = async (order: Order) => {
    // Use order.id as doc ID
    await setDoc(doc(db, "orders", order.id.toString()), order);
};

export const clearHistory = async () => {
    // This is dangerous in a real app, but requested features.
    // Need to delete all docs in 'orders'.
    const q = query(collection(db, "orders"));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}


// --- Seeding ---

export const seedInitialData = async (products: Product[]) => {
    const snapshot = await getDocs(collection(db, "products"));
    if (snapshot.empty) {
        console.log("Seeding database...");
        const batch = writeBatch(db);

        // Seed Products
        products.forEach(p => {
            const ref = doc(db, "products", p.id.toString());
            batch.set(ref, p);
        });

        // Seed Initial Inventory (50 default)
        const initialInventory: Inventory = {};
        products.forEach(p => initialInventory[p.id] = 50);
        const invRef = doc(db, "inventory", "main");
        batch.set(invRef, initialInventory);

        await batch.commit();
        console.log("Seeding complete!");
    }
};
