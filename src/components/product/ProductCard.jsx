import { Heart, ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useShopStore } from "../../stores/useShopStore";
import { formatCurrency } from "../../utils/format";

export default function ProductCard({ product }) {
  const wishlist = useShopStore((state) => state.wishlist);
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);
  const addToCart = useShopStore((state) => state.addToCart);
  const productPath = `/product/${product.slug || product._id}`;
  const firstAvailableSize = product.sizes?.find((item) => item.stock > 0)?.size;
  const isWishlisted = wishlist.includes(product._id);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <Link to={productPath} className="block overflow-hidden rounded-md bg-white">
        <div className="aspect-[3/4] overflow-hidden bg-blush">
          {product.images?.[0] && (
            <img
              src={product.images[0]}
              alt={product.title}
              className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105"
            />
          )}
        </div>
      </Link>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <Link to={productPath} className="font-serif text-lg leading-tight text-ink hover:text-terracotta">
            {product.title}
          </Link>
          <p className="mt-1 text-sm text-stone">{product.category}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-semibold text-ink">{formatCurrency(product.price)}</span>
            <span className="text-sm text-stone line-through">{formatCurrency(product.mrp)}</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-sm text-stone">
            <Star size={15} className="fill-marigold text-marigold" />
            {Number(product.ratingsAverage || 0).toFixed(1)} ({product.ratingsCount || 0})
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <button
            type="button"
            onClick={() => toggleWishlist(product._id)}
            className="grid size-10 place-items-center rounded-md bg-white text-ink ring-1 ring-clay/25 transition hover:bg-blush"
            aria-label="Toggle wishlist"
          >
            <Heart size={18} className={isWishlisted ? "fill-terracotta text-terracotta" : ""} />
          </button>
          <button
            type="button"
            onClick={() => addToCart(product, firstAvailableSize)}
            disabled={!firstAvailableSize}
            className="grid size-10 place-items-center rounded-md bg-ink text-white transition hover:bg-terracotta disabled:opacity-40"
            aria-label="Quick add"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
