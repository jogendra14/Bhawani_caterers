// src/api/itemApi.js
import API from "./axios";

const itemApi = {
  // Get all items with populated raw materials
  getItems: async () => {
    const response = await API.get("/Items");
    return response.data.items || [];
  },

  // Create new item
  createItem: async (data) => {
    const response = await API.post("/Items", data);
    return response.data.item;
  },

  // Update existing item
  updateItem: async ({ id, data }) => {
    const response = await API.put(`/Items/${id}`, data);
    return response.data.item;
  },

  // Delete item
  deleteItem: async (id) => {
    const response = await API.delete(`/Items/${id}`);
    return response.data;
  },
};

export default itemApi;
