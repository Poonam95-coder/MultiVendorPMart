import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiGet, apiPost, apiPut } from "../../services/api";
import { ArrowLeft, Upload, Leaf, Save, Lock, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function SellerProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { seller } = useAuth();
  const isApproved = seller?.isVerified && seller?.isActive;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [categories, setCategories] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    image: "",
    category: "",
    unit: "kg",
    stock: "10",
    discount: "0",
    isOrganic: false,
  });

  useEffect(() => {
    // Load categories
    apiGet("/categories")
      .then((d) => {
        setCategories(d.categories || []);
        if (!isEdit && d.categories?.length > 0 && !form.category) {
          setForm((prev) => ({ ...prev, category: d.categories[0].slug }));
        }
      })
      .catch(() => {});

    // If edit mode, load product details
    if (isEdit) {
      apiGet(`/products/${id}`)
        .then((d) => {
          const p = d.product;
          setForm({
            name: p.name || "",
            description: p.description || "",
            price: p.price !== undefined ? p.price.toString() : "",
            originalPrice: p.originalPrice !== undefined ? p.originalPrice.toString() : "",
            image: p.image || "",
            category: p.category || "",
            unit: p.unit || "kg",
            stock: p.stock !== undefined ? p.stock.toString() : "0",
            discount: p.discount !== undefined ? p.discount.toString() : "0",
            isOrganic: Boolean(p.isOrganic),
          });
        })
        .catch((e) => {
          toast.error(e.message || "Failed to load product");
          navigate("/seller/products");
        })
        .finally(() => setFetching(false));
    }
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please select a JPEG, PNG, or WebP image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setUploadingImage(true);
    try {
      const data = await apiPost("/upload", formData);
      if (data.url) {
        setForm((prev) => ({ ...prev, image: data.url }));
        toast.success("Image uploaded successfully");
      }
    } catch (err: any) {
      toast.error(err.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      toast.error("Please fill in name, price, and category");
      return;
    }
    if (!form.image) {
      toast.error("Please provide or upload a product image");
      return;
    }

    setLoading(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : parseFloat(form.price),
      image: form.image,
      category: form.category,
      unit: form.unit,
      stock: parseInt(form.stock) || 0,
      discount: parseInt(form.discount) || 0,
      isOrganic: form.isOrganic,
    };

    try {
      if (isEdit) {
        await apiPut(`/seller/products/${id}`, payload);
        toast.success("Product updated successfully");
      } else {
        await apiPost("/seller/products", payload);
        toast.success("Product added successfully");
      }
      navigate("/seller/products");
    } catch (e: any) {
      toast.error(e.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-zinc-500">Loading product details...</p>
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-white rounded-3xl p-8 border border-app-border shadow-sm space-y-4 animate-fade-in">
        <div className="size-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <Clock className="size-7" />
        </div>
        <h2 className="text-lg font-bold text-zinc-900">
          {!seller?.isVerified ? "Pending Admin Verification" : "Account Currently Inactive"}
        </h2>
        <p className="text-sm text-zinc-600">
          {!seller?.isVerified
            ? "Your seller account is pending Admin verification. You cannot sell products until Admin approves your account."
            : "Your seller account is currently inactive. Please contact Admin."}
        </p>
        <div className="pt-2">
          <Link
            to="/seller/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-app-orange text-white rounded-xl text-sm font-semibold hover:bg-app-orange-dark transition-colors"
          >
            View Store Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          to="/seller/products"
          className="p-2 bg-white rounded-xl border border-app-border text-zinc-600 hover:text-app-green hover:bg-orange-50 transition-colors"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-app-green">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-sm text-app-text-light mt-0.5">
            Fill in the details to list your grocery item in the store.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-app-border shadow-sm space-y-6">
        {/* Product Image */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
            Product Image
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {form.image ? (
              <div className="relative size-24 rounded-2xl overflow-hidden border border-app-border shrink-0">
                <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="size-24 rounded-2xl border-2 border-dashed border-app-border flex items-center justify-center text-zinc-400 bg-app-cream/50 shrink-0">
                <Upload className="size-6" />
              </div>
            )}
            <div className="space-y-2 flex-1 w-full">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="text-xs text-zinc-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-app-orange/10 file:text-app-orange hover:file:bg-app-orange/20 cursor-pointer"
              />
              <input
                type="text"
                placeholder="Or paste direct image URL..."
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="w-full px-3.5 py-2 bg-app-cream/50 border border-app-border rounded-xl text-xs outline-none focus:border-app-orange"
              />
              {uploadingImage && <p className="text-xs text-app-orange animate-pulse">Uploading to Cloudinary...</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Organic Farm Fresh Strawberries"
              className="w-full px-4 py-2.5 bg-app-cream/50 border border-app-border rounded-xl text-sm outline-none focus:border-app-orange"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2.5 bg-app-cream/50 border border-app-border rounded-xl text-sm outline-none focus:border-app-orange capitalize"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Unit */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Unit
            </label>
            <input
              type="text"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              placeholder="e.g. kg, 500g, pack, piece"
              className="w-full px-4 py-2.5 bg-app-cream/50 border border-app-border rounded-xl text-sm outline-none focus:border-app-orange"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Selling Price *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-2.5 bg-app-cream/50 border border-app-border rounded-xl text-sm outline-none focus:border-app-orange"
            />
          </div>

          {/* Original Price */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Original Price (Optional)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.originalPrice}
              onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-2.5 bg-app-cream/50 border border-app-border rounded-xl text-sm outline-none focus:border-app-orange"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Stock Quantity *
            </label>
            <input
              type="number"
              min="0"
              required
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              placeholder="10"
              className="w-full px-4 py-2.5 bg-app-cream/50 border border-app-border rounded-xl text-sm outline-none focus:border-app-orange"
            />
          </div>

          {/* Discount */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Discount (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: e.target.value })}
              placeholder="0"
              className="w-full px-4 py-2.5 bg-app-cream/50 border border-app-border rounded-xl text-sm outline-none focus:border-app-orange"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Provide a fresh and accurate description of the product..."
            className="w-full px-4 py-2.5 bg-app-cream/50 border border-app-border rounded-xl text-sm outline-none focus:border-app-orange"
          />
        </div>

        {/* Organic Toggle */}
        <div className="flex items-center gap-3 p-4 bg-app-cream/60 rounded-xl border border-app-border">
          <input
            type="checkbox"
            id="isOrganic"
            checked={form.isOrganic}
            onChange={(e) => setForm({ ...form, isOrganic: e.target.checked })}
            className="size-4 text-app-green accent-app-green rounded cursor-pointer"
          />
          <label htmlFor="isOrganic" className="text-sm font-medium text-zinc-800 flex items-center gap-1.5 cursor-pointer">
            <Leaf className="size-4 text-app-green" /> This product is Certified 100% Organic
          </label>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            to="/seller/products"
            className="px-5 py-2.5 border border-app-border rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-app-orange text-white rounded-xl text-sm font-medium hover:bg-app-orange-dark transition-colors disabled:opacity-50 shadow-sm"
          >
            <Save className="size-4" /> {loading ? "Saving..." : isEdit ? "Update Product" : "Publish Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
