import { useState } from 'react';

const initialForm = {
  date: new Date().toLocaleDateString('en-GB'),
  address: '',
  clientName: '',
  phone: '',
  status: 'Pending',
};

export default function AddOrderModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm);

  if (!open) {
    return null;
  }

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const submit = (event) => {
    event.preventDefault();
    onSubmit(form);
    setForm(initialForm);
  };

  const close = () => {
    setForm(initialForm);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 grid place-items-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-mdl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Add New Order</h3>
            <p className="mt-1 text-sm text-slate-500">Enter customer details for the register.</p>
          </div>

          <button
            type="button"
            onClick={close}
            className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Date from" name="date" value={form.date} onChange={update} />
          <Field label="To" name="date" value={form.date} onChange={update} />
          <Field label="Client Name" name="clientName" value={form.clientName} onChange={update} required />
          <Field label="Phone Number" name="phone" value={form.phone} onChange={update} required />

          <Field
            label="Address"
            name="address"
            value={form.address}
            onChange={update}
            wrapperClass="sm:col-span-2"
            required
          />

          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Status</span>
            <select
              name="status"
              value={form.status}
              onChange={update}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-0 focus:border-slate-500"
            >
              <option>Pending</option>
              <option>Completed</option>
            </select>
          </label>

          <div className="flex justify-end gap-3 sm:col-span-2">
            <button
              type="button"
              onClick={close}
              className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Save Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, required = false, wrapperClass = '' }) {
  return (
    <label className={wrapperClass}>
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
      />
    </label>
  );
}
