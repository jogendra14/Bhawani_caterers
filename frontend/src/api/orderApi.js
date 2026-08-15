// src/api/orderApi.js
import API from "./axios";

const orderApi = {
  // Get all orders
  getOrders: async () => {
    const response = await API.get("/orders");
    return response.data.orders || [];
  },

  // Get order by ID
  getOrderById: async (id) => {
    const response = await API.get(`/orders/${id}`);
    return response.data.order;
  },

  // Create new order
  createOrder: async (data) => {
    const response = await API.post("/orders", data);
    return response.data.order;
  },

  // Update order
  updateOrder: async ({ id, data }) => {
    const response = await API.put(`/orders/${id}`, data);
    return response.data.order;
  },

  // Delete order
  deleteOrder: async (id) => {
    const response = await API.delete(`/orders/${id}`);
    return response.data;
  },

  // Get order menu
  getOrderMenu: async (orderId) => {
    const response = await API.get(`/orders/${orderId}/menu`);
    return response.data?.orderMenu || null;
  },

  // Save/Update order menu
  saveOrderMenu: async ({ orderId, data }) => {
    const response = await API.put(`/orders/${orderId}/menu`, data);
    return response.data?.orderMenu || null;
  },
};

export default orderApi;
