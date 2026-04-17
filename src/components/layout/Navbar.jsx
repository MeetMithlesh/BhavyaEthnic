import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { getCartDetails, useShopStore } from "../../stores/useShopStore";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/dashboard", label: "Orders" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const user = useShopStore((state) => state.user);
  const toggleCart = useShopStore((state) => state.toggleCart);
  const wishlist = useShopStore((state) => state.wishlist);
  const cart = useShopStore((state) => state.cart);
  const products = useShopStore((state) => state.products);
  const { count } = useMemo(() => getCartDetails(cart, products), [cart, products]);

  const submitSearch = (event) => {
    event.preventDefault();
    navigate(`/shop${query ? `?search=${encodeURIComponent(query)}` : ""}`);
    setQuery("");
    setMenuOpen(false);
  };

  const navClass = ({ isActive }) =>
    `text-sm font-semibold transition ${isActive ? "text-terracotta" : "text-ink hover:text-terracotta"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-cream/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button type="button" className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <Menu />
        </button>
        <Link to="/" className="font-serif text-2xl font-bold tracking-wide text-ink">
          Bhavya Ethnic
        </Link>
        <nav className="ml-8 hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <form onSubmit={submitSearch} className="ml-auto hidden w-full max-w-xs items-center rounded-md bg-white px-3 ring-1 ring-clay/20 md:flex">
          <Search size={18} className="text-stone" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search kurtas, sets, festive"
            className="h-11 w-full bg-transparent px-3 text-sm outline-none"
          />
        </form>
        <Link to={user ? "/dashboard" : "/login"} className="grid size-10 place-items-center rounded-md hover:bg-blush" aria-label="Account">
          <User size={20} />
        </Link>
        <Link to="/wishlist" className="relative grid size-10 place-items-center rounded-md hover:bg-blush" aria-label="Wishlist">
          <Heart size={20} />
          {wishlist.length > 0 && <span className="absolute right-1 top-1 size-2 rounded-full bg-terracotta" />}
        </Link>
        <button type="button" onClick={toggleCart} className="relative grid size-10 place-items-center rounded-md hover:bg-blush" aria-label="Cart">
          <ShoppingBag size={20} />
          {count > 0 && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-terracotta text-xs text-white">{count}</span>}
        </button>
      </div>
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-ink/30 lg:hidden" onClick={() => setMenuOpen(false)}>
          <div className="h-full w-80 max-w-[85vw] bg-cream p-5" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="font-serif text-xl font-bold">Bhavya Ethnic</span>
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X />
              </button>
            </div>
            <form onSubmit={submitSearch} className="mt-6 flex items-center rounded-md bg-white px-3 ring-1 ring-clay/20">
              <Search size={18} className="text-stone" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" className="h-11 w-full bg-transparent px-3 outline-none" />
            </form>
            <nav className="mt-8 grid gap-5">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className={navClass}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
