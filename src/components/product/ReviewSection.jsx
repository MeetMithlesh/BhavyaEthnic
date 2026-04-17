import { useState } from "react";
import Button from "../common/Button";
import StarRating from "../common/StarRating";
import { useShopStore } from "../../stores/useShopStore";

export default function ReviewSection({ product }) {
  const user = useShopStore((state) => state.user);
  const addReview = useShopStore((state) => state.addReview);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    addReview(product._id, { rating, comment });
    setComment("");
    setRating(5);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <StarRating value={product.ratingsAverage} />
        <span className="text-sm text-stone">
          {product.ratingsAverage.toFixed(1)} from {product.ratingsCount} reviews
        </span>
      </div>
      <div className="space-y-4">
        {product.reviews.map((review, index) => (
          <div key={`${review.user}-${index}`} className="rounded-md bg-blush/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-ink">{review.name}</p>
              <StarRating value={review.rating} size={15} />
            </div>
            <p className="mt-2 text-sm text-stone">{review.comment}</p>
          </div>
        ))}
      </div>
      {user ? (
        <form onSubmit={submit} className="space-y-3 rounded-md bg-white p-4 ring-1 ring-clay/20">
          <p className="font-semibold text-ink">Add your review</p>
          <StarRating value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows="3"
            className="w-full rounded-md border border-clay/30 bg-white px-3 py-2 outline-none focus:border-terracotta"
            placeholder="Share fit, fabric, and styling notes"
            required
          />
          <Button type="submit">Submit review</Button>
        </form>
      ) : (
        <p className="rounded-md bg-white p-4 text-sm text-stone ring-1 ring-clay/20">Login to add a review.</p>
      )}
    </div>
  );
}
