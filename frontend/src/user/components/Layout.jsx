import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Layout component - Wrapper for all user pages
 * Includes Navbar, main content area, and Footer
 */
export default function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      <main style={{ flex: 1, paddingTop: '74px' }}>
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
}
