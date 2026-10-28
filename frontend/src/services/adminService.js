import axiosInstance from './axiosInstance';

const createCrudService = (basePath) => ({
  getAll: (params) => axiosInstance.get(`/admin/${basePath}`, { params }),
  getById: (id) => axiosInstance.get(`/admin/${basePath}/${id}`),
  create: (data) => axiosInstance.post(`/admin/${basePath}`, data),
  update: (id, data) => axiosInstance.put(`/admin/${basePath}/${id}`, data),
  delete: (id) => axiosInstance.delete(`/admin/${basePath}/${id}`),
  deleteAll: (data) => axiosInstance.post(`/admin/${basePath}/delete-all`, data)
});

const adminService = {
  categories: createCrudService('categories'),
  technologies: createCrudService('technologies'),
  slugs: createCrudService('slugs'),
  skills: createCrudService('skills'),
  projects: {
    ...createCrudService('projects'),
    create: (data) => axiosInstance.post('/admin/projects', data),
    update: (id, data) => axiosInstance.put(`/admin/projects/${id}`, data)
  },
  services: {
    ...createCrudService('services'),
    create: (data) => axiosInstance.post('/admin/services', data),
    update: (id, data) => axiosInstance.put(`/admin/services/${id}`, data)
  },
  users: {
    ...createCrudService('users'),
    enable: (id) => axiosInstance.post(`/admin/users/${id}/enable`),
    disable: (id) => axiosInstance.post(`/admin/users/${id}/disable`)
  },
  countries: createCrudService('countries'),
  cities: {
    ...createCrudService('cities'),
    getByCountry: (countryId) => axiosInstance.get(`/admin/cities/by-country/${countryId}`)
  },
  gallery: {
    getAll: (params) => axiosInstance.get('/admin/gallery', { params }),
    upload: (data) => axiosInstance.post('/admin/gallery', data),
    delete: (id) => axiosInstance.delete(`/admin/gallery/${id}`),
    deleteAll: (data) => axiosInstance.post('/admin/gallery/delete-all', data)
  },
  banners: {
    getAll: (params) => axiosInstance.get('/admin/banners', { params }),
    upload: (data) => axiosInstance.post('/admin/banners', data),
    delete: (id) => axiosInstance.delete(`/admin/banners/${id}`),
    deleteAll: (data) => axiosInstance.post('/admin/banners/delete-all', data)
  },
  orders: {
    getAll: (params) => axiosInstance.get('/admin/orders', { params }),
    getById: (id) => axiosInstance.get(`/admin/orders/${id}`),
    sendEmail: (id, data) => axiosInstance.post(`/admin/orders/${id}/send-email`, data),
    delete: (id) => axiosInstance.delete(`/admin/orders/${id}`),
    deleteAll: (data) => axiosInstance.post('/admin/orders/delete-all', data)
  },
  dashboard: {
    getMetrics: () => axiosInstance.get('/admin/dashboard/metrics'),
    getAnalytics: () => axiosInstance.get('/admin/dashboard/analytics'),
    getRecentActivities: () => axiosInstance.get('/admin/dashboard/recent-activities')
  },
  promoCode: createCrudService('promo-codes'),
  chatbot: {
    getInstructions: () => axiosInstance.get('/admin/chatbot'),
    updateInstructions: (data) => axiosInstance.put('/admin/chatbot', data)
  },
  about: createCrudService('about'),
  blogs: createCrudService('blogs'),
  contactQueries: {
    getAll: (params) => axiosInstance.get('/admin/contact-queries', { params }),
    getById: (id) => axiosInstance.get(`/admin/contact-queries/${id}`),
    reply: (id, data) => axiosInstance.post(`/admin/contact-queries/${id}/reply`, data),
    delete: (id) => axiosInstance.delete(`/admin/contact-queries/${id}`)
  },
  resume: {
    get: () => axiosInstance.get('/admin/resume'),
    upload: (data) => axiosInstance.post('/admin/resume', data),
    delete: () => axiosInstance.delete('/admin/resume')
  },
  profile: {
    get: () => axiosInstance.get('/admin/profile'),
    update: (data) => axiosInstance.put('/admin/profile', data),
    updateAvatar: (data) => axiosInstance.put('/admin/profile/avatar', data),
    changePassword: (data) => axiosInstance.put('/admin/profile/change-password', data)
  }
};

export default adminService;
