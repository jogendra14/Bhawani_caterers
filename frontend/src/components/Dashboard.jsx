// src/components/Dashboard.jsx
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiLayers,
  FiPackage,
  FiSearch,
  FiArrowRight,
  FiPhone,
  FiMapPin,
  FiTrendingUp,
} from "react-icons/fi";

import { useAuth } from "../context/AuthContext.jsx";
import { useOrders, useDeleteOrder } from "../hooks/useOrders.js";
import { useItems } from "../hooks/useItems.js";
import { useMaterials } from "../hooks/useMaterials.js";
import { formatOrderDate, getOrderStatusBadgeClass } from "../utils/orderUtils.js";

import StatCard from "./dashboard/StatCard.jsx";
import AddOrderModal from "./dashboard/AddOrderModal.jsx";
import OrderTable from "./dashboard/OrderTable.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // =========================================================
  // TANSTACK QUERY HOOKS
  // =========================================================
  const { data: orders = [], isLoading: ordersLoading, isError, error } = useOrders();
  const { data: items = [], isLoading: itemsLoading } = useItems();
  const { data: materials = [], isLoading: materialsLoading } = useMaterials();
  const deleteOrderMutation = useDeleteOrder();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // =========================================================
  // METRICS & STATS
  // =========================================================
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "Pending").length;
    const confirmed = orders.filter((o) => o.status === "Confirmed").length;
    const completed = orders.filter((o) => o.status === "Completed").length;
    const cancelled = orders.filter((o) => o.status === "Cancelled").length;

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      totalItems: items.length,
      totalMaterials: materials.length,
    };
  }, [orders, items, materials]);

  // =========================================================
  // UPCOMING EVENTS (NEXT 5 UPCOMING / RECENT)
  // =========================================================
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return [...orders]
      .filter((order) => order.status !== "Cancelled")
      .sort((a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0))
      .slice(0, 4);
  }, [orders]);

  // =========================================================
  // FILTERED ORDERS FOR RECENT TABLE
  // =========================================================
  const filteredOrders = useMemo(() => {
    return [...orders]
      .filter((order) => {
        const matchesSearch =
          order.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.phone?.includes(searchQuery) ||
          order.address?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === "All" || order.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0));
  }, [orders, searchQuery, statusFilter]);

  const handleDeleteOrder = (order) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete order of "${order.clientName}"?`
    );
    if (!confirmed) return;
    deleteOrderMutation.mutate(order._id);
  };

  // Helper for date badge
  const getDaysRemainingLabel = (dateString) => {
    if (!dateString) return "";
    const eventDate = new Date(dateString);
    eventDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 1) return `In ${diffDays} days`;
    if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
    return "";
  };

  const isLoading = ordersLoading || itemsLoading || materialsLoading;

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-10">
      {/* =====================================================
          HERO & WELCOME HEADER
      ===================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-slate-900 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
              Control Panel
            </span>
            <span className="text-xs text-slate-400">Bhawani Caterers Management</span>
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back, {user?.name || "Admin"} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here is a live summary of your catering operations, scheduled events, and menu inventory.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <FiPlus className="text-lg" /> New Order
          </button>
        </div>
      </div>

      {/* Error alert if any */}
      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-xs">
          Failed to fetch real-time order data: {error?.message || "Unknown error"}
        </div>
      )}

      {/* =====================================================
          KPI STATS GRID
      ===================================================== */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Catering Orders"
          value={isLoading ? "..." : stats.total}
          hint="All registered events"
          icon={FiCalendar}
          iconBg="bg-slate-100"
          iconColor="text-slate-900"
          trend={`${stats.total} total`}
          onClick={() => navigate("/admin/orders")}
        />

        <StatCard
          title="Confirmed Events"
          value={isLoading ? "..." : stats.confirmed}
          hint="Active scheduled orders"
          icon={FiCheckCircle}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          trend="Upcoming"
          trendPositive={true}
          onClick={() => {
            setStatusFilter("Confirmed");
            navigate("/admin/orders");
          }}
        />

        <StatCard
          title="Pending Attention"
          value={isLoading ? "..." : stats.pending}
          hint="Awaiting final confirmation"
          icon={FiClock}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          trend="Action required"
          onClick={() => {
            setStatusFilter("Pending");
            navigate("/admin/orders");
          }}
        />

        <StatCard
          title="Completed Events"
          value={isLoading ? "..." : stats.completed}
          hint="Successfully delivered"
          icon={FiTrendingUp}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          trend="Done"
          trendPositive={true}
          onClick={() => {
            setStatusFilter("Completed");
            navigate("/admin/orders");
          }}
        />
      </div>

      {/* =====================================================
          SECONDARY METRICS & QUICK SHORTCUTS
      ===================================================== */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to="/admin/items"
          className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
              <FiLayers size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Menu Catalog
              </p>
              <h4 className="text-xl font-bold text-slate-900">
                {itemsLoading ? "..." : `${stats.totalItems} Items`}
              </h4>
              <p className="text-xs text-slate-500">Dishes & preparation mapping</p>
            </div>
          </div>
          <FiArrowRight className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700" />
        </Link>

        <Link
          to="/admin/material"
          className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600">
              <FiPackage size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Raw Materials
              </p>
              <h4 className="text-xl font-bold text-slate-900">
                {materialsLoading ? "..." : `${stats.totalMaterials} Materials`}
              </h4>
              <p className="text-xs text-slate-500">Inventory ingredients list</p>
            </div>
          </div>
          <FiArrowRight className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700" />
        </Link>

        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-white font-bold text-sm">
              {(user?.name || "A").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Logged In Role
              </p>
              <h4 className="text-base font-bold capitalize text-slate-900">
                {user?.role || "Admin"}
              </h4>
              <p className="text-xs text-slate-500">{user?.email || "System User"}</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-600/20">
            Active
          </span>
        </div>
      </div>

      {/* =====================================================
          UPCOMING EVENTS TIMELINE WIDGET
      ===================================================== */}
      {upcomingEvents.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Upcoming Events Schedule</h3>
              <p className="text-xs text-slate-500">Next catering functions and event dates</p>
            </div>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:underline"
            >
              View All Orders <FiArrowRight />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {upcomingEvents.map((evt) => {
              const countdown = getDaysRemainingLabel(evt.startDate);
              return (
                <div
                  key={evt._id}
                  onClick={() => navigate(`/admin/orders/${evt._id}`)}
                  className="group cursor-pointer rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900">
                      <FiCalendar className="text-slate-400" />
                      {formatOrderDate(evt.startDate)}
                    </span>
                    {countdown && (
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 ring-1 ring-indigo-600/20">
                        {countdown}
                      </span>
                    )}
                  </div>

                  <h4 className="mt-3 truncate text-sm font-bold text-slate-900 group-hover:text-indigo-600">
                    {evt.clientName}
                  </h4>

                  <div className="mt-2 space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 truncate">
                      <FiPhone className="shrink-0 text-slate-400" />
                      <span>{evt.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <FiMapPin className="shrink-0 text-slate-400" />
                      <span className="truncate">{evt.address}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${getOrderStatusBadgeClass(
                        evt.status
                      )}`}
                    >
                      {evt.status}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-900">
                      View details →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================
          RECENT ORDERS TABLE SECTION
      ===================================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Table Controls */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Orders Register</h3>
            <p className="text-xs text-slate-500">Live order status and event details</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs">
              {["All", "Pending", "Confirmed", "Completed"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                    statusFilter === tab
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        {ordersLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
            <p className="mt-3 text-xs font-medium text-slate-500">Loading live orders...</p>
          </div>
        ) : (
          <OrderTable
            orders={filteredOrders}
            onDelete={handleDeleteOrder}
            deleting={deleteOrderMutation.isPending}
          />
        )}
      </div>

      {/* =====================================================
          ADD ORDER MODAL
      ===================================================== */}
      <AddOrderModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
