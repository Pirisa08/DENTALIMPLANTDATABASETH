import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ImplantDatabase from "./pages/ImplantDatabase";
import ImplantDetail from "./pages/ImplantDetail";
import BrandDetail from "./pages/BrandDetail";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        
        {/* Implants Routes */}
        <Route path="implants" element={<ImplantDatabase />} />
        <Route path="implants/brand/:brand" element={<BrandDetail />} />
        <Route path="implants/:slug" element={<ImplantDetail />} />
        
        {/* Blog Routes */}
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogDetail />} />
        
        {/* Other Routes */}
        <Route path="contact" element={<Contact />} />
      </Route>
    </Routes>
  );
}