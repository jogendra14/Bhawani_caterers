// src/components/dashboard/EditOrderModal.jsx
import EditOrder from "../orders/EditOrder.jsx";

export default function EditOrderModal({ open, onClose, order, onOrderUpdated }) {
  if (!open || !order) return null;

  return (
    <EditOrder
      order={order}
      onClose={onClose}
      onOrderUpdated={onOrderUpdated}
    />
  );
}
