import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Component หลัก
import UserApp from './user/UserApp';
import AdminApp from './admin/AdminApp';

function App() {
  return (
    <Routes>
      {/* Admin Path */}
      <Route path="/admin/*" element={<AdminApp />} />

      {/* User Path */}
      <Route path="/*" element={<UserApp />} />
    </Routes>
  );
}

export default App;