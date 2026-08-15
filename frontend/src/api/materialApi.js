// src/api/materialApi.js
import API from "./axios";

const materialApi = {
  // Get all raw materials
  getMaterials: async () => {
    const response = await API.get("/raw-materials");
    return response.data.materials || [];
  },

  // Create new raw material
  createMaterial: async (data) => {
    const response = await API.post("/raw-materials", data);
    return response.data.material;
  },
};

export default materialApi;
