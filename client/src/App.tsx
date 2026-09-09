import { Toaster } from "react-hot-toast"
import {Routes,Route} from 'react-router-dom'
import Login from "./pages/Login"
import RoleSelect from "./pages/RoleSelect"
import AdminLogin from "./pages/admin/AdminLogin"
import AppLayout from "./pages/AppLayout"
import Home from "./pages/Home"
import Products from "./pages/Products"
import ProductsPage from "./pages/ProductsPage"
import SearchResults from "./pages/SearchResults"
import FlashDeals from "./pages/FlashDeals"
import Checkout from "./pages/Checkout"
import MyOrders from "./pages/MyOrders"
import OrderTracking from "./pages/OrderTracking"
import Addresses from "./pages/Addresses"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminLayout from "./pages/admin/AdminLayout"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminProducts from "./pages/admin/AdminProducts"
import AdminProductForm from "./pages/admin/AdminProductForm"
import AdminOrders from "./pages/admin/AdminOrders"
import AdminDeliveryPartners from "./pages/admin/AdminDeliveryPartners"
import AdminSellers from "./pages/admin/AdminSellers"
import DeliveryLogin from "./pages/delivery/DeliveryLogin"
import DeliveryLayout from "./pages/delivery/DeliveryLayout"
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard"
import SellerLogin from "./pages/seller/SellerLogin"
import SellerLayout from "./pages/seller/SellerLayout"
import SellerDashboard from "./pages/seller/SellerDashboard"
import SellerProducts from "./pages/seller/SellerProducts"
import SellerProductForm from "./pages/seller/SellerProductForm"
import SellerOrders from "./pages/seller/SellerOrders"
import SellerInventory from "./pages/seller/SellerInventory"
import SellerProfile from "./pages/seller/SellerProfile"
import { AdminRoute, DeliveryRoute, SellerRoute } from './components/RoleRoutes'

const App = () => {
  return (
    <>
      <Toaster position="top-right" toastOptions={{duration:3000,style:{background:"#1B3022",color:"#fff",borderRadius:"12px",fontSize:"14px"}}}/>
      <Routes>
        {/* Role selection & Auth pages no navbar no footer */}
        <Route path='/welcome' element={<RoleSelect/>}/>
        <Route path='/role-selection' element={<RoleSelect/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/seller/login' element={<SellerLogin/>}/>
        <Route path='/delivery/login' element={<DeliveryLogin/>}/>
        <Route path='/admin/login' element={<AdminLogin/>}/>

        {/* main pages-with Navbar,Footer */}
        <Route path='/' element={<AppLayout/>}>
          <Route index element={<Home/>}/>
          <Route path='products' element={<Products/>}/>
          <Route path="products/:id" element={<ProductsPage/>}/>
          <Route path="search" element={<SearchResults/>}/>
          <Route path="deals" element={<FlashDeals/>}/>
          <Route element={<ProtectedRoute/>}>
            <Route path="checkout" element={<Checkout/>}/>
            <Route path="orders" element={<MyOrders/>}/>
            <Route path="orders/:id" element={<OrderTracking/>}/>
            <Route path="addresses" element={<Addresses/>}/>
          </Route>
        </Route>

        {/* Seller pages */}
        <Route element={<SellerRoute/>}>
          <Route path='/seller' element={<SellerLayout/>}>
            <Route index element={<SellerDashboard/>}/>
            <Route path='products' element={<SellerProducts/>}/>
            <Route path='products/new' element={<SellerProductForm/>}/>
            <Route path='products/edit/:id' element={<SellerProductForm/>}/>
            <Route path='orders' element={<SellerOrders/>}/>
            <Route path='inventory' element={<SellerInventory/>}/>
            <Route path='profile' element={<SellerProfile/>}/>
          </Route>
        </Route>

        {/* Admin pages */}
        <Route element={<AdminRoute/>}><Route path='/admin' element={<AdminLayout/>}>
            <Route index element={<AdminDashboard/>}/>
            <Route path='products' element={<AdminProducts/>}/>
            <Route path='products/new' element={<AdminProductForm/>}/>
            <Route path='products/:id/edit' element={<AdminProductForm/>}/>
            <Route path='sellers' element={<AdminSellers/>}/>
            <Route path='orders' element={<AdminOrders/>}/>
            <Route path='delivery-partners' element={<AdminDeliveryPartners/>}/>
        </Route></Route>

        {/* Delivery partner pages */}
        <Route element={<DeliveryRoute/>}><Route path='/delivery' element={<DeliveryLayout/>}>
          <Route index element={<DeliveryDashboard/>}/>
        </Route></Route>
      </Routes>
    </>
  );
};

export default App;

