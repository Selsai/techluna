// src/App.js
import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductList from './pages/ProductList';
import Cart from './pages/Cart';
import Order from './pages/Order';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ShippingPayment from './pages/ShippingPayment';
import MyOrders from './pages/MyOrders';
import './pages/Interior.css';

// Mise en page partagée : navigation, contenu de la route et signature de la boutique.
const MainLayout = () => (
  <>
    <Navbar />
    <main className="p-4">
      <Outlet />
    </main>
    <footer className="site-footer"><img src="/images/logo-techluna.png" alt="Logo TechLuna" /><strong>TechLuna</strong><p>Réalisé par Selsabil Amairi - développeuse web - examen TP noté</p></footer>
  </>
);

// Définition des routes avec le MainLayout
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '',
        element: <ProductList featuredOnly />,
      },
      { path: 'boutique', element: <ProductList /> },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'livraison-paiement',
        element: <ShippingPayment />,
      },
      {
        path: 'cart',
        element: <Cart />,
      },
      {
        path: 'order',
        element: <ProtectedRoute><Order /></ProtectedRoute>,
      },
      { path: 'mes-commandes', element: <ProtectedRoute><MyOrders /></ProtectedRoute> },
      {
        path: 'admin',
        element: <AdminRoute><Admin /></AdminRoute>,
      },
    ],
  },
]);

const App = () => <RouterProvider router={router} />;

export default App;
