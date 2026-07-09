/** Service base URLs. Leave empty in dev to use Vite proxy. */
export const API = {
  user: import.meta.env.VITE_USER_SERVICE_URL || '',
  product: import.meta.env.VITE_PRODUCT_SERVICE_URL || '',
  order: import.meta.env.VITE_ORDER_SERVICE_URL || '',
  payment: import.meta.env.VITE_PAYMENT_SERVICE_URL || '',
} as const;
