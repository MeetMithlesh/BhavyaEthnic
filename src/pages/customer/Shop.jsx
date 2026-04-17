import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../../components/product/ProductCard";
import ProductFilters from "../../components/product/ProductFilters";
import { useShopStore } from "../../stores/useShopStore";

export default function Shop() {
  const products = useShopStore((state) => state.products);
  const fetchProducts = useShopStore((state) => state.fetchProducts);
  const isLoading = useShopStore((state) => state.isProductsLoading);
  const productsError = useShopStore((state) => state.productsError);
  const [params, setParams] = useSearchParams();
  const categories = useMemo(() => [...new Set(products.map((product) => product.category))], [products]);
  const sizes = useMemo(() => [...new Set(products.flatMap((product) => product.sizes.map((size) => size.size)))], [products]);
  const priceMax = useMemo(() => Math.max(...products.map((product) => product.price), 10000), [products]);
  const [filters, setFilters] = useState({
    search: params.get("search") || "",
    category: params.get("category") ? [params.get("category")] : [],
    size: [],
    maxPrice: Number(params.get("maxPrice") || priceMax),
    sort: params.get("sort") || "newest",
  });

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (filters.search) next.set("search", filters.search);
    if (filters.category[0]) next.set("category", filters.category[0]);
    if (filters.sort !== "newest") next.set("sort", filters.sort);
    setParams(next, { replace: true });
  }, [filters.search, filters.category, filters.sort, setParams]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const search = filters.search.toLowerCase();
        const matchesSearch = !search || `${product.title} ${product.category} ${product.description}`.toLowerCase().includes(search);
        const matchesCategory = filters.category.length === 0 || filters.category.includes(product.category);
        const matchesSize = filters.size.length === 0 || product.sizes.some((item) => filters.size.includes(item.size) && item.stock > 0);
        return matchesSearch && matchesCategory && matchesSize && product.price <= filters.maxPrice;
      })
      .sort((a, b) => {
        if (filters.sort === "price-low") return a.price - b.price;
        if (filters.sort === "price-high") return b.price - a.price;
        if (filters.sort === "rating") return b.ratingsAverage - a.ratingsAverage;
        return b._id.localeCompare(a._id);
      });
  }, [products, filters]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-terracotta">All products</p>
          <h1 className="mt-2 font-serif text-5xl text-ink">Shop Bhavya Ethnic</h1>
        </div>
        <select value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))} className="h-11 rounded-md border border-clay/30 bg-white px-3 text-sm outline-none">
          <option value="newest">Newest</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
          <option value="rating">Top rated</option>
        </select>
      </div>
      <div className="mt-8 flex items-center rounded-md bg-white px-4 ring-1 ring-clay/20 lg:hidden">
        <Search size={18} className="text-stone" />
        <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search products" className="h-12 w-full bg-transparent px-3 outline-none" />
      </div>
      <div className="mt-10 grid gap-10 lg:grid-cols-[260px_1fr]">
        <ProductFilters filters={filters} setFilters={setFilters} categories={categories} sizes={sizes} priceMax={priceMax} />
        <div>
          <div className="mb-6 hidden items-center rounded-md bg-white px-4 ring-1 ring-clay/20 lg:flex">
            <Search size={18} className="text-stone" />
            <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search products" className="h-12 w-full bg-transparent px-3 outline-none" />
          </div>
          <p className="mb-5 text-sm text-stone">{filteredProducts.length} styles found</p>
          {isLoading && (
            <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="h-96 animate-pulse rounded-md bg-blush" />
              ))}
            </div>
          )}
          {!isLoading && productsError && <div className="rounded-md bg-white p-10 text-center text-stone">{productsError}</div>}
          {!isLoading && !productsError && (
            <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => <ProductCard key={product._id} product={product} />)}
            </div>
          )}
          {!isLoading && !productsError && filteredProducts.length === 0 && <div className="rounded-md bg-white p-10 text-center text-stone">No styles match these filters.</div>}
        </div>
      </div>
    </section>
  );
}
