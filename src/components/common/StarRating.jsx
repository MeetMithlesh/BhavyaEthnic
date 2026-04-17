import { Star } from "lucide-react";

export default function StarRating({ value = 0, onChange, size = 18 }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${value} stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={onChange ? "cursor-pointer" : "pointer-events-none"}
          aria-label={`${star} stars`}
        >
          <Star
            size={size}
            className={star <= Math.round(value) ? "fill-marigold text-marigold" : "text-clay"}
          />
        </button>
      ))}
    </div>
  );
}
