import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiDelete, apiPatch } from "../../services/api";
import type { Product } from "../../types";
import Loading from "../../components/Loading";
import { PlusCircle, Search, Edit3, Trash2, Check, X, Leaf, AlertCircle, Clock, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function SellerProducts() {
  const { seller } = useAuth();
  const isApproved = seller?.isVerified && seller?.isActive;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStock, setTempStock] = useState<number>(0);
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

  useEffect(() => {
    if (isApproved) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [isApproved]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiGet("/seller/products");
      setProducts(data.products || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load seller products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await apiDelete(`/seller/products/${id}`);
      toast.success("Product deleted successfully");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (e: any) {
      toast.error(e.message || "Failed to delete product");
    }
  };

  const handleStockUpdate = async (id: string) => {
    try {
      await apiPatch(`/seller/products/${id}/stock`, { stock: tempStock });
      toast.success("Stock updated");
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, stock: tempStock } : p))
      );
      setEditingStockId(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to update stock");
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map((p) => p.category)));

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-green">My Products</h1>
          <p className="text-sm text-app-text-light mt-1">
            Manage your store's inventory, pricing, and product details.
          </p>
        </div>
        <Link
          to="/seller/products/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-app-orange text-white rounded-xl text-sm font-medium hover:bg-app-orange-dark transition-colors shrink-0 shadow-sm"
        >
          <PlusCircle className="size-4" /> Add New Product
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-app-border">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-app-cream/60 border border-app-border rounded-xl text-sm outline-none focus:border-app-orange"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 bg-app-cream/60 border border-app-border rounded-xl text-sm outline-none focus:border-app-orange capitalize"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.replace(/-/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Product List Table */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-app-border">
          <AlertCircle className="size-12 text-zinc-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-zinc-900 mb-1">No products found</p>
          <p className="text-sm text-zinc-500 mb-4">
            {products.length === 0
              ? "You haven't listed any products yet."
              : "No products matched your search filter."}
          </p>
          {products.length === 0 && (
            <Link
              to="/seller/products/new"
              className="px-4 py-2 bg-app-green text-white rounded-xl text-sm font-medium hover:bg-green-950 transition-colors"
            >
              Add First Product
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-app-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-app-cream/80 text-zinc-600 text-xs font-semibold uppercase tracking-wider border-b border-app-border">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="size-12 rounded-xl object-cover border border-app-border shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-zinc-900 line-clamp-1">{product.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {product.isOrganic && (
                              <span className="flex items-center gap-0.5 text-[10px] bg-green-50 text-green-700 font-semibold px-1.5 py-0.2 rounded border border-green-200">
                                <Leaf className="size-2.5" /> Organic
                              </span>
                            )}
                            {product.discount > 0 && (
                              <span className="text-[10px] bg-orange-50 text-orange-700 font-semibold px-1.5 py-0.2 rounded border border-orange-200">
                                {product.discount}% OFF
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-zinc-600">
                      {product.category.replace(/-/g, " ")}
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-900">
                      {currency}
                      {product.price.toFixed(2)}
                      <span className="text-xs text-zinc-400 block font-normal">
                        /{product.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingStockId === product._id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={tempStock}
                            onChange={(e) => setTempStock(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-16 px-2 py-1 bg-white border border-app-orange rounded-lg text-xs font-semibold outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleStockUpdate(product._id)}
                            className="p-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                            title="Save"
                          >
                            <Check className="size-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingStockId(null)}
                            className="p-1 bg-zinc-200 text-zinc-600 rounded-md hover:bg-zinc-300"
                            title="Cancel"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingStockId(product._id);
                            setTempStock(product.stock);
                          }}
                          className="cursor-pointer group flex items-center gap-1.5"
                          title="Click to update stock"
                        >
                          <span
                            className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
                              product.stock === 0
                                ? "bg-red-100 text-red-700"
                                : product.stock <= 10
                                ? "bg-amber-100 text-amber-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {product.stock} {product.stock === 0 ? "(Out)" : "in stock"}
                          </span>
                          <Edit3 className="size-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/seller/products/edit/${product._id}`}
                          className="p-2 text-zinc-500 hover:text-app-green hover:bg-zinc-100 rounded-lg transition-colors"
                          title="Edit product"
                        >
                          <Edit3 className="size-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
