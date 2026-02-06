import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner"
import { Layout } from "@/components/Layout";
import UnitSelection from "@/pages/UnitSelection";
import MyAppointments from "@/pages/MyAppointments";
import ServiceSelection from "@/pages/ServiceSelection";
import BookingTimeSelection from "@/pages/BookingTimeSelection";
import ConfirmationPage from "@/pages/ConfirmationPage";

import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ServicesManager from "@/pages/admin/ServicesManager";
import AgendaView from "@/pages/admin/AgendaView";
import Settings from "@/pages/admin/Settings";
import UnitsManager from "@/pages/admin/UnitsManager";

import { ThemeProvider } from "@/components/theme-provider";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<UnitSelection />} />
              <Route path="/my-appointments" element={<MyAppointments />} />
              {/* Public Booking */}
              <Route path="/book/:unitSlug" element={<ServiceSelection />} />
              <Route path="/book/:unitSlug/time" element={<BookingTimeSelection />} />
              <Route path="/book/:unitSlug/confirm" element={<ConfirmationPage />} />

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/services" element={<ServicesManager />} />
              <Route path="/admin/units" element={<UnitsManager />} />
              <Route path="/admin/agenda" element={<AgendaView />} />
              <Route path="/admin/settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
