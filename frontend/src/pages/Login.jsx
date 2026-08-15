// src/pages/Login.jsx

import { useEffect, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Login = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    user,
    loading: authLoading,
  } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // ALREADY LOGGED IN
  // =========================================================

  if (!authLoading && user) {

    return (
      <Navigate
        to="/admin/dashboard"
        replace
      />
    );
  }

  // =========================================================
  // INPUT
  // =========================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // LOGIN
  // =========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setLoading(true);

    try {

      const loggedInUser =
        await login(
          formData.email.trim(),
          formData.password
        );

      // -----------------------------------------------------
      // Optional role validation
      // -----------------------------------------------------

      const allowedRoles = [
        "admin",
        "superadmin",
      ];

      if (
        !allowedRoles.includes(
          loggedInUser?.role
        )
      ) {

        throw new Error(
          "You are not authorized to access the admin panel."
        );
      }

      // -----------------------------------------------------
      // Redirect
      // -----------------------------------------------------

      const from =
        location.state?.from?.pathname;

      if (
        from &&
        from !== "/"
      ) {

        navigate(
          from,
          {
            replace: true,
          }
        );

      } else {

        navigate(
          "/admin/dashboard",
          {
            replace: true,
          }
        );
      }

    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      setError(
        error?.response?.data?.message ||
        error?.message ||
        "Invalid email or password"
      );

    } finally {

      setLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">

      <div className="w-full max-w-md">

        <div className="mb-8 text-center text-white">

          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
            Private Business
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Admin Panel
          </h1>

          <p className="mt-2 text-sm text-white/50">
            Authorized personnel only
          </p>

        </div>

        <div className="rounded-2xl bg-white p-8 shadow-2xl">

          <h2 className="text-2xl font-bold text-slate-900">
            Welcome back
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Sign in to continue to your dashboard.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="username"
                placeholder="admin@example.com"
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  px-4
                  py-3
                  text-sm
                  outline-none
                  transition
                  focus:border-slate-900
                  focus:ring-2
                  focus:ring-slate-900/10
                "
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  px-4
                  py-3
                  text-sm
                  outline-none
                  transition
                  focus:border-slate-900
                  focus:ring-2
                  focus:ring-slate-900/10
                "
              />

            </div>

            {/* BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                rounded-xl
                bg-slate-950
                px-4
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-slate-800
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>

          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            This system is private and restricted to authorized staff.
          </p>

        </div>

      </div>

    </div>
  );
};

export default Login;