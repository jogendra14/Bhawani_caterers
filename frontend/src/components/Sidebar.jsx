import { NavLink } from "react-router-dom";

const navigation = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: "⌂",
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: "▤",
  },
  {
    label: "Items",
    path: "/admin/items",
    icon: "▦",
  },
  {
    label: "Material",
    path: "/admin/material",
    icon: "◫",
  },
  {
    label: "About Us",
    path: "/admin/about",
    icon: "ⓘ",
  },
];

export default function Sidebar({ user, isOpen, onClose, onLogout, }) {
  return (
    <aside
      className={` fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-white shadow-2xl transition-transform duration-300
        ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }
        lg:translate-x-0
      `}
    >

      <div className="flex h-full flex-col">
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
              Private Panel
            </p>
            <h2 className="mt-1 text-xl font-bold">
              Admin Dashboard
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
          >
            ✕
          </button>

        </div>

        {/* ================= NAVIGATION ================= */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `
                flex
                items-center
                gap-3
                rounded-xl
                px-4
                py-3
                text-sm
                font-medium
                transition

                ${
                  isActive
                    ? "bg-white text-slate-950 shadow"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }
                `
              }
            >

              <span
                className="
                  grid
                  h-8
                  w-8
                  shrink-0
                  place-items-center
                  rounded-lg
                  bg-white/10
                  text-base
                "
              >
                {item.icon}
              </span>

              {item.label}

            </NavLink>

          ))}


          {/* SUPER ADMIN */}

          {user?.role === "superadmin" && (

            <NavLink
              to="/admin/users"
              onClick={onClose}
              className={({ isActive }) =>
                `
                flex
                items-center
                gap-3
                rounded-xl
                px-4
                py-3
                text-sm
                font-medium
                transition

                ${
                  isActive
                    ? "bg-white text-slate-950"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }
                `
              }
            >

              <span
                className="
                  grid
                  h-8
                  w-8
                  place-items-center
                  rounded-lg
                  bg-white/10
                "
              >
                ◉
              </span>

              Users

            </NavLink>

          )}

        </nav>


        {/* ================= USER ================= */}

        <div className="border-t border-white/10 p-4">

          <div className="rounded-xl bg-white/5 p-3">

            <p className="truncate text-sm font-semibold">
              {user?.name || "Admin"}
            </p>

            <p className="truncate text-xs text-white/50">
              {user?.email || ""}
            </p>

            <p
              className="
                mt-2
                inline-flex
                rounded-full
                bg-white/10
                px-2.5
                py-1
                text-[11px]
                font-semibold
                uppercase
                tracking-wide
                text-white/70
              "
            >
              {user?.role || "admin"}
            </p>

          </div>


          <button
            type="button"
            onClick={onLogout}
            className="
              mt-3
              w-full
              rounded-xl
              border
              border-white/10
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white/80
              transition
              hover:bg-white/10
              hover:text-white
            "
          >
            Logout
          </button>

        </div>

      </div>

    </aside>
  );
}