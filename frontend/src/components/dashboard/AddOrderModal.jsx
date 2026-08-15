// src/components/dashboard/AddOrderModal.jsx
import { useState } from "react";
import { FiX, FiCalendar, FiUser, FiPhone, FiMapPin } from "react-icons/fi";
import { useCreateOrder } from "../../hooks/useOrders.js";

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const initialForm = {
  startDate: getTodayDate(),
  endDate: getTodayDate(),
  clientName: "",
  phone: "",
  address: "",
  status: "Pending",
};

export default function AddOrderModal({ open, onClose }) {
  const createOrder = useCreateOrder();
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");

  if (!open) return null;

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const close = () => {
    if (createOrder.isPending) return;
    setForm(initialForm);
    setFormError("");
    onClose();
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!form.startDate) {
      setFormError("Event start date is required");
      return;
    }

    if (form.endDate < form.startDate) {
      setFormError("End date cannot be earlier than start date");
      return;
    }

    if (!form.clientName.trim()) {
      setFormError("Client name is required");
      return;
    }

    if (!form.phone.trim()) {
      setFormError("Phone number is required");
      return;
    }

    if (!form.address.trim()) {
      setFormError("Event address is required");
      return;
    }

    try {
      setFormError("");
      await createOrder.mutateAsync({
        startDate: form.startDate,
        endDate: form.endDate,
        clientName: form.clientName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        status: form.status,
      });

      setForm(initialForm);
      onClose();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create order");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      onMouseDown={close}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Add New Catering Order</h3>
            <p className="text-xs text-slate-500">Register new event and customer details</p>
          </div>

          <button
            type="button"
            onClick={close}
            disabled={createOrder.isPending}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <FiX size={18} />
          </button>
        </div>

        {formError && (
          <div className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
            {formError}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <FiCalendar className="text-slate-400" /> Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={update}
                disabled={createOrder.isPending}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <FiCalendar className="text-slate-400" /> End Date
              </label>
              <input
                type="date"
                name="endDate"
                min={form.startDate}
                value={form.endDate}
                onChange={update}
                disabled={createOrder.isPending}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <FiUser className="text-slate-400" /> Client Name
              </label>
              <input
                type="text"
                name="clientName"
                value={form.clientName}
                onChange={update}
                placeholder="e.g. Ramesh Chandra"
                required
                disabled={createOrder.isPending}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <FiPhone className="text-slate-400" /> Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={update}
                placeholder="e.g. 9876543210"
                required
                disabled={createOrder.isPending}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <FiMapPin className="text-slate-400" /> Event Venue & Address
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={update}
              placeholder="e.g. Royal Palace Garden, Mansarovar, Jaipur"
              rows={2}
              required
              disabled={createOrder.isPending}
              className="w-full resize-none rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">Initial Status</label>
            <select
              name="status"
              value={form.status}
              onChange={update}
              disabled={createOrder.isPending}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={close}
              disabled={createOrder.isPending}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createOrder.isPending}
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
            >
              {createOrder.isPending ? "Creating..." : "Create Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
