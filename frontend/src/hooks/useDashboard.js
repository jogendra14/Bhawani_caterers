import { useMemo } from "react";

import { useItems } from "./useItems.js";
import { useMaterials } from "./useMaterials.js";
import { useOrders } from "./useOrders.js";

export function useDashboard() {
  const ordersQuery = useOrders();
  const itemsQuery = useItems();
  const materialsQuery = useMaterials();

  const orders = ordersQuery.data ?? [];
  const items = itemsQuery.data ?? [];
  const materials = materialsQuery.data ?? [];

  const stats = useMemo(() => {
    const pending = orders.filter((order) => order.status === "Pending").length;
    const confirmed = orders.filter((order) => order.status === "Confirmed").length;
    const completed = orders.filter((order) => order.status === "Completed").length;
    const cancelled = orders.filter((order) => order.status === "Cancelled").length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = orders.filter((order) => {
      const start = new Date(order.startDate);
      start.setHours(0, 0, 0, 0);
      return start >= today && order.status !== "Cancelled" && order.status !== "Completed";
    }).length;

    return {
      total: orders.length,
      pending,
      confirmed,
      completed,
      cancelled,
      upcoming,
      itemsCount: items.length,
      materialsCount: materials.length,
    };
  }, [orders, items.length, materials.length]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate),
      )
      .slice(0, 8);
  }, [orders]);

  const isLoading =
    ordersQuery.isLoading || itemsQuery.isLoading || materialsQuery.isLoading;

  const refetchAll = () => {
    ordersQuery.refetch();
    itemsQuery.refetch();
    materialsQuery.refetch();
  };

  return {
    stats,
    recentOrders,
    isLoading,
    isError: ordersQuery.isError,
    error: ordersQuery.error,
    refetchAll,
    isFetching:
      ordersQuery.isFetching || itemsQuery.isFetching || materialsQuery.isFetching,
  };
}
