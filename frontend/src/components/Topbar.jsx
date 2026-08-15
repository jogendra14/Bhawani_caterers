// src/components/Topbar.jsx
import { Bell, Search, Menu, X, User, Settings, LogOut, ChevronDown, Store } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";

export default function Topbar({ toggleSidebar, isSidebarOpen, user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  // =========================================================
  // PAGE TITLE
  // =========================================================

  const getPageTitle = () => {
    const path = location.pathname.split("/").filter(Boolean).pop();

    if (!path) {
      return "Dashboard";
    }

    const titles = {
      dashboard: "Dashboard",
      orders: "Orders",
      items: "Items",
      material: "Material",
      about: "About Us",
      users: "Users",
      profile: "My Profile",
      settings: "Settings",
    };

    return titles[path] || path.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // =========================================================
  // CLOSE DROPDOWNS ON OUTSIDE CLICK
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }

      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    setShowUserMenu(false);

    const confirmed = window.confirm("Are you sure you want to logout?");

    if (!confirmed) {
      return;
    }

    try {
      await logout();

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  const notifications = [
    {
      id: 1,
      text: "New order received #1234",
      time: "5 min ago",
      unread: true,
    },
    {
      id: 2,
      text: "Low stock alert: Product XYZ",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      text: "New user registered",
      time: "3 hours ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((notification) => notification.unread).length;

  // =========================================================
  // MARK ALL READ
  // =========================================================

  const handleMarkAllRead = () => {
    // Later backend API yahan connect kar sakte ho.

    setShowNotifications(false);
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      return;
    }

    console.log("Search:", query);

    // Later global search API yahan connect kar sakte ho.
  };

  return (
    <header
      className="
        fixed
        top-0
        right-0
        left-0
        lg:left-72
        z-30
        flex
        h-16
        items-center
        justify-between
        border-b
        border-gray-200
        bg-white
        px-3
        shadow-sm
        sm:px-4
      "
    >
      {/* =====================================================
          LEFT SECTION
      ===================================================== */}

      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        {/* MOBILE MENU */}

        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="
            rounded-lg
            p-2
            text-gray-600
            transition
            hover:bg-gray-100
            hover:text-gray-900
            lg:hidden
          "
        >
          {isSidebarOpen ?
            <X size={22} />
          : <Menu size={22} />}
        </button>

        {/* PAGE TITLE */}

        <div className="hidden sm:block shrink-0">
          <h1 className="text-lg font-bold text-gray-800">{getPageTitle()}</h1>
        </div>

        {/* SEARCH */}

        <form
          onSubmit={handleSearchSubmit}
          className="
            hidden
            min-w-0
            flex-1
            md:flex
            md:max-w-md
            lg:ml-2
          "
        >
          <div
            className="
              flex
              w-full
              items-center
              gap-2
              rounded-xl
              bg-gray-100
              px-3
              py-2
              transition
              focus-within:bg-white
              focus-within:ring-2
              focus-within:ring-slate-900/10
            "
          >
            <Search size={18} className="shrink-0 text-gray-400" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything..."
              className="
                min-w-0
                flex-1
                bg-transparent
                text-sm
                text-gray-800
                outline-none
                placeholder:text-gray-400
              "
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="
                  rounded
                  p-1
                  text-gray-400
                  hover:bg-gray-200
                  hover:text-gray-700
                "
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}

            <kbd
              className="
                hidden
                rounded
                bg-gray-200
                px-2
                py-0.5
                font-mono
                text-[10px]
                text-gray-500
                lg:inline-block
              "
            >
              Ctrl K
            </kbd>
          </div>
        </form>
      </div>

      {/* =====================================================
          RIGHT SECTION
      ===================================================== */}

      <div className="ml-2 flex shrink-0 items-center gap-1 sm:gap-2">
        {/* ===================================================
            NOTIFICATIONS
        =================================================== */}

        <div ref={notificationRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications((previous) => !previous);

              setShowUserMenu(false);
            }}
            aria-label="Notifications"
            className="
              relative
              rounded-lg
              p-2
              text-gray-600
              transition
              hover:bg-gray-100
              hover:text-gray-900
            "
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span
                className="
                  absolute
                  -right-0.5
                  -top-0.5
                  flex
                  h-5
                  min-w-5
                  items-center
                  justify-center
                  rounded-full
                  bg-red-500
                  px-1
                  text-[10px]
                  font-bold
                  text-white
                  ring-2
                  ring-white
                "
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* NOTIFICATION DROPDOWN */}

          {showNotifications && (
            <div
              className="
                absolute
                right-0
                top-full
                mt-2
                w-[calc(100vw-24px)]
                max-w-sm
                overflow-hidden
                rounded-2xl
                border
                border-gray-200
                bg-white
                shadow-2xl
              "
            >
              {/* HEADER */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-gray-100
                  px-4
                  py-3
                "
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Notifications</h3>

                  <p className="text-xs text-gray-500">{unreadCount} unread</p>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="
                      text-xs
                      font-semibold
                      text-blue-600
                      hover:text-blue-800
                    "
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* LIST */}

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ?
                  <div className="px-4 py-8 text-center">
                    <Bell size={24} className="mx-auto text-gray-300" />

                    <p className="mt-2 text-sm text-gray-500">No notifications</p>
                  </div>
                : notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      className={`
                          flex
                          w-full
                          items-start
                          gap-3
                          border-b
                          border-gray-100
                          px-4
                          py-3
                          text-left
                          transition
                          hover:bg-gray-50
                          ${notification.unread ? "bg-blue-50/50" : ""}
                        `}
                    >
                      <span
                        className={`
                            mt-1.5
                            h-2
                            w-2
                            shrink-0
                            rounded-full
                            ${notification.unread ? "bg-blue-600" : "bg-transparent"}
                          `}
                      />

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-gray-800">{notification.text}</span>

                        <span className="mt-1 block text-xs text-gray-500">{notification.time}</span>
                      </span>
                    </button>
                  ))
                }
              </div>

              {/* FOOTER */}

              <div className="border-t border-gray-100 p-2">
                <button
                  type="button"
                  className="
                    w-full
                    rounded-lg
                    px-3
                    py-2
                    text-center
                    text-sm
                    font-semibold
                    text-blue-600
                    transition
                    hover:bg-blue-50
                  "
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ===================================================
            USER MENU
        =================================================== */}

        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setShowUserMenu((previous) => !previous);

              setShowNotifications(false);
            }}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              p-1.5
              transition
              hover:bg-gray-100
            "
            aria-label="User menu"
          >
            {/* AVATAR */}

            <img
              src={user?.avatar || "https://i.pravatar.cc/100"}
              alt={user?.name || "Admin"}
              className="
                h-9
                w-9
                rounded-full
                object-cover
                ring-2
                ring-slate-900
                ring-offset-2
              "
            />

            {/* USER INFO */}

            <div className="hidden text-left md:block">
              <p className="max-w-32 truncate text-sm font-semibold leading-tight text-gray-800">{user?.name || "Admin"}</p>

              <p className="text-xs capitalize text-gray-500">{user?.role || "Admin"}</p>
            </div>

            <ChevronDown size={16} className="hidden text-gray-400 md:block" />
          </button>

          {/* USER DROPDOWN */}

          {showUserMenu && (
            <div
              className="
                absolute
                right-0
                top-full
                mt-2
                w-64
                overflow-hidden
                rounded-2xl
                border
                border-gray-200
                bg-white
                shadow-2xl
              "
            >
              {/* USER INFO */}

              <div
                className="
                  border-b
                  border-gray-100
                  px-4
                  py-4
                "
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user?.avatar || "https://i.pravatar.cc/100"}
                    alt={user?.name || "Admin"}
                    className="
                      h-11
                      w-11
                      rounded-full
                      object-cover
                    "
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900">{user?.name || "Admin"}</p>

                    <p className="truncate text-xs text-gray-500">{user?.email || ""}</p>

                    <span
                      className="
                        mt-1
                        inline-flex
                        rounded-full
                        bg-slate-100
                        px-2
                        py-0.5
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-slate-600
                      "
                    >
                      {user?.role || "admin"}
                    </span>
                  </div>
                </div>
              </div>

              {/* MENU */}

              <div className="p-2">
                <Link
                  to="/admin/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    text-gray-700
                    transition
                    hover:bg-gray-100
                  "
                >
                  <User size={17} />

                  <span>My Profile</span>
                </Link>

                <Link
                  to="/admin/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    text-gray-700
                    transition
                    hover:bg-gray-100
                  "
                >
                  <Settings size={17} />

                  <span>Settings</span>
                </Link>
              </div>

              <div className="border-t border-gray-100 p-2">
                {/* VISIT STORE */}

                <Link
                  to="/"
                  onClick={() => setShowUserMenu(false)}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    text-gray-700
                    transition
                    hover:bg-gray-100
                  "
                >
                  <Store size={17} />

                  <span>Visit Store</span>
                </Link>

                {/* LOGOUT */}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-sm
                    font-semibold
                    text-red-600
                    transition
                    hover:bg-red-50
                  "
                >
                  <LogOut size={17} />

                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
