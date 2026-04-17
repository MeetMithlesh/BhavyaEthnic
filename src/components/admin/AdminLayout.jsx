import { BarChart3, Boxes, Home, PackageCheck, Store } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: BarChart3, end: true },
  { to: "/admin/products", label: "Products", icon: Boxes },
  { to: "/admin/orders", label: "Orders", icon: PackageCheck },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#f7f7f4] text-ink lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-clay/20 bg-white p-4 lg:min-h-screen lg:border-b-0 lg:border-r">
        <Link to="/" className="flex items-center gap-2 font-serif text-2xl font-bold">
          <Store className="text-terracotta" /> Bhavya
        </Link>
        <nav className="mt-8 flex gap-2 overflow-x-auto lg:grid">
          {adminLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-w-fit items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold ${
                  isActive ? "bg-ink text-white" : "text-stone hover:bg-blush hover:text-ink"
                }`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <Link to="/" className="mt-8 hidden items-center gap-2 text-sm font-bold text-terracotta lg:flex">
          <Home size={16} /> Storefront
        </Link>
      </aside>
      <main className="p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
