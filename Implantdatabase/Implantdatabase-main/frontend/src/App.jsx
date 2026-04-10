import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Component หลัก
import UserApp from './user/UserApp'; 
import AdminApp from './admin/AdminApp'; 

function App() {
  return (
    <Routes>
      {/* 1. Admin Path: ทุกอย่างที่เริ่มต้นด้วย /admin/ */}
      <Route path="/admin/*" element={<AdminApp />} />

      {/* 2. User Path: ทุกอย่างที่เหลือ */}
      <Route path="/*" element={<UserApp />} />
    </Routes>
  );
}

export default App;