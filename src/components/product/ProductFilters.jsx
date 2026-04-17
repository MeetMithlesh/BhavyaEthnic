import Button from "../common/Button";

export default function ProductFilters({ filters, setFilters, categories, sizes, priceMax }) {
  const toggle = (key, value) => {
    setFilters((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value],
      };
    });
  };

  return (
    <aside className="space-y-7">
      <div>
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-stone">Category</p>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={filters.category.includes(category)}
                onChange={() => toggle("category", category)}
                className="size-4 accent-terracotta"
              />
              {category}
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-stone">Size</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              type="button"
              key={size}
              onClick={() => toggle("size", size)}
              className={`min-w-11 rounded-md px-3 py-2 text-sm ring-1 ring-clay/30 ${
                filters.size.includes(size) ? "bg-ink text-white" : "bg-white text-ink"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-stone">Price</p>
        <input
          type="range"
          min="0"
          max={priceMax}
          value={filters.maxPrice}
          onChange={(event) => setFilters((current) => ({ ...current, maxPrice: Number(event.target.value) }))}
          className="w-full accent-terracotta"
        />
        <p className="mt-2 text-sm text-stone">Up to Rs. {filters.maxPrice}</p>
      </div>
      <Button
        variant="secondary"
        className="w-full"
        onClick={() => setFilters({ search: "", category: [], size: [], maxPrice: priceMax, sort: "newest" })}
      >
        Clear filters
      </Button>
    </aside>
  );
}
