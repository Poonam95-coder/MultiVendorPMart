//backend ka address hai.
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const isDeliveryPath = path.startsWith('/delivery') || path.startsWith('/auth/delivery');
  const deliveryToken =
    localStorage.getItem('trustcart_delivery_token') ||
    localStorage.getItem('pmart_delivery_token') ||
    localStorage.getItem('deliveryToken');
  const userToken =
    localStorage.getItem('trustcart_token') ||
    localStorage.getItem('pmart_token');
  const token = isDeliveryPath ? (deliveryToken || userToken) : (userToken || deliveryToken);

  const headers = new Headers(options.headers);

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401 && path === '/auth/me' && token) {
        // Only clear expired tokens if /auth/me explicitly failed with a token attached
        if (isDeliveryPath) {
          localStorage.removeItem('trustcart_delivery_token');
          localStorage.removeItem('pmart_delivery_token');
          localStorage.removeItem('deliveryToken');
        } else {
          localStorage.removeItem('trustcart_token');
          localStorage.removeItem('pmart_token');
        }
      }
      const message = data.message || `Request failed with status ${res.status}`;
      throw new Error(message);
    }

    return data as T;
  } catch (error: any) {
    throw error;
  }
}

export const apiGet = (path: string) => api(path);
export const apiPost = (path: string, body: any) =>
  api(path, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
export const apiPut = (path: string, body: any) =>
  api(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
export const apiPatch = (path: string, body: any) =>
  api(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
export const apiDelete = (path: string) =>
  api(path, {
    method: 'DELETE',
  });

export { API_URL };

