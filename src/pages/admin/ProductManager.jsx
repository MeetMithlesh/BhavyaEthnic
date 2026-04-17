import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Button from "../../components/common/Button";
import { useShopStore } from "../../stores/useShopStore";
import { formatCurrency } from "../../utils/format";
import api from "../../utils/api";

const emptyForm = {
  title: "",
  description: "",
  price: "",
  mrp: "",
  category: "Kurtas",
  replacementPolicy: "Replacement within 7 days for unused items with tags.",
  sizes: [
    { size: "XS", stock: 0 },
    { size: "S", stock: 0 },
    { size: "M", stock: 0 },
    { size: "L", stock: 0 },
    { size: "XL", stock: 0 },
  ],
  images: [],
  isFeatured: false,
};

export default function ProductManager() {
  const products = useShopStore((state) => state.products);
  const fetchProducts = useShopStore((state) => state.fetchProducts);
  const isProductsLoading = useShopStore((state) => state.isProductsLoading);
  const createProduct = useShopStore((state) => state.createProduct);
  const updateProduct = useShopStore((state) => state.updateProduct);
  const deleteProduct = useShopStore((state) => state.deleteProduct);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const categories = useMemo(() => [...new Set(products.map((product) => product.category).concat(["Kurtas", "Suit Sets", "Dresses", "Festive"]))], [products]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const edit = (product) => {
    setEditingId(product._id);
    setImageFiles([]);
    setForm({
      title: product.title,
      description: product.description,
      price: product.price,
      mrp: product.mrp,
      category: product.category,
      replacementPolicy: product.replacementPolicy,
      sizes: product.sizes,
      images: product.images,
      isFeatured: product.isFeatured,
    });
  };

  const addImagePreviews = (files) => {
    const nextFiles = Array.from(files);
    const previews = nextFiles.map((file) => URL.createObjectURL(file));
    setImageFiles((current) => [...current, ...nextFiles]);
    setForm((current) => ({ ...current, images: [...current.images, ...previews] }));
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];

    const formData = new FormData();
    imageFiles.forEach((file) => formData.append("images", file));

    const { data } = await api.post("/uploads/products", formData);

    const uploadedImages = data.data?.images || [];
    const provider = data.data?.provider || "upload service";

    if (uploadedImages.length !== imageFiles.length) {
      throw new Error("Some images did not upload. Please try again.");
    }

    toast.success(`Uploaded ${uploadedImages.length} image${uploadedImages.length > 1 ? "s" : ""} via ${provider}.`);

    return uploadedImages;
  };

  const submit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const uploadedImages = await uploadImages();
      const existingImages = form.images.filter((image) => !image.startsWith("blob:"));
      const images = [...existingImages, ...uploadedImages];

      if (images.length === 0) {
        toast.error("Please upload at least one product image before saving.");
        return;
      }

      const payload = {
        ...form,
        images,
        price: Number(form.price),
        mrp: Number(form.mrp),
        sizes: form.sizes.map((item) => ({ ...item, stock: Number(item.stock) })),
      };

      if (editingId) await updateProduct(editingId, payload);
      else await createProduct(payload);
      setEditingId(null);
      setImageFiles([]);
      setForm(emptyForm);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Unable to save product images.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="grid gap-8 xl:grid-cols-[420px_1fr]">
      <form onSubmit={submit} className="h-fit rounded-md bg-white p-5 ring-1 ring-clay/20">
        <h1 className="font-serif text-3xl">{editingId ? "Edit product" : "Add product"}</h1>
        <div className="mt-5 grid gap-3">
          <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Title" className="h-11 rounded-md border border-clay/30 px-3 outline-none focus:border-terracotta" />
          <textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" rows="4" className="rounded-md border border-clay/30 px-3 py-2 outline-none focus:border-terracotta" />
          <div className="grid grid-cols-2 gap-3">
            <input required value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} type="number" min="0" placeholder="Price" className="h-11 rounded-md border border-clay/30 px-3 outline-none focus:border-terracotta" />
            <input value={form.mrp} onChange={(event) => setForm({ ...form, mrp: event.target.value })} type="number" min="0" placeholder="MRP" className="h-11 rounded-md border border-clay/30 px-3 outline-none focus:border-terracotta" />
          </div>
          <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="h-11 rounded-md border border-clay/30 px-3 outline-none focus:border-terracotta">
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
          <textarea value={form.replacementPolicy} onChange={(event) => setForm({ ...form, replacementPolicy: event.target.value })} rows="2" className="rounded-md border border-clay/30 px-3 py-2 outline-none focus:border-terracotta" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })} className="accent-terracotta" />
            Feature on home
          </label>
          <div>
            <p className="mb-2 font-semibold">Inventory</p>
            <div className="grid grid-cols-5 gap-2">
              {form.sizes.map((item, index) => (
                <label key={item.size} className="text-xs font-semibold text-stone">
                  {item.size}
                  <input value={item.stock} onChange={(event) => setForm((current) => ({ ...current, sizes: current.sizes.map((size, i) => i === index ? { ...size, stock: event.target.value } : size) }))} type="number" min="0" className="mt-1 h-10 w-full rounded-md border border-clay/30 px-2 text-sm outline-none" />
                </label>
              ))}
            </div>
          </div>
          <label className="grid cursor-pointer place-items-center rounded-md border border-dashed border-clay/50 p-5 text-center text-sm text-stone">
            Upload multiple images
            <input type="file" multiple accept="image/*" className="hidden" onChange={(event) => addImagePreviews(event.target.files)} />
          </label>
          {form.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {form.images.map((image) => <img key={image} src={image} alt="Preview" className="h-20 w-full rounded-md object-cover object-top" />)}
            </div>
          )}
          {imageFiles.length > 0 && (
            <p className="text-xs font-semibold text-terracotta">
              {imageFiles.length} image{imageFiles.length > 1 ? "s" : ""} selected. They will upload to Cloudinary when you save.
            </p>
          )}
          <Button type="submit" disabled={isSubmitting}>
            <Plus className="mr-2" size={18} /> {isSubmitting ? "Saving..." : editingId ? "Update product" : "Create product"}
          </Button>
          {editingId && <Button variant="secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel edit</Button>}
        </div>
      </form>
      <div className="rounded-md bg-white p-5 ring-1 ring-clay/20">
        <h2 className="font-serif text-3xl">Inventory</h2>
        <div className="mt-5 grid gap-4">
          {isProductsLoading && <div className="h-32 animate-pulse rounded-md bg-blush" />}
          {products.map((product) => (
            <div key={product._id} className="grid gap-4 rounded-md border border-clay/20 p-3 sm:grid-cols-[80px_1fr_auto]">
              <div className="h-24 w-20 overflow-hidden rounded-md bg-blush">
                {product.images?.[0] && <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover object-top" />}
              </div>
              <div>
                <p className="font-semibold">{product.title}</p>
                <p className="text-sm text-stone">{product.category} - {formatCurrency(product.price)}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.sizes.map((size) => <span key={size.size} className="rounded-md bg-blush px-2 py-1 text-xs">{size.size}: {size.stock}</span>)}
                </div>
              </div>
              <div className="flex gap-2 sm:flex-col">
                <button type="button" onClick={() => edit(product)} className="grid size-10 place-items-center rounded-md bg-blush text-ink"><Pencil size={17} /></button>
                <button type="button" onClick={() => deleteProduct(product._id)} className="grid size-10 place-items-center rounded-md bg-terracotta text-white"><Trash2 size={17} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
