import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import ManageImplants from "./pages/ManageImplants";
import NewImplant from "./pages/NewImplant";
import ManageBlog from "./pages/ManageBlog";
import BlogForm from "./pages/BlogForm";
import MasterDataHome from "./pages/MasterDataHome";
import MasterDataList from "./pages/MasterDataList";
import MasterDataForm from "./pages/MasterDataForm";
import DistributorsByCountry from "./pages/DistributorsByCountry";
import DistributorForm from "./pages/DistributorForm";
import ContactFeedback from "./pages/ContactFeedback";

import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import "./Admin.css";

export default function AdminApp() {
  return (
    <Routes>
      {/* login */}
      <Route path="/login" element={<Login />} />

      {/* protected admin routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        <Route path="implants" element={<ManageImplants />} />
        <Route path="implants/new" element={<NewImplant />} />
        <Route path="implants/edit/:id" element={<NewImplant />} />

        <Route path="blog" element={<ManageBlog />} />
        <Route path="blog/new" element={<BlogForm mode="create" />} />
        <Route path="blog/edit/:id" element={<BlogForm mode="edit" />} />

        <Route path="feedback" element={<ContactFeedback />} />

        <Route path="master" element={<MasterDataHome />} />
        <Route path="master/:type" element={<MasterDataList />} />
        <Route path="master/:type/new" element={<MasterDataForm mode="create" />} />
        <Route path="master/:type/edit/:id" element={<MasterDataForm mode="edit" />} />

        <Route
          path="master/officialDistributor/:countryId"
          element={<DistributorsByCountry />}
        />
        <Route
          path="master/officialDistributor/:countryId/new"
          element={<DistributorForm mode="create" />}
        />
        <Route
          path="master/officialDistributor/:countryId/edit/:id"
          element={<DistributorForm mode="edit" />}
        />

        <Route path="profile" element={<Profile />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}