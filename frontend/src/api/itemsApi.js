import API from "./axios";

export const fetchItems = async () => {
  const response = await API.get("/Items");
  return response.data.items || [];
};

export const createItem = async (data) => {
  const response = await API.post("/Items", data);
  return response.data.item;
};

export const updateItem = async ({ id, ...data }) => {
  const response = await API.put(`/Items/${id}`, data);
  return response.data.item;
};

export const deleteItem = async (id) => {
  await API.delete(`/Items/${id}`);
  return id;
};
