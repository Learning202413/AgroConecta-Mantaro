import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import LotsList from './pages/LotsList';
import CreateHarvestLot from './pages/CreateHarvestLot';
import RouteOptimizerMap from './pages/RouteOptimizerMap';
import PriceDashboard from './pages/PriceDashboard';

function ProtectedRoutes() {
  const { user } = useAuth();

  // If not logged in, redirect to login page (Norman / ISO 9241-11 Goal Fulfillment)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/routes" replace />} />
        <Route path="routes" element={<RouteOptimizerMap />} />
        <Route path="lots" element={<LotsList />} />
        <Route path="create-lot" element={<CreateHarvestLot />} />
        <Route path="prices" element={<PriceDashboard />} />
        <Route path="*" element={<Navigate to="/routes" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
