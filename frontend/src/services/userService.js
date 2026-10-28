import axiosInstance from './axiosInstance';

const userService = {
  getProfile: () => axiosInstance.get('/user/profile'),
  updateProfile: (data) => axiosInstance.put('/user/profile', data),
  updateAvatar: (data) => axiosInstance.put('/user/profile/avatar', data),
  changePassword: (data) => axiosInstance.put('/user/profile/change-password', data),
  getWishlist: () => axiosInstance.get('/user/wishlist'),
  addToWishlist: (data) => axiosInstance.post('/user/wishlist', data),
  removeFromWishlist: (id) => axiosInstance.delete(`/user/wishlist/${id}`),
  getCart: () => axiosInstance.get('/user/cart'),
  addToCart: (data) => axiosInstance.post('/user/cart', data),
  updateCartQuantity: (id, data) => axiosInstance.put(`/user/cart/${id}`, data),
  removeFromCart: (id) => axiosInstance.delete(`/user/cart/${id}`),
  checkout: (data) => axiosInstance.post('/user/orders/checkout', data),
  createPaymentIntent: (orderId) => axiosInstance.post(`/user/orders/${orderId}/create-payment-intent`),
  payOrder: (id) => axiosInstance.post(`/user/orders/${id}/pay`),
  getOrders: () => axiosInstance.get('/user/orders'),
  getOrderDetail: (id) => axiosInstance.get(`/user/orders/${id}`),
  validatePromo: (data) => axiosInstance.post('/user/orders/validate-promo', data),
  addReview: (data) => axiosInstance.post('/user/reviews', data),
  updateReview: (id, data) => axiosInstance.put(`/user/reviews/${id}`, data),
  deleteReview: (id) => axiosInstance.delete(`/user/reviews/${id}`),
  getCountries: () => axiosInstance.get('/user/countries'),
  getCities: (countryId) => axiosInstance.get(`/user/cities/${countryId}`)
};

export default userService;
