// src/hooks/useOrders.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import orderApi from "../api/orderApi";

export const orderKeys = {
  all: ["orders"],
  detail: (id) => ["orders", id],
  menu: (orderId) => ["orderMenu", orderId],
};

// Fetch all orders
export function useOrders() {
  return useQuery({
    queryKey: orderKeys.all,
    queryFn: orderApi.getOrders,
  });
}

// Fetch single order by ID
export function useOrder(id) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderApi.getOrderById(id),
    enabled: Boolean(id),
  });
}

// Fetch order menu by order ID
export function useOrderMenu(orderId) {
  return useQuery({
    queryKey: orderKeys.menu(orderId),
    queryFn: () => orderApi.getOrderMenu(orderId),
    enabled: Boolean(orderId),
  });
}

// Create new order
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newOrderData) => orderApi.createOrder(newOrderData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success("Order created successfully!");
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to create order";
      toast.error(message);
    },
  });
}

// Update order
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => orderApi.updateOrder({ id, data }),
    onSuccess: (updatedOrder, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      toast.success("Order updated successfully!");
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to update order";
      toast.error(message);
    },
  });
}

// Delete order
export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => orderApi.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success("Order deleted successfully!");
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to delete order";
      toast.error(message);
    },
  });
}

// Save/Update order menu
export function useSaveOrderMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, days }) =>
      orderApi.saveOrderMenu({
        orderId,
        days,
      }),

    onSuccess: (savedMenu, variables) => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.menu(variables.orderId),
      });

      toast.success("Menu saved successfully!");
    },

    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to save menu";

      toast.error(message);
    },
  });
}