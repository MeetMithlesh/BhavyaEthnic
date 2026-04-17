import { Link } from "react-router-dom";
import { useMemo } from "react";
import ProductCard from "../../components/product/ProductCard";
import Button from "../../components/common/Button";
import { useShopStore } from "../../stores/useShopStore";

export default function Wishlist() {
  const wishlist = useShopStore((state) => state.wishlist);
  const allProducts = useShopStore((state) => state.products);
  const products = useMemo(
    () => allProducts.filter((product) => wishlist.includes(product._id)),
    [allProducts, wishlist],
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-terracotta">Wishlist</p>
      <h1 className="mt-2 font-serif text-5xl text-ink">Saved for later</h1>
      <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => <ProductCard key={product._id} product={product} />)}
      </div>
      {products.length === 0 && (
        <div className="mt-8 rounded-md bg-white p-10 text-center ring-1 ring-clay/20">
          <p className="font-serif text-3xl">No saved styles yet.</p>
          <Link to="/shop"><Button className="mt-5">Explore the shop</Button></Link>
        </div>
      )}
    </section>
  );
}
