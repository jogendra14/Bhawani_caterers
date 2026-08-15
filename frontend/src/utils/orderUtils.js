export const formatOrderDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const getOrderStatusClass = (status) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-700";
    case "Confirmed":
      return "bg-blue-100 text-blue-700";
    case "Cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
};

export const getOrderStatusBadgeClass = (status) => {
  switch (status) {
    case "Completed":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    case "Confirmed":
      return "bg-blue-50 text-blue-700 ring-blue-600/20";
    case "Cancelled":
      return "bg-red-50 text-red-700 ring-red-600/20";
    default:
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
  }
};
