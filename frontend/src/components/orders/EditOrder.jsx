// src/components/orders/EditOrder.jsx
import { useState, useMemo } from "react";
import { FiX, FiCalendar, FiUser, FiPhone, FiMapPin } from "react-icons/fi";
import { useUpdateOrder } from "../../hooks/useOrders.js";

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateForInput = (date) => {
  if (!date) return getTodayDate();
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildFormFromOrder = (order) => ({
  startDate: formatDateForInput(order?.startDate || order?.date),
  endDate: formatDateForInput(order?.endDate || order?.startDate || order?.date),
  clientName: order?.clientName || "",
  phone: order?.phone || "",
  address: order?.address || "",
  status: order?.status || "Pending",
});

export default function EditOrder({ order, onClose, onOrderUpdated }) {
  const updateOrder = useUpdateOrder();
  const [form, setForm] = useState(() => buildFormFromOrder(order));
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Event duration in days
  const eventDuration = useMemo(() => {
    if (!form.startDate || !form.endDate) return null;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : null;
  }, [form.startDate, form.endDate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.startDate) {
      setError("Starting date is required");
      return;
    }

    if (form.endDate < form.startDate) {
      setError("Ending date cannot be before starting date");
      return;
    }

    if (!form.clientName.trim()) {
      setError("Client name is required");
      return;
    }

    if (!form.phone.trim()) {
      setError("Phone number is required");
      return;
    }

    if (!form.address.trim()) {
      setError("Address is required");
      return;
    }

    try {
      setError("");

      const updatedOrder = await updateOrder.mutateAsync({
        id: order._id,
        data: {
          startDate: form.startDate,
          endDate: form.endDate,
          clientName: form.clientName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          status: form.status,
        },
      });

      onOrderUpdated?.(updatedOrder);
      onClose();
    } catch (submitError) {
      console.error("Update order error:", submitError);
      setError(submitError.response?.data?.message || "Failed to update order");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit Catering Order</h2>
            <p className="text-xs text-slate-500">Update event schedule, client info, or order status</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={updateOrder.isPending}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Event Dates & Duration */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Event Schedule
              </label>
              {eventDuration && (
                <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-bold text-white">
                  {eventDuration} {eventDuration === 1 ? "Day Event" : "Days Event"}
                </span>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="mb-1 block text-xs font-medium text-slate-500">Start Date</span>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  disabled={updateOrder.isPending}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                />
              </div>

              <div>
                <span className="mb-1 block text-xs font-medium text-slate-500">End Date</span>
                <input
                  type="date"
                  name="endDate"
                  min={form.startDate}
                  value={form.endDate}
                  onChange={handleChange}
                  disabled={updateOrder.isPending}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                />
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                <FiUser className="text-slate-400" /> Client Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="clientName"
                value={form.clientName}
                onChange={handleChange}
                placeholder="Client Name"
                required
                disabled={updateOrder.isPending}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                <FiPhone className="text-slate-400" /> Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                required
                disabled={updateOrder.isPending}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              />
            </div>
          </div>

          {/* Venue Address */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
              <FiMapPin className="text-slate-400" /> Venue / Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={2}
              required
              disabled={updateOrder.isPending}
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Order Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={updateOrder.isPending}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={updateOrder.isPending}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updateOrder.isPending}
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateOrder.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
