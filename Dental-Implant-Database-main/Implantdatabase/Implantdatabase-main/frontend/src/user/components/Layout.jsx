import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import styles from '../UserApp.module.css';

/**
 * Layout component - Wrapper for all user pages
 * Includes Navbar, main content area, and Footer
 */
export default function Layout() {
  return (
    <div className={styles.appWrapper}>
      <Navbar />
      
      <main className={styles.contentArea}>
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
}
