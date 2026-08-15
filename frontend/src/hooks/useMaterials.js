// src/hooks/useMaterials.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import materialApi from "../api/materialApi";

export const materialKeys = {
  all: ["rawMaterials"],
};

// Fetch all raw materials
export function useMaterials() {
  return useQuery({
    queryKey: materialKeys.all,
    queryFn: materialApi.getMaterials,
  });
}

// Create new raw material
export function useCreateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => materialApi.createMaterial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.all });
      toast.success("Raw material added successfully!");
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to add raw material";
      toast.error(message);
    },
  });
}
