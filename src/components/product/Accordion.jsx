import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-clay/20 py-4">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-left">
        <span className="font-semibold text-ink">{title}</span>
        <ChevronDown size={18} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pt-4 text-sm leading-7 text-stone">{children}</div>}
    </section>
  );
}
