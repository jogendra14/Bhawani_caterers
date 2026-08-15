import API from "./axios";

export const fetchOrders = async () => {
  const response = await API.get("/orders");
  return response.data.orders || [];
};

export const fetchOrder = async (id) => {
  const response = await API.get(`/orders/${id}`);
  return response.data.order;
};

export const createOrder = async (data) => {
  const response = await API.post("/orders", data);
  return response.data.order;
};

export const updateOrder = async ({ id, ...data }) => {
  const response = await API.put(`/orders/${id}`, data);
  return response.data.order;
};

export const deleteOrder = async (id) => {
  await API.delete(`/orders/${id}`);
  return id;
};

export const fetchOrderMenu = async (orderId) => {
  const response = await API.get(`/orders/${orderId}/menu`);
  return response.data.orderMenu;
};

export const saveOrderMenu = async ({ orderId, days }) => {
  const response = await API.put(`/orders/${orderId}/menu`, { days });
  return response.data.orderMenu;
};
