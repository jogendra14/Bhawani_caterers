// src/components/ProtectedRoute.jsx

import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {

  const {
    user,
    loading,
    isAdmin,
  } = useAuth();

  const location = useLocation();

  // =========================================================
  // CHECKING AUTH
  // =========================================================

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">

        <div className="text-center">

          <div
            className="
              mx-auto
              h-10
              w-10
              animate-spin
              rounded-full
              border-4
              border-slate-300
              border-t-slate-900
            "
          />

          <p className="mt-4 text-sm text-slate-600">
            Checking authentication...
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // NOT LOGGED IN
  // =========================================================

  if (!user) {

    return (
      <Navigate
        to="/"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  // =========================================================
  // NOT ADMIN
  // =========================================================

  if (!isAdmin) {

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  // =========================================================
  // AUTHENTICATED
  // =========================================================

  return <Outlet />;
};

export default ProtectedRoute;