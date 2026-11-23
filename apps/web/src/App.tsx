import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LocationProvider } from './context/LocationContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { HomePage } from './pages/customer/HomePage';
import { CategoryDetailPage } from './pages/customer/CategoryDetailPage';
import { RequestServicePage } from './pages/customer/RequestServicePage';
import { QuotationComparePage } from './pages/customer/QuotationComparePage';
import { BookingTrackingPage } from './pages/customer/BookingTrackingPage';
import { CustomerDashboardPage } from './pages/customer/CustomerDashboardPage';
import { CustomerAddressesPage } from './pages/customer/CustomerAddressesPage';
import { CustomerPaymentsPage } from './pages/customer/CustomerPaymentsPage';
import { CustomerHelpPage } from './pages/customer/CustomerHelpPage';
import { CustomerProfilePage } from './pages/customer/CustomerProfilePage';
import { ProviderDashboardPage } from './pages/provider/ProviderDashboardPage';
import { ProviderVerificationPage } from './pages/provider/ProviderVerificationPage';
import { ProviderServicesPage } from './pages/provider/ProviderServicesPage';
import { ProviderEarningsPage } from './pages/provider/ProviderEarningsPage';
import { ProviderRewardsPage } from './pages/provider/ProviderRewardsPage';
import { ProviderProfilePage } from './pages/provider/ProviderProfilePage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminVerificationsPage } from './pages/admin/AdminVerificationsPage';
import { AdminDisputesPage } from './pages/admin/AdminDisputesPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminSettlementsPage } from './pages/admin/AdminSettlementsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LocationProvider>
            <BrowserRouter>
              <div className="flex flex-col min-h-screen bg-[#fafbfc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
                <Navbar />
                <main className="flex-1 pb-20 md:pb-0">
                  <Routes>
                    {/* Customer Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/services/:slug" element={<CategoryDetailPage />} />
                    <Route path="/services/:slug/request" element={<RequestServicePage />} />
                    <Route path="/customer" element={<CustomerDashboardPage />} />
                    <Route path="/customer/addresses" element={<CustomerAddressesPage />} />
                    <Route path="/customer/payments" element={<CustomerPaymentsPage />} />
                    <Route path="/customer/help" element={<CustomerHelpPage />} />
                    <Route path="/customer/profile" element={<CustomerProfilePage />} />
                    <Route path="/customer/requests/:requestId" element={<QuotationComparePage />} />
                    <Route path="/bookings/:bookingId" element={<BookingTrackingPage />} />

                    {/* Provider Routes */}
                    <Route path="/provider" element={<ProviderDashboardPage />} />
                    <Route path="/provider/verification" element={<ProviderVerificationPage />} />
                    <Route path="/provider/services" element={<ProviderServicesPage />} />
                    <Route path="/provider/earnings" element={<ProviderEarningsPage />} />
                    <Route path="/provider/rewards" element={<ProviderRewardsPage />} />
                    <Route path="/provider/profile" element={<ProviderProfilePage />} />

                    {/* Admin Operations Routes */}
                    <Route path="/admin" element={<AdminDashboardPage />} />
                    <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                    <Route path="/admin/verifications" element={<AdminVerificationsPage />} />
                    <Route path="/admin/disputes" element={<AdminDisputesPage />} />
                    <Route path="/admin/users" element={<AdminUsersPage />} />
                    <Route path="/admin/settlements" element={<AdminSettlementsPage />} />

                    {/* Authentication */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <Footer />
                <MobileBottomNav />
              </div>
            </BrowserRouter>
          </LocationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
