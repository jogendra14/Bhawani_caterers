// src/components/dashboard/StatCard.jsx
import React from "react";

export default function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  iconBg = "bg-slate-100",
  iconColor = "text-slate-700",
  trend,
  trendPositive,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 ${
        onClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
        </div>

        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${iconBg} ${iconColor} shadow-inner`}>
          {typeof Icon === "function" ? <Icon size={22} /> : Icon}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <span className="truncate font-medium text-slate-500">{hint}</span>
        {trend && (
          <span
            className={`font-semibold ${
              trendPositive ? "text-emerald-600" : "text-slate-500"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
