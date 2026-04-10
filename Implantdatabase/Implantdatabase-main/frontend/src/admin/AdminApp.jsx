import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import ManageImplants from "./pages/ManageImplants"; // ✅ เพิ่ม
import NewImplant from "./pages/NewImplant"; // ✅ เพิ่ม
import ManageBlog from "./pages/ManageBlog";
import BlogForm from "./pages/BlogForm";
import MasterDataHome from "./pages/MasterDataHome";
import MasterDataList from "./pages/MasterDataList";
import MasterDataForm from "./pages/MasterDataForm";
import DistributorsByCountry from "./pages/DistributorsByCountry";
import DistributorForm from "./pages/DistributorForm";
import ContactFeedback from "./pages/ContactFeedback";
import AdminLayout from "./components/AdminLayout";
import "./Admin.css";

const isAuthed = () => !!localStorage.getItem("admin_token");

function ProtectedRoute({ children }) {
  if (!isAuthed()) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="implants" element={<ManageImplants />} /> {/* ✅ เพิ่ม */}
        <Route path="implants/new" element={<NewImplant />} /> {/* ✅ เพิ่ม */}
        <Route path="implants/edit/:id" element={<NewImplant />} /> {/* ✅ edit mode */}
        <Route path="blog" element={<ManageBlog />} /> {/* ✅ blog management */}
        <Route path="blog/new" element={<BlogForm mode="create" />} />
        <Route path="blog/edit/:id" element={<BlogForm mode="edit" />} />
        <Route path="feedback" element={<ContactFeedback />} />
        <Route path="master" element={<MasterDataHome />} />
        <Route path="master/:type" element={<MasterDataList />} />
        <Route path="master/:type/new" element={<MasterDataForm mode="create" />} />
        <Route path="master/:type/edit/:id" element={<MasterDataForm mode="edit" />} />
        <Route path="master/officialDistributor/:countryId" element={<DistributorsByCountry />} />
        <Route path="master/officialDistributor/:countryId/new" element={<DistributorForm mode="create" />} />
        <Route path="master/officialDistributor/:countryId/edit/:id" element={<DistributorForm mode="edit" />} />
        <Route path="profile" element={<Profile />} />

      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/admin" replace />} />

    </Routes>
  );
}
