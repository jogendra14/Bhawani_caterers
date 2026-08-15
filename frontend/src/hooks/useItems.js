// src/hooks/useItems.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import itemApi from "../api/itemApi";

export const itemKeys = {
  all: ["items"],
};

// Fetch all items
export function useItems() {
  return useQuery({
    queryKey: itemKeys.all,
    queryFn: itemApi.getItems,
  });
}

// Create new item
export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => itemApi.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
      toast.success("Item created successfully!");
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to create item";
      toast.error(message);
    },
  });
}

// Update existing item
export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => itemApi.updateItem({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
      toast.success("Item updated successfully!");
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to update item";
      toast.error(message);
    },
  });
}

// Delete item
export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => itemApi.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
      toast.success("Item deleted successfully!");
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to delete item";
      toast.error(message);
    },
  });
}
