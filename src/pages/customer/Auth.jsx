import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { useShopStore } from "../../stores/useShopStore";

export function Login() {
  const login = useShopStore((state) => state.login);
  const isAuthLoading = useShopStore((state) => state.isAuthLoading);
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const from = location.state?.from?.pathname || "/dashboard";

  const submit = async (event) => {
    event.preventDefault();
    const user = await login(form);
    navigate(user.role === "Admin" ? "/admin" : from);
  };

  return (
    <AuthFrame title="Welcome back" subtitle="Login with the account saved in MongoDB.">
      <form onSubmit={submit} className="space-y-4">
        <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" required className="h-12 w-full rounded-md border border-clay/30 px-4 outline-none focus:border-terracotta" placeholder="Email" />
        <input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} type="password" required className="h-12 w-full rounded-md border border-clay/30 px-4 outline-none focus:border-terracotta" placeholder="Password" />
        <Button type="submit" className="w-full" disabled={isAuthLoading}>{isAuthLoading ? "Logging in..." : "Login"}</Button>
      </form>
      <Button variant="secondary" disabled className="mt-4 w-full">
        <span className="mr-2 inline-grid size-5 place-items-center rounded-full bg-white text-sm font-black text-terracotta ring-1 ring-clay/30">
          G
        </span>
        Google OAuth ready for credential wiring
      </Button>
      <p className="mt-5 text-center text-sm text-stone">
        New here? <Link to="/register" className="font-bold text-terracotta">Create an account</Link>
      </p>
    </AuthFrame>
  );
}

export function Register() {
  const register = useShopStore((state) => state.register);
  const isAuthLoading = useShopStore((state) => state.isAuthLoading);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async (event) => {
    event.preventDefault();
    await register(form);
    navigate("/dashboard");
  };

  return (
    <AuthFrame title="Create your account" subtitle="Save addresses, sync wishlist, and track every Jaipur parcel.">
      <form onSubmit={submit} className="space-y-4">
        <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required className="h-12 w-full rounded-md border border-clay/30 px-4 outline-none focus:border-terracotta" placeholder="Full name" />
        <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" required className="h-12 w-full rounded-md border border-clay/30 px-4 outline-none focus:border-terracotta" placeholder="Email" />
        <input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} type="password" minLength="8" required className="h-12 w-full rounded-md border border-clay/30 px-4 outline-none focus:border-terracotta" placeholder="Password" />
        <Button type="submit" className="w-full" disabled={isAuthLoading}>{isAuthLoading ? "Creating account..." : "Register"}</Button>
      </form>
      <p className="mt-5 text-center text-sm text-stone">
        Already have an account? <Link to="/login" className="font-bold text-terracotta">Login</Link>
      </p>
    </AuthFrame>
  );
}

function AuthFrame({ title, subtitle, children }) {
  const hero = useShopStore((state) => state.products[0]?.images[0]);
  return (
    <section className="mx-auto grid min-h-[78vh] max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div className="hidden overflow-hidden rounded-md lg:block">
        {hero ? (
          <img src={hero} alt="Bhavya Ethnic" className="h-full w-full object-cover object-top" />
        ) : (
          <div className="h-full min-h-[520px] bg-gradient-to-br from-rosewood via-terracotta to-blush" />
        )}
      </div>
      <div className="flex items-center">
        <div className="w-full rounded-md bg-white p-6 ring-1 ring-clay/20 sm:p-10">
          <h1 className="font-serif text-4xl text-ink">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-stone">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
