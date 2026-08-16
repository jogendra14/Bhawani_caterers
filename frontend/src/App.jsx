// src/App.jsx

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import { queryClient } from "./lib/queryClient.js";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Login from "./pages/Login.jsx";
import AdminLayout from "./pages/AdminLayout.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Orders from "./components/Orders.jsx";
import OrderDetail from "./components/OrderDetail.jsx";
import EditOrder from "./components/orders/EditOrder.jsx"
import AddMenu from './components/orders/AddMenu.jsx'
import Items from "./components/Items.jsx";
import Material from "./components/Material.jsx";
// Future pages
// import About from "./pages/About.jsx";
// import Users from "./pages/Users.jsx";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={ <Navigate to="/admin/dashboard" replace /> } />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="orders" element={<Orders />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="orders/:id/edit" element={<EditOrder />} />
                <Route path="menu/add/:orderId" element={<AddMenu />} />
                <Route path="material" element={<Material />} />
                <Route path="items" element={<Items />} />
                {/*
                <Route path="about" element={<About />} />
                <Route path="users" element={<Users />} /> */}
              </Route>
            </Route>

            <Route path="*" element={ <Navigate to="/" replace /> } />
          </Routes>

          <Toaster position="top-right" 
            toastOptions={{ 
              duration: 3000,
              style: { background: "#363636", color: "#fff", },
              success: { duration: 3000, iconTheme: { primary: "#4ade80", secondary: "#fff", }, },
            error: {
              duration: 4000,
              iconTheme: { primary: "#ef4444", secondary: "#fff", },
            },}}
          />

        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;