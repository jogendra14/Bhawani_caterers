// api/userApi.js

import API from './axios';

const userApi = {
  login: (data) =>
    API.post('/user/login', data),

  logout: () =>
    API.post('/user/logout'),

  refreshToken: () =>
    API.post('/user/refresh-token'),

  getMe: () =>
    API.get('/user/me'),

  getAllUsers: () =>
    API.get('/user'),

  getUserById: (id) =>
    API.get(`/user/${id}`),

  createAdmin: (data) =>
    API.post('/user', data),

  updateUser: (id, data) =>
    API.put(`/user/${id}`, data),

  deleteUser: (id) =>
    API.delete(`/user/${id}`),

  toggleUserStatus: (id) =>
    API.patch(
      `/user/${id}/toggle-status`
    ),
};

export default userApi;