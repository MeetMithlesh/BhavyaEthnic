import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import ProductCard from "../../components/product/ProductCard";
import Button from "../../components/common/Button";
import { useShopStore } from "../../stores/useShopStore";

export default function Home() {
  const products = useShopStore((state) => state.products);
  const fetchProducts = useShopStore((state) => state.fetchProducts);
  const isLoading = useShopStore((state) => state.isProductsLoading);
  const productsError = useShopStore((state) => state.productsError);
  const trending = useMemo(
    () =>
      products
        .filter((product) => product.isFeatured || product.ratingsAverage >= 4.5)
        .slice(0, 4),
    [products],
  );
  const categories = useMemo(
    () =>
      [...new Set(products.map((product) => product.category))]
        .filter(Boolean)
        .slice(0, 4)
        .map((category) => {
          const product = products.find((item) => item.category === category);
          return {
            name: category,
            image: product?.images?.[0],
            description: `${category} crafted in the Bhavya Ethnic Jaipur edit.`,
          };
        }),
    [products],
  );
  const heroImage = products[0]?.images?.[0];

  useEffect(() => {
    fetchProducts({ limit: 12 });
  }, [fetchProducts]);

  return (
    <>
      <section className="relative min-h-[86vh] overflow-hidden">
        {heroImage ? (
          <img
            src={heroImage}
            alt="Bhavya Ethnic festive collection"
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-rosewood via-terracotta to-blush" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-ink/20 to-transparent" />
        <div className="relative mx-auto flex min-h-[86vh] max-w-7xl items-center px-4 pb-24 pt-20 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl text-white">
            <p className="text-sm font-bold uppercase tracking-[0.22em]">Jaipur SS26</p>
            <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-7xl">Ethnic wear with a quieter kind of grandeur.</h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/90">
              Hand-blocked cottons, luminous festive sets, and easy silhouettes made for Indian days.
            </p>
            <Link to="/shop">
              <Button className="mt-8 bg-#b97e73; text-ink hover:bg-blush">
                Shop the edit <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {isLoading && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-80 animate-pulse rounded-md bg-blush" />
            ))}
          </div>
        </section>
      )}

      {!isLoading && productsError && (
        <section className="mx-auto max-w-7xl px-4 py-10 text-center text-stone sm:px-6 lg:px-8">
          {productsError}
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-terracotta">Categories</p>
            <h2 className="mt-2 font-serif text-4xl text-ink">Find your rhythm</h2>
          </div>
          <Link to="/shop" className="text-sm font-bold text-terracotta">View all</Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.name} to={`/shop?category=${encodeURIComponent(category.name)}`} className="group">
              <div className="aspect-[4/5] overflow-hidden rounded-md bg-blush">
                {category.image && <img src={category.image} alt={category.name} className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" />}
              </div>
              <h3 className="mt-4 font-serif text-2xl text-ink">{category.name}</h3>
              <p className="mt-1 text-sm leading-6 text-stone">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-terracotta">Trending</p>
              <h2 className="mt-2 font-serif text-4xl text-ink">Most loved this week</h2>
            </div>
            <Link to="/shop?sort=rating" className="text-sm font-bold text-terracotta">Top rated</Link>
          </div>
          <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {trending.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
          {!isLoading && trending.length === 0 && (
            <div className="mt-8 rounded-md bg-cream p-10 text-center text-stone">
              Products will appear here after they are added from the admin dashboard.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
