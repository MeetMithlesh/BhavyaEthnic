import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import Button from "../../components/common/Button";
import { getCartDetails, useShopStore } from "../../stores/useShopStore";
import { formatCurrency } from "../../utils/format";

export default function Checkout() {
  const user = useShopStore((state) => state.user);
  const placeOrder = useShopStore((state) => state.placeOrder);
  const cart = useShopStore((state) => state.cart);
  const products = useShopStore((state) => state.products);
  const { items, subtotal } = useMemo(() => getCartDetails(cart, products), [cart, products]);
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "Jaipur",
    state: "Rajasthan",
    postalCode: "",
    country: "India",
  });
  const [payment, setPayment] = useState("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const order = await placeOrder({ shippingAddress: address, paymentStatus: "Pending", paymentProvider: payment });
    setIsSubmitting(false);
    if (order) navigate("/dashboard");
  };

  if (!user) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-4xl">Login to checkout</h1>
        <Link to="/login" state={{ from: { pathname: "/checkout" } }}><Button className="mt-6">Login</Button></Link>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
      <form onSubmit={submit} className="rounded-md bg-white p-6 ring-1 ring-clay/20">
        <h1 className="font-serif text-4xl text-ink">Checkout</h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            ["fullName", "Full name"],
            ["phone", "Phone"],
            ["addressLine1", "Address line 1"],
            ["addressLine2", "Address line 2"],
            ["city", "City"],
            ["state", "State"],
            ["postalCode", "Postal code"],
            ["country", "Country"],
          ].map(([key, label]) => (
            <input key={key} value={address[key]} onChange={(event) => setAddress({ ...address, [key]: event.target.value })} required={key !== "addressLine2"} placeholder={label} className="h-12 rounded-md border border-clay/30 px-4 outline-none focus:border-terracotta" />
          ))}
        </div>
        <div className="mt-8">
          <p className="mb-3 font-semibold">Payment</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {["COD", "Pending Payment"].map((method) => (
              <button type="button" key={method} onClick={() => setPayment(method)} className={`rounded-md p-4 text-left ring-1 ${payment === method ? "bg-ink text-white ring-ink" : "bg-cream ring-clay/20"}`}>
                {method}
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" className="mt-8 w-full" disabled={items.length === 0 || isSubmitting}>
          {isSubmitting ? "Placing order..." : "Place order"}
        </Button>
      </form>
      <aside className="h-fit rounded-md bg-white p-6 ring-1 ring-clay/20">
        <h2 className="font-serif text-2xl">Order summary</h2>
        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="flex gap-3">
              <img src={item.product.images[0]} alt={item.product.title} className="h-20 w-16 rounded-md object-cover object-top" />
              <div className="flex-1">
                <p className="font-semibold">{item.product.title}</p>
                <p className="text-sm text-stone">Size {item.size} x {item.quantity}</p>
              </div>
              <span className="font-semibold">{formatCurrency(item.lineTotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-clay/20 pt-4">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="mt-2 flex justify-between text-stone"><span>Shipping</span><span>Free</span></div>
          <div className="mt-4 flex justify-between text-lg font-bold"><span>Total</span><span>{formatCurrency(subtotal)}</span></div>
        </div>
      </aside>
    </section>
  );
}
