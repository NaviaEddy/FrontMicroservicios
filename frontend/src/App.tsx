import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { PurchaseProvider } from './context/PurchaseContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Purchase from './pages/Purchase';
import AdminDashboard from './pages/AdminDashboard';
import Notifications from './pages/Notifications';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import NotFound from './pages/NotFound';
export function App() {
  return <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <EventProvider>
            <PurchaseProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:id" element={<EventDetails />} />
                  <Route path="/notifications" element={<ProtectedRoute>
                        <Notifications />
                      </ProtectedRoute>} />
                  <Route path="/purchase/:id" element={<ProtectedRoute>
                        <Purchase />
                      </ProtectedRoute>} />
                  <Route path="/admin" element={<AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>} />
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" />} />
                </Routes>
              </Layout>
            </PurchaseProvider>
          </EventProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>;
}