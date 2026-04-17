import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import { useShopStore } from "../../stores/useShopStore";

export default function CustomerLayout() {
  const hydrateMe = useShopStore((state) => state.hydrateMe);
  const fetchProducts = useShopStore((state) => state.fetchProducts);

  useEffect(() => {
    hydrateMe();
    fetchProducts();
  }, [hydrateMe, fetchProducts]);

  return (
    <div className="min-h-screen bg-cream text-ink">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <Toaster position="top-right" />
    </div>
  );
}
