import API from "./axios";

export const fetchMaterials = async () => {
  const response = await API.get("/raw-materials");
  return response.data.materials || [];
};

export const createMaterial = async (data) => {
  const response = await API.post("/raw-materials", data);
  return response.data.material;
};
