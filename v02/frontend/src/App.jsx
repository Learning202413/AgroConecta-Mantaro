import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import PredictEvening from './pages/PredictEvening';
import PredictionHistory from './pages/PredictionHistory';
import StationDataExplorer from './pages/StationDataExplorer';
import ModelTransparency from './pages/ModelTransparency';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<PredictEvening />} />
          <Route path="history" element={<PredictionHistory />} />
          <Route path="explorer" element={<StationDataExplorer />} />
          <Route path="model" element={<ModelTransparency />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
