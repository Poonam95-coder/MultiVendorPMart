import { useNavigate } from "react-router-dom";
import type { Product } from "../../types";
import { Plus, Star } from "lucide-react";
import { useCart } from "../../context/CartContext";
interface Props{
    product:Product;
}
const ProductCard = ({product}:Props) => {
    //to display price we need $ sign so first we need to add in the environment variable,thrn import
    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";
    const {addToCart}=useCart()
    const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadown hover:shadow-md transition-all duration-3-- group animate-fade-in cursor-pointer"
    onClick={()=>navigate(`/products/${product._id}`)}
    >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
<img src={product.image} alt={product.name} className="w-full h-full object-cover p-4 group-hover:p-2 transition-all duration-300"/>

{/* Badges */}
<div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
    {product.discount>0 &&(
  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-app-orange text-white rounded-full">{product.discount}% OFF</span>
  )}
</div>
</div>
{/* Info       */}
<div className="p-3.5 text-zinc-700">
    <h3 className="text-sm leading-snuh mb-1.5 line-clamp-2">{product.name}</h3>

    {/* Rating & Seller */}
    <div className="flex items-center justify-between gap-1 mb-2">
      <div className="flex items-center gap-1 min-w-0">
        {product.rating > 0 ? (
          <>
            <Star className="size-3 text-app-warning fill-app-warning shrink-0" />
            <span className="text-xs font-semibold text-app-text">{product.rating.toFixed(1)}</span>
            <span className="text-[10px] text-app-text-light">({product.reviewCount})</span>
          </>
        ) : (
          <span className="text-[10px] text-zinc-400 font-medium">New</span>
        )}
      </div>

      {product.seller && typeof product.seller === "object" && (
        <div className="flex items-center gap-1.5 shrink-0 max-w-[140px]" title={`Sold by: ${product.seller.storeName}`}>
          <span className="text-[10px] text-zinc-600 truncate">
            {product.seller.storeName}
            {product.seller.isVerified && <span className="text-blue-600 font-bold ml-0.5">✓</span>}
          </span>
          <span
            className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full border shrink-0 ${
              (product.seller.trustScore ?? (product.seller.isVerified ? 85 : 50)) >= 85
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : (product.seller.trustScore ?? 50) >= 70
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
            title={`AI Seller Trust Score: ${product.seller.trustScore ?? (product.seller.isVerified ? 85 : 50)}/100`}
          >
            🛡️ {product.seller.trustScore ?? (product.seller.isVerified ? 85 : 50)}
          </span>
        </div>
      )}
    </div>
    {/* Price + Add */}
    <div className="flex items-center justify-between">
<div className="flex items-center gap-1 truncate">
<span className="text-base font-medium">{currency}{product.price.toFixed(1)}</span>
<span className="text-app-text-light block">
    /{product.unit}</span>
    {product.originalPrice>product.price && <span className="text-xs text-app-text-light line-through ml-1.5">{currency}
        {product.originalPrice.toFixed(1)}</span>}
</div>
<button onClick={(e)=>{e.stopPropagation();addToCart(product)}}
className="size-7 rounded-ful bg-app-orange text-white flex-center shrink-0 hover:bg-app-orange-dark transition-colors active:scale-95">
    <Plus className="size-3.5"/>
</button>
    </div>
</div>
    </div>
  )
}

export default ProductCard
