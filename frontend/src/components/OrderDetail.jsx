// src/components/OrderDetail.jsx
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit3, FiCalendar, FiPhone, FiMapPin, FiClock, FiPlus } from "react-icons/fi";
import { useOrder, useOrderMenu } from "../hooks/useOrders.js";
import { formatOrderDate, getOrderStatusClass, getOrderStatusBadgeClass } from "../utils/orderUtils.js";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: order, isLoading: orderLoading, isError, error } = useOrder(id);
  const { data: orderMenu, isLoading: menuLoading } = useOrderMenu(id);

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
          <p className="mt-1 text-sm text-red-500">
            {error?.response?.data?.message || "The requested order could not be located."}
          </p>
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
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50"
            title="Back"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Order: {order.clientName}
            </h1>
            <p className="text-xs text-slate-500">ID: {order._id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/admin/orders/${order._id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <FiEdit3 /> Edit Order
          </Link>
          <Link
            to={`/admin/menu/add/${order._id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <FiPlus /> Manage Menu
          </Link>
        </div>
      </div>

      {/* Main Info Overview Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Client & Contact Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Client Details
          </p>
          <h3 className="mt-2 text-lg font-bold text-slate-900">{order.clientName}</h3>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <FiPhone className="text-slate-400" />
              <a href={`tel:${order.phone}`} className="hover:underline">
                {order.phone}
              </a>
            </div>
            <div className="flex items-start gap-2">
              <FiMapPin className="mt-0.5 shrink-0 text-slate-400" />
              <span>{order.address}</span>
            </div>
          </div>
        </div>

        {/* Date & Schedule Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Event Timeline
          </p>
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <FiCalendar className="text-slate-400" />
              <span className="font-medium text-slate-600">From:</span>
              <span className="font-semibold text-slate-900">
                {formatOrderDate(order.startDate)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FiCalendar className="text-slate-400" />
              <span className="font-medium text-slate-600">To:</span>
              <span className="font-semibold text-slate-900">
                {formatOrderDate(order.endDate || order.startDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Current Status
            </p>
            <div className="mt-3">
              <span
                className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${getOrderStatusBadgeClass(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
            Created: {formatOrderDate(order.createdAt)}
          </div>
        </div>
      </div>

      {/* Menu & Catering Items Section */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Menu & Meal Sessions</h2>
            <p className="text-xs text-slate-500">
              Scheduled dishes and catering items day by day
            </p>
          </div>

          <Link
            to={`/admin/menu/add/${order._id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            <FiPlus /> Configure Menu
          </Link>
        </div>

        {menuLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading menu configuration...
          </div>
        ) : !orderMenu?.days?.length ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-slate-700">No menu items configured yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Add meals, morning breakfast, lunch, high-tea, and dinner items for this event.
            </p>
            <Link
              to={`/admin/menu/add/${order._id}`}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              <FiPlus /> Create Menu
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orderMenu.days.map((day) => (
              <div key={day.day} className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                      D{day.day}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Day {day.day}
                      </h3>
                      <p className="text-xs text-slate-400">{formatOrderDate(day.date)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {["Morning", "Afternoon", "Evening", "Night"].map((time) => {
                    const timeData = day.times?.[time];
                    const items = Array.isArray(timeData)
                      ? timeData
                      : timeData?.items || [];
                    const persons = timeData?.persons || 0;

                    return (
                      <div
                        key={time}
                        className="rounded-xl border border-slate-200 bg-slate-50/50 p-3"
                      >
                        <div className="mb-2 flex items-center justify-between border-b border-slate-200/80 pb-2">
                          <div className="flex items-center gap-1.5">
                            <FiClock className="text-slate-400 text-xs" />
                            <span className="text-xs font-bold text-slate-800">{time}</span>
                          </div>
                          {persons > 0 && (
                            <span className="text-[11px] font-medium text-slate-500">
                              {persons} pax
                            </span>
                          )}
                        </div>

                        {items.length === 0 ? (
                          <p className="py-2 text-xs italic text-slate-400">No items</p>
                        ) : (
                          <ul className="space-y-1 text-xs">
                            {items.map((item, idx) => (
                              <li
                                key={item._id || idx}
                                className="flex items-center gap-1.5 font-medium text-slate-700"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                <span>{item.name || item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
