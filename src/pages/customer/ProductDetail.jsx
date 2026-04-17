import { ArrowLeft, Heart, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Accordion from "../../components/product/Accordion";
import ReviewSection from "../../components/product/ReviewSection";
import Button from "../../components/common/Button";
import { useShopStore } from "../../stores/useShopStore";
import { formatCurrency } from "../../utils/format";

export default function ProductDetail() {
  const { slug } = useParams();
  const selectedProduct = useShopStore((state) => state.selectedProduct);
  const fetchProductBySlug = useShopStore((state) => state.fetchProductBySlug);
  const isProductLoading = useShopStore((state) => state.isProductLoading);
  const productError = useShopStore((state) => state.productError);
  const addToCart = useShopStore((state) => state.addToCart);
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);
  const wishlist = useShopStore((state) => state.wishlist);
  const product = selectedProduct;
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const firstAvailableSize = product?.sizes.find((item) => item.stock > 0)?.size || "";
  const activeSize = product?.sizes.some((item) => item.size === selectedSize)
    ? selectedSize
    : firstAvailableSize;
  const safeImageIndex = Math.min(imageIndex, Math.max((product?.images?.length || 1) - 1, 0));
  const stock = useMemo(() => product?.sizes.find((item) => item.size === activeSize)?.stock || 0, [product, activeSize]);

  useEffect(() => {
    fetchProductBySlug(slug);
  }, [fetchProductBySlug, slug]);

  if (isProductLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-[4/5] animate-pulse rounded-md bg-blush" />
          <div className="space-y-4">
            <div className="h-10 w-3/4 animate-pulse rounded-md bg-blush" />
            <div className="h-6 w-1/3 animate-pulse rounded-md bg-blush" />
            <div className="h-32 animate-pulse rounded-md bg-blush" />
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16">
        <Link to="/shop" className="text-sm font-bold text-terracotta">Back to All Products</Link>
        <p className="mt-8 text-2xl">{productError || "Product not found."}</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/shop" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-terracotta">
        <ArrowLeft size={18} /> Back to All Products
      </Link>
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-4 lg:grid-cols-[92px_1fr]">
          <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col">
            {product.images.map((image, index) => (
              <button key={image} type="button" onClick={() => setImageIndex(index)} className={`h-24 w-20 shrink-0 overflow-hidden rounded-md ring-2 ${imageIndex === index ? "ring-terracotta" : "ring-transparent"}`}>
                <img src={image} alt={`${product.title} ${index + 1}`} className="h-full w-full object-cover object-top" />
              </button>
            ))}
          </div>
          <div className="order-1 aspect-[4/5] overflow-hidden rounded-md bg-blush lg:order-2">
            {(product.images[safeImageIndex] || product.images[0]) && (
              <img src={product.images[safeImageIndex] || product.images[0]} alt={product.title} className="h-full w-full object-cover object-top" />
            )}
          </div>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-terracotta">{product.category}</p>
          <h1 className="mt-2 font-serif text-5xl leading-tight text-ink">{product.title}</h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold">{formatCurrency(product.price)}</span>
            <span className="text-stone line-through">{formatCurrency(product.mrp)}</span>
          </div>
          <p className="mt-5 leading-8 text-stone">{product.description}</p>
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Select size</p>
              {activeSize && <p className="text-sm font-semibold text-terracotta">Only {stock} left in size {activeSize}</p>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((item) => (
                <button
                  key={item.size}
                  type="button"
                  disabled={item.stock === 0}
                  onClick={() => setSelectedSize(item.size)}
                  className={`min-w-12 rounded-md px-4 py-3 text-sm font-semibold ring-1 ring-clay/30 disabled:cursor-not-allowed disabled:opacity-35 ${activeSize === item.size ? "bg-ink text-white" : "bg-white text-ink"}`}
                >
                  {item.size}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]">
            <Button onClick={() => addToCart(product, activeSize)} className="w-full">
              <ShoppingBag className="mr-2" size={18} /> Add to Cart
            </Button>
            <Button variant="secondary" onClick={() => toggleWishlist(product._id)}>
              <Heart className={`mr-2 ${wishlist.includes(product._id) ? "fill-terracotta text-terracotta" : ""}`} size={18} /> Wishlist
            </Button>
          </div>
          <div className="mt-8">
            <Accordion title="Product Description" defaultOpen>{product.description}</Accordion>
            <Accordion title="Shipping & Returns">
              Ships from Jaipur in 2-4 working days. {product.replacementPolicy}
            </Accordion>
            <Accordion title="Ratings & Reviews" defaultOpen>
              <ReviewSection product={product} />
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
