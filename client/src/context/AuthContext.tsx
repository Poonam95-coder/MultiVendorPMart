import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, apiPost } from '../services/api';//iske through frontend backend ko request bhejta hai.
import type { User, DeliveryPartner, Seller } from '../types';

type Ctx = {
  user: User | null;
  partner: DeliveryPartner | null;
  seller: Seller | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  sellerLogin: (email: string, password: string) => Promise<any>;
  sellerRegister: (data: {
    name: string;
    email: string;
    password: string;
    storeName: string;
    storeDescription?: string;
    phone?: string;
    address?: string;
  }) => Promise<any>;
  deliveryLogin: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
};
//authcontext create kiya or central box hain  jisme authentication ki information aur functions rahenge
const AuthContext = createContext<Ctx | null>(null);


//AuthProvider apne andar poori application ko wrap karega
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<DeliveryPartner | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);

//Existing login session ko restore karna
  useEffect(() => {
    const deliveryToken =
      localStorage.getItem('trustcart_delivery_token') ||
      localStorage.getItem('pmart_delivery_token') ||
      localStorage.getItem('deliveryToken');
    const userToken =
      localStorage.getItem('trustcart_token') ||
      localStorage.getItem('pmart_token');
    const token = userToken || deliveryToken;

    //user not logged in no requirement of checking authentication
    if (!token) {
      setLoading(false);
      return;
    }
//Ye token valid hai? Aur agar valid hai toh ye kaunsa user hai? ->backend se fetch hogi user ki info
    api('/auth/me')
      .then((d) => {
        setUser(d.user || null);
        setPartner(d.partner || null);
        setSeller(d.seller || null);
      })
      .catch((err) => {
        console.warn('Session verification notice:', err?.message);
        if (err?.message && (err.message.includes('401') || err.message.includes('expired') || err.message.includes('Authentication required'))) {
          localStorage.removeItem('trustcart_token');
          localStorage.removeItem('trustcart_delivery_token');
          localStorage.removeItem('pmart_token');
          localStorage.removeItem('pmart_delivery_token');
          localStorage.removeItem('deliveryToken');
          setUser(null);
          setPartner(null);
          setSeller(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    //Backend ko request
    const d = await apiPost('/auth/login', { email, password });
    if (d.token) {
      localStorage.setItem('trustcart_token', d.token);
      localStorage.removeItem('trustcart_delivery_token');
      localStorage.removeItem('pmart_token');
      localStorage.removeItem('pmart_delivery_token');
      localStorage.removeItem('deliveryToken');
    }
    setUser(d.user || null);
    setSeller(d.seller || null);
    setPartner(null);
    return d;
  };

  const register = async (name: string, email: string, password: string) => {
    const d = await apiPost('/auth/register', { name, email, password });
    if (d.token) {
      localStorage.setItem('trustcart_token', d.token);
      localStorage.removeItem('trustcart_delivery_token');
      localStorage.removeItem('pmart_token');
      localStorage.removeItem('pmart_delivery_token');
      localStorage.removeItem('deliveryToken');
    }
    setUser(d.user || null);
    setSeller(null);
    setPartner(null);
    return d;
  };

  const sellerLogin = async (email: string, password: string) => {
    const d = await apiPost('/auth/seller/login', { email, password });
    if (d.token) {
      localStorage.setItem('trustcart_token', d.token);
      localStorage.removeItem('trustcart_delivery_token');
      localStorage.removeItem('pmart_token');
      localStorage.removeItem('pmart_delivery_token');
      localStorage.removeItem('deliveryToken');
    }
    setUser(d.user || null);
    setSeller(d.seller || null);
    setPartner(null);
    return d;
  };

  const sellerRegister = async (data: {
    name: string;
    email: string;
    password: string;
    storeName: string;
    storeDescription?: string;
    phone?: string;
    address?: string;
  }) => {
    const d = await apiPost('/auth/seller/register', data);
    if (d.token) {
      localStorage.setItem('trustcart_token', d.token);
      localStorage.removeItem('trustcart_delivery_token');
      localStorage.removeItem('pmart_token');
      localStorage.removeItem('pmart_delivery_token');
      localStorage.removeItem('deliveryToken');
    }
    setUser(d.user || null);
    setSeller(d.seller || null);
    setPartner(null);
    return d;
  };

  const deliveryLogin = async (email: string, password: string) => {
    const d = await apiPost('/auth/delivery/login', { email, password });
    if (d.token) {
      localStorage.setItem('trustcart_delivery_token', d.token);
      localStorage.removeItem('trustcart_token');
      localStorage.removeItem('pmart_token');
      localStorage.removeItem('pmart_delivery_token');
      localStorage.removeItem('deliveryToken');
    }
    setPartner(d.partner || null);
    setUser(null);
    setSeller(null);
    return d;
  };

  const logout = async () => {
    try {
      await apiPost('/auth/logout', {});
    } catch (e) {
      // ignore network errors on logout
    } finally {
      localStorage.removeItem('trustcart_token');
      localStorage.removeItem('trustcart_delivery_token');
      localStorage.removeItem('pmart_token');
      localStorage.removeItem('pmart_delivery_token');
      localStorage.removeItem('deliveryToken');
      setUser(null);
      setPartner(null);
      setSeller(null);
    }
  };

  return (
    //saari authentication information aur functions application ke components ko available kara do.
    <AuthContext.Provider
      value={{
        user,
        partner,
        seller,
        loading,
        login,
        register,
        sellerLogin,
        sellerRegister,
        deliveryLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth must be inside AuthProvider');
  return c;
}

