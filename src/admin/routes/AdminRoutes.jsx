import React from 'react';
import { Route } from 'react-router-dom';
import AutodeskManager from '../components/AutodeskManager';

const AdminRoutes = () => {
  return (
    <Route path="/autodesk" element={<AutodeskManager />} />
  );
};

export default AdminRoutes; 