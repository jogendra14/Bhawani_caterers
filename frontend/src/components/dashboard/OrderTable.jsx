// src/components/dashboard/OrderTable.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiEdit } from "react-icons/bi";
import { MdDeleteForever } from "react-icons/md";
import { FiCalendar, FiPhone, FiMapPin, FiExternalLink } from "react-icons/fi";
import { formatOrderDate, getOrderStatusBadgeClass } from "../../utils/orderUtils.js";
import EditOrder from "../orders/EditOrder.jsx";

export default function OrderTable({ orders = [], onDelete, deleting = false }) {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);

  if (!orders.length) {
    return (
      <div className="p-12 text-center">
        <p className="text-sm font-semibold text-slate-700">No matching orders found</p>
        <p className="mt-1 text-xs text-slate-400">
          Orders will appear here once registered.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3.5 text-center">#</th>
              <th className="px-4 py-3.5">Event Date</th>
              <th className="px-4 py-3.5">Client Name</th>
              <th className="px-4 py-3.5">Contact Phone</th>
              <th className="px-4 py-3.5">Venue Location</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {orders.map((order, index) => (
              <tr
                key={order._id}
                onClick={() => navigate(`/admin/orders/${order._id}`)}
                className="cursor-pointer transition-colors hover:bg-slate-50/80"
              >
                <td className="px-4 py-3.5 text-center font-semibold text-slate-400">
                  {index + 1}
                </td>

                <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <FiCalendar className="text-slate-400" />
                    <span>{formatOrderDate(order.startDate)}</span>
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-900">
                  {order.clientName}
                </td>

                <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-slate-400 text-xs" />
                    <span>{order.phone}</span>
                    {order.phone && (
                      <a
                        href={`https://wa.me/91${order.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="Chat on WhatsApp"
                        className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100"
                      >
                        WA
                      </a>
                    )}
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
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                      }}
                      title="Edit order"
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      <BiEdit size={18} />
                    </button>

                    {onDelete && (
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(order);
                        }}
                        title="Delete order"
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                      >
                        <MdDeleteForever size={19} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <EditOrder
          key={selectedOrder._id}
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onOrderUpdated={() => setSelectedOrder(null)}
        />
      )}
    </>
  );
}
