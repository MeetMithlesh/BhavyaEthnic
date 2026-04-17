import { Link } from "react-router-dom";
import Button from "../components/common/Button";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-terracotta">404</p>
      <h1 className="mt-2 font-serif text-5xl">This page wandered off.</h1>
      <Link to="/"><Button className="mt-8">Back home</Button></Link>
    </section>
  );
}
