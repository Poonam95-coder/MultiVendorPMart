import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "../../services/api";
import Loading from "../../components/Loading";
import { Boxes, Search, Check, X, Edit3, AlertTriangle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function SellerInventory() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stockVal, setStockVal] = useState<number>(0);
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await apiGet("/seller/inventory");
      setInventory(data.inventory || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (id: string) => {
    try {
      await apiPatch(`/seller/products/${id}/stock`, { stock: stockVal });
      toast.success("Stock updated successfully");
      await fetchInventory();
      setEditingId(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to update stock");
    }
  };

  const filtered = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const inStockCount = inventory.filter((i) => i.status === "In Stock").length;
  const lowStockCount = inventory.filter((i) => i.status === "Low Stock").length;
  const outStockCount = inventory.filter((i) => i.status === "Out of Stock").length;

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-app-green">Inventory Management</h1>
        <p className="text-sm text-app-text-light mt-1">
          Monitor stock availability and quickly replenish low stock items.
        </p>
      </div>

      {/* Quick Summary Badges */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-app-border flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-green-50 text-green-700">
            <Boxes className="size-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">In Stock</p>
            <p className="text-lg font-bold text-zinc-900">{inStockCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-app-border flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Low Stock (&le; 10)</p>
            <p className="text-lg font-bold text-zinc-900">{lowStockCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-app-border flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-50 text-red-700">
            <AlertCircle className="size-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Out of Stock</p>
            <p className="text-lg font-bold text-zinc-900">{outStockCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-app-border">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search inventory items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-app-cream/60 border border-app-border rounded-xl text-sm outline-none focus:border-app-orange"
          />
        </div>
        <div className="flex gap-2">
          {["all", "In Stock", "Low Stock", "Out of Stock"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                statusFilter === st
                  ? "bg-app-green text-white"
                  : "bg-app-cream/80 text-zinc-600 hover:bg-orange-50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-app-border">
          <p className="text-zinc-500 text-sm">No inventory items matched your filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-app-border shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-app-cream/80 text-zinc-600 text-xs font-semibold uppercase tracking-wider border-b border-app-border">
              <tr>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock Level</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {filtered.map((item) => (
                <tr key={item._id} className="hover:bg-orange-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-10 rounded-xl object-cover border border-app-border shrink-0"
                      />
                      <span className="font-semibold text-zinc-900 line-clamp-1">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize text-zinc-600">
                    {item.category.replace(/-/g, " ")}
                  </td>
                  <td className="px-6 py-4 text-zinc-900 font-medium">
                    {currency}
                    {item.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 font-bold text-zinc-900">
                    {item.stock} <span className="font-normal text-xs text-zinc-400">{item.unit}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        item.status === "In Stock"
                          ? "bg-green-100 text-green-700"
                          : item.status === "Low Stock"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingId === item._id ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <input
                          type="number"
                          min="0"
                          value={stockVal}
                          onChange={(e) => setStockVal(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 px-2 py-1 bg-white border border-app-orange rounded-lg text-xs font-semibold outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateStock(item._id)}
                          className="p-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          <Check className="size-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 bg-zinc-200 text-zinc-600 rounded-md hover:bg-zinc-300"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(item._id);
                          setStockVal(item.stock);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-100 hover:bg-app-orange hover:text-white rounded-lg text-xs font-medium text-zinc-700 transition-colors"
                      >
                        <Edit3 className="size-3" /> Update Stock
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
