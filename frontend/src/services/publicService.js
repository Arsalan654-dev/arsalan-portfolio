import axiosInstance from './axiosInstance';

const publicService = {
  getProjects: (params) => axiosInstance.get('/public/projects', { params }),
  getProjectBySlug: (slug) => axiosInstance.get(`/public/projects/${slug}`),
  getRelatedProjects: (id) => axiosInstance.get(`/public/projects/${id}/related`),
  getServices: (params) => axiosInstance.get('/public/services', { params }),
  getServiceBySlug: (slug) => axiosInstance.get(`/public/services/${slug}`),
  getRelatedServices: (id) => axiosInstance.get(`/public/services/${id}/related`),
  getCategories: () => axiosInstance.get('/public/categories'),
  getTechnologies: () => axiosInstance.get('/public/technologies'),
  getGallery: () => axiosInstance.get('/public/gallery'),
  getBanners: () => axiosInstance.get('/public/banners'),
  getAbout: () => axiosInstance.get('/public/about'),
  getBlogs: () => axiosInstance.get('/public/blogs'),
  getBlogBySlug: (slug) => axiosInstance.get(`/public/blogs/${slug}`),
  submitContact: (data) => axiosInstance.post('/public/contact', data),
  getResumeURL: () => axiosInstance.get('/public/resume'),
  getItemReviews: (itemType, itemId) => axiosInstance.get(`/public/reviews/${itemType}/${itemId}`),
  sendChatMessage: (message) => axiosInstance.post('/public/chatbot', { message })
};

export default publicService;
