// src/context/AuthContext.jsx

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import userApi from "../api/userApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // LOGIN
  // =========================================================

  const login = async (email, password) => {

    const response = await userApi.login({
      email,
      password,
    });

    const data = response?.data?.data;

    if (!data?.accessToken || !data?.user) {
      throw new Error("Invalid login response from server");
    }

    const {
      user: loggedInUser,
      accessToken,
    } = data;

    localStorage.setItem(
      "accessToken",
      accessToken
    );

    localStorage.setItem(
      "user",
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);

    return loggedInUser;
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = async () => {

    try {
      await userApi.logout();
    } catch (error) {
      console.error(
        "Logout API error:",
        error
      );
    } finally {

      localStorage.removeItem(
        "accessToken"
      );

      localStorage.removeItem(
        "user"
      );

      setUser(null);
    }
  };

  // =========================================================
  // CHECK AUTH
  // =========================================================

  const checkAuth = async () => {

    setLoading(true);

    try {

      let token =
        localStorage.getItem(
          "accessToken"
        );

      // -----------------------------------------------------
      // No access token -> try refresh
      // -----------------------------------------------------

      if (!token) {

        try {

          const refreshResponse =
            await userApi.refreshToken();

          const newToken =
            refreshResponse?.data?.data?.accessToken;

          if (!newToken) {
            throw new Error(
              "Refresh token response does not contain accessToken"
            );
          }

          localStorage.setItem(
            "accessToken",
            newToken
          );

          token = newToken;

        } catch (refreshError) {

          setUser(null);

          localStorage.removeItem(
            "accessToken"
          );

          localStorage.removeItem(
            "user"
          );

          return;
        }
      }

      // -----------------------------------------------------
      // Token exists -> get current user
      // -----------------------------------------------------

      const response =
        await userApi.getMe();

      const currentUser =
        response?.data?.data;

      if (!currentUser) {
        throw new Error(
          "User data not found"
        );
      }

      setUser(currentUser);

      localStorage.setItem(
        "user",
        JSON.stringify(currentUser)
      );

    } catch (error) {

      console.error(
        "Auth check failed:",
        error
      );

      setUser(null);

      localStorage.removeItem(
        "accessToken"
      );

      localStorage.removeItem(
        "user"
      );

    } finally {

      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL AUTH CHECK
  // =========================================================

  //useEffect(() => {
  //  checkAuth();
  //}, []);

  // =========================================================
  // AUTH VALUES
  // =========================================================

  const isAuthenticated = !!user;

  const isSuperAdmin =
    user?.role === "superadmin";

  const isAdmin =
    user?.role === "admin" ||
    user?.role === "superadmin";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,

        login,
        logout,

        isAuthenticated,
        isAdmin,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// =========================================================
// HOOK
// =========================================================

export const useAuth = () => {

  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};