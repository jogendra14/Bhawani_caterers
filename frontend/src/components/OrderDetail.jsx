// src/components/OrderDetail.jsx
import { useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit3, FiCalendar, FiPhone, FiMapPin, FiClock, FiPlus, FiTrash2, FiPrinter, FiUsers, FiCheckCircle, FiShare2 } from "react-icons/fi";
import { useOrder, useOrderMenu, useDeleteOrder, useUpdateOrder } from "../hooks/useOrders.js";
import { formatOrderDate, getOrderStatusBadgeClass } from "../utils/orderUtils.js";
import EditOrder from "./orders/EditOrder.jsx";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: order, isLoading: orderLoading, isError, error } = useOrder(id);
  const { data: orderMenu, isLoading: menuLoading } = useOrderMenu(id);
  const deleteOrderMutation = useDeleteOrder();
  const updateOrderMutation = useUpdateOrder();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Event Duration calculation
  const eventDuration = useMemo(() => {
    if (!order?.startDate) return 1;
    const start = new Date(order.startDate);
    const end = new Date(order.endDate || order.startDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
  }, [order?.startDate, order?.endDate]);

  // Total menu items count across all days & sessions
  const menuStats = useMemo(() => {
    if (!orderMenu?.days?.length) return { totalItems: 0, maxPersons: 0 };
    let totalItems = 0;
    let maxPersons = 0;

    orderMenu.days.forEach((day) => {
      ["Morning", "Afternoon", "Evening", "Night"].forEach((time) => {
        const timeData = day.times?.[time];
        const items = Array.isArray(timeData) ? timeData : timeData?.items || [];
        totalItems += items.length;
        const persons = Number(timeData?.persons || 0);
        if (persons > maxPersons) maxPersons = persons;
      });
    });

    return { totalItems, maxPersons };
  }, [orderMenu]);

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete order for "${order?.clientName}"? This will also remove all configured menus for this order.`,
    );
    if (!confirmed) return;
    deleteOrderMutation.mutate(order._id, {
      onSuccess: () => {
        navigate("/admin/orders");
      },
    });
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus === order.status) return;
    updateOrderMutation.mutate({
      id: order._id,
      data: {
        ...order,
        status: newStatus,
      },
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (orderLoading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        <p className="mt-4 text-sm font-medium text-slate-500">Loading order details...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-7xl py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-base font-semibold text-red-700">Order Not Found</p>
          <p className="mt-1 text-sm text-red-500">{error?.response?.data?.message || "The requested order could not be located."}</p>
          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <FiArrowLeft /> Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 print:p-0 print:space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50"
            title="Back to Orders"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{order.clientName}</h1>
              <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-white">
                {eventDuration} {eventDuration === 1 ? "Day Event" : "Days Event"}
              </span>
            </div>
            <p className="text-xs text-slate-500">Order ID: {order._id}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            title="Print catering sheet"
          >
            <FiPrinter size={15} /> Print Sheet
          </button>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <FiEdit3 size={15} /> Edit Order
          </button>

          <Link
            to={`/admin/menu/add/${order._id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <FiPlus size={15} /> Manage Menu
          </Link>

          <button
            type="button"
            disabled={deleteOrderMutation.isPending}
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
            title="Delete Order"
          >
            <FiTrash2 size={15} />
          </button>
        </div>
      </div>

      {/* Printable Header (Visible only when printing) */}
      <div className="hidden print:block border-b border-slate-300 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Bhawani Caterers - Order & Menu Sheet</h1>
        <p className="text-sm text-slate-600">
          Client: {order.clientName} | Phone: {order.phone}
        </p>
        <p className="text-xs text-slate-500">Venue: {order.address}</p>
      </div>

      {/* Main Info Overview Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Client & Contact Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Client Details</p>
          <h3 className="mt-2 text-lg font-bold text-slate-900">{order.clientName}</h3>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <FiPhone className="text-slate-400" />
              <a href={`tel:${order.phone}`} className="font-medium text-slate-900 hover:underline">
                {order.phone}
              </a>
              {order.phone && (
                <a
                  href={`https://wa.me/91${order.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 print:hidden"
                >
                  WhatsApp
                </a>
              )}
            </div>
            <div className="flex items-start gap-2">
              <FiMapPin className="mt-0.5 shrink-0 text-slate-400" />
              <span className="leading-snug">{order.address}</span>
            </div>
          </div>
        </div>

        {/* Date & Schedule Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Event Timeline</p>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">{eventDuration} Days Total</span>
          </div>

          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <FiCalendar className="text-slate-400" />
              <span className="font-medium text-slate-600">Start Date:</span>
              <span className="font-semibold text-slate-900">{formatOrderDate(order.startDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FiCalendar className="text-slate-400" />
              <span className="font-medium text-slate-600">End Date:</span>
              <span className="font-semibold text-slate-900">{formatOrderDate(order.endDate || order.startDate)}</span>
            </div>
          </div>
        </div>

        {/* Status Card & Quick Switcher */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Status</p>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${getOrderStatusBadgeClass(order.status)}`}>
                {order.status}
              </span>
            </div>

            {/* Quick Status Buttons */}
            <div className="mt-3 flex flex-wrap gap-1.5 print:hidden">
              {["Pending", "Confirmed", "Completed", "Cancelled"].map((st) => (
                <button
                  key={st}
                  type="button"
                  disabled={updateOrderMutation.isPending}
                  onClick={() => handleStatusChange(st)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    order.status === st ? "bg-slate-900 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">Registered: {formatOrderDate(order.createdAt)}</div>
        </div>
      </div>

      {/* Menu & Catering Items Section */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Menu & Catering Items</h2>
              {menuStats.totalItems > 0 && (
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">{menuStats.totalItems} dishes total</span>
              )}
            </div>
            <p className="text-xs text-slate-500">Schedule of meals across Morning, Afternoon, Evening, and Night</p>
          </div>

          <Link
            to={`/admin/menu/add/${order._id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 print:hidden"
          >
            <FiPlus /> Configure Menu
          </Link>
        </div>

        {menuLoading ?
          <div className="p-12 text-center text-sm text-slate-500">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-3 border-slate-200 border-t-slate-900" />
            <p className="mt-3">Loading menu schedule...</p>
          </div>
        : !orderMenu?.days?.length ?
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-slate-700">No menu items configured yet</p>
            <p className="mt-1 text-xs text-slate-400">Add morning breakfast, lunch, high-tea, and dinner items for this catering function.</p>
            <Link
              to={`/admin/menu/add/${order._id}`}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 print:hidden"
            >
              <FiPlus /> Create Menu
            </Link>
          </div>
        : <div className="divide-y divide-slate-100">
            {orderMenu.days.map((day) => (
              <div key={day.day} className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-900 text-xs font-bold text-white">D{day.day}</span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Day {day.day}</h3>
                      <p className="text-xs text-slate-400">{formatOrderDate(day.date)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {["Morning", "Afternoon", "Evening", "Night"].map((time) => {
                    const timeData = day.times?.[time];
                    const items = Array.isArray(timeData) ? timeData : timeData?.items || [];
                    const persons = timeData?.persons || 0;

                    return (
                      <div key={time} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 print:bg-white">
                        <div className="mb-2.5 flex items-center justify-between border-b border-slate-200/80 pb-2">
                          <div className="flex items-center gap-1.5">
                            <FiClock className="text-slate-400 text-xs" />
                            <span className="text-xs font-bold text-slate-800">{time}</span>
                          </div>
                          {persons > 0 && <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-bold text-blue-700">{persons} persons</span>}
                        </div>

                        {items.length === 0 ?
                          <p className="py-2 text-xs italic text-slate-400">No dishes configured</p>
                        : <ul className="space-y-1.5 text-xs">
                            {items.map((item, idx) => (
                              <li key={item._id || idx} className="flex items-center gap-2 font-medium text-slate-700">
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />
                                <span>{item.name || item}</span>
                              </li>
                            ))}
                          </ul>
                        }
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        }
      </div>

      {/* Edit Order Modal */}
      {isEditModalOpen && <EditOrder order={order} onClose={() => setIsEditModalOpen(false)} />}
    </div>
  );
}
