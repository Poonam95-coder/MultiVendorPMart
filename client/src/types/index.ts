export interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    addresses: Address[];
    isAdmin?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Address {
    _id: string;
    label: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    isDefault: boolean;
    lat: number;
    lng: number;
}

export interface Category {
    slug: string;
    name: string;
    image: string;
}

export interface SellerTrust {
    _id?: string;
    seller: string | Seller;
    trustScore: number;
    verificationScore: number;
    ratingScore: number;
    reviewSentimentScore: number;
    complaintScore: number;
    trustSummary: string;
    totalReviews: number;
    positiveReviews: number;
    neutralReviews: number;
    negativeReviews: number;
    totalComplaints: number;
    resolvedComplaints: number;
    trustLevel?: string;
    trustBadgeColor?: string;
    lastUpdated: string;
}

export interface Review {
    _id: string;
    user: string | { _id: string; name: string; avatar?: string };
    product: string | Product;
    seller: string | Seller;
    order: string;
    rating: number;
    comment: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    sentimentScore: number;
    createdAt: string;
    updatedAt: string;
}

export interface Seller {
    _id: string;
    user: string | User;
    storeName: string;
    storeDescription?: string;
    email: string;
    phone?: string;
    logo?: string;
    address?: string;
    isVerified: boolean;
    isActive: boolean;
    rating: number;
    totalOrders: number;
    trust?: SellerTrust;
    trustScore?: number;
    trustSummary?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    originalPrice: number;
    image: string;
    category: string;
    unit: string;
    stock: number;
    isOrganic: boolean;
    rating: number;
    reviewCount: number;
    discount: number;
    seller?: string | Seller | null;
    createdAt: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface OrderItem {
    product: string | Product;
    seller?: string | Seller | null;
    sellerStatus?: "Pending" | "Accepted" | "Rejected" | "Preparing" | "Packed";
    name: string;
    image: string;
    price: number;
    quantity: number;
    unit: string;
}

export interface DeliveryPartner {
    _id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    vehicleType: "bike" | "scooter" | "car";
    isActive: boolean;
    createdAt: string;
}

export interface Order {
    _id: string;
    user: string | { _id: string; name: string; email: string; phone?: string };
    items: OrderItem[];
    shippingAddress: Omit<Address, "_id" | "isDefault">;
    paymentMethod: string;
    subtotal: number;
    deliveryFee: number;
    tax: number;
    total: number;
    status: string;
    statusHistory: { status: string; timestamp: string; note: string }[];
    deliveryPartner: DeliveryPartner | null;
    deliveryOtp: string;
    liveLocation?: { lat: number; lng: number; updatedAt?: string };
    isPaid: boolean;
    createdAt: string;
}
