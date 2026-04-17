import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import Button from "../common/Button";
import { getCartDetails, useShopStore } from "../../stores/useShopStore";
import { formatCurrency } from "../../utils/format";

export default function CartDrawer() {
  const isOpen = useShopStore((state) => state.isCartOpen);
  const closeCart = useShopStore((state) => state.closeCart);
  const updateCartQuantity = useShopStore((state) => state.updateCartQuantity);
  const removeFromCart = useShopStore((state) => state.removeFromCart);
  const cart = useShopStore((state) => state.cart);
  const products = useShopStore((state) => state.products);
  const { items, subtotal } = useMemo(() => getCartDetails(cart, products), [cart, products]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 bg-ink/35" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeCart}>
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            className="ml-auto flex h-full w-full max-w-md flex-col bg-cream shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-clay/20 p-5">
              <h2 className="font-serif text-2xl text-ink">Your Cart</h2>
              <button type="button" onClick={closeCart} aria-label="Close cart">
                <X />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <p className="font-serif text-2xl text-ink">Your cart is waiting.</p>
                    <Link to="/shop" onClick={closeCart} className="mt-4 inline-flex text-sm font-bold text-terracotta">
                      Find something beautiful
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.size}`} className="flex gap-4">
                      <img src={item.product.images[0]} alt={item.product.title} className="h-28 w-20 rounded-md object-cover object-top" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink">{item.product.title}</p>
                        <p className="mt-1 text-sm text-stone">Size {item.size}</p>
                        <p className="mt-2 font-semibold">{formatCurrency(item.lineTotal)}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <button type="button" className="grid size-8 place-items-center rounded-md bg-white ring-1 ring-clay/25" onClick={() => updateCartQuantity(item.productId, item.size, item.quantity - 1)}>
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                          <button type="button" className="grid size-8 place-items-center rounded-md bg-white ring-1 ring-clay/25" onClick={() => updateCartQuantity(item.productId, item.size, item.quantity + 1)}>
                            <Plus size={14} />
                          </button>
                          <button type="button" className="ml-auto text-stone hover:text-terracotta" onClick={() => removeFromCart(item.productId, item.size)}>
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-clay/20 p-5">
              <div className="mb-4 flex items-center justify-between font-semibold">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <Link to="/checkout" onClick={closeCart}>
                <Button className="w-full" disabled={items.length === 0}>
                  Checkout
                </Button>
              </Link>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
