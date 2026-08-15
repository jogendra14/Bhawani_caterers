import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BiEdit } from "react-icons/bi";
import { MdDeleteForever } from "react-icons/md";
import { FiSearch, FiPlus, FiCalendar, FiPhone, FiMapPin } from "react-icons/fi";

import { useOrders, useDeleteOrder } from "../hooks/useOrders.js";
import { formatOrderDate, getOrderStatusBadgeClass } from "../utils/orderUtils.js";
import AddOrder from "./orders/AddOrder.jsx";
import EditOrder from "./orders/EditOrder.jsx";

export default function Orders() {
  const navigate = useNavigate();
  const { data: orders = [], isLoading, isError, error } = useOrders();
  const deleteOrderMutation = useDeleteOrder();

  const [showAddOrder, setShowAddOrder] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Filtered and Date-sorted orders (earliest date first)
  const filteredOrders = useMemo(() => {
    return [...orders]
      .filter((order) => {
        const matchesSearch =
          order.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.phone?.includes(searchQuery) ||
          order.address?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          selectedStatus === "All" || order.status === selectedStatus;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0));
  }, [orders, searchQuery, selectedStatus]);

  const handleDelete = (order) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete order of "${order.clientName}"?`
    );
    if (!confirmed) return;
    deleteOrderMutation.mutate(order._id);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Orders Register
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage, schedule and track all catering events and orders ({orders.length} total)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddOrder(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <FiPlus className="text-lg" /> Add Order
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client name, phone, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {["All", "Pending", "Confirmed", "Completed", "Cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedStatus === status
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
          {error?.response?.data?.message || "Failed to load orders. Please try again."}
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="mt-4 text-sm font-medium text-slate-500">Loading orders data...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <p className="text-base font-semibold text-slate-800">
            {orders.length === 0 ? "No orders created yet" : "No orders match your search criteria"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {orders.length === 0
              ? "Start by adding your first catering event."
              : "Try adjusting your search terms or filter selection."}
          </p>
          {orders.length === 0 && (
            <button
              type="button"
              onClick={() => setShowAddOrder(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <FiPlus /> Add First Order
            </button>
          )}
        </div>
      ) : (
        /* Orders Table */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3.5 text-center">Sr.</th>
                  <th className="px-4 py-3.5">Event Date</th>
                  <th className="px-4 py-3.5">Client Name</th>
                  <th className="px-4 py-3.5">Contact Phone</th>
                  <th className="px-4 py-3.5">Venue Address</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredOrders.map((order, index) => (
                  <tr
                    key={order._id}
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                    className="cursor-pointer transition hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3.5 text-center font-semibold text-slate-500">
                      {index + 1}.
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <FiCalendar className="text-slate-400" />
                        <span>{formatOrderDate(order.startDate)}</span>
                        {order.endDate && order.endDate !== order.startDate && (
                          <span className="text-xs text-slate-400">
                            → {formatOrderDate(order.endDate)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-900">
                      {order.clientName}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <FiPhone className="text-slate-400" />
                        <span>{order.phone}</span>
                      </div>
                    </td>

                    <td className="max-w-xs px-4 py-3.5 text-slate-600">
                      <div className="flex items-center gap-1.5 truncate">
                        <FiMapPin className="shrink-0 text-slate-400" />
                        <span className="truncate" title={order.address}>
                          {order.address}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getOrderStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingOrder(order);
                          }}
                          title="Edit Order"
                          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                          <BiEdit size={18} />
                        </button>

                        <button
                          type="button"
                          disabled={deleteOrderMutation.isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(order);
                          }}
                          title="Delete Order"
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                        >
                          <MdDeleteForever size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Order Modal */}
      {showAddOrder && (
        <AddOrder
          onClose={() => setShowAddOrder(false)}
          onOrderAdded={() => setShowAddOrder(false)}
        />
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <EditOrder
          key={editingOrder._id}
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onOrderUpdated={() => setEditingOrder(null)}
        />
      )}
    </div>
  );
}
