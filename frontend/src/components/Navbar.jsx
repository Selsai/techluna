// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="site-header"><div className="header-announcement">Votre univers tech, imaginé avec style <span>✦</span> TechLuna</div><nav className="site-nav" aria-label="Navigation principale"><Link to="/" className="site-brand"><img className="brand-logo" src="/images/logo-techluna.png" alt="" /><span><strong>TechLuna</strong><small>TECH & LIFESTYLE</small></span></Link><div className="nav-center"><Link to="/">La boutique</Link>{user && <Link to="/mes-commandes">Mes commandes</Link>}{user?.role === 'admin' && <Link to="/admin">Administration</Link>}</div><div className="nav-actions">{user ? <><span className="nav-greeting">Bonjour, {user.username}</span><button type="button" onClick={handleLogout} className="nav-text-button">Déconnexion</button></> : <><Link to="/login">Connexion</Link><Link to="/register" className="nav-signup">Créer un compte</Link></>}<Link to="/cart" className="nav-cart" aria-label={`Panier, ${cart.reduce((count, item) => count + item.quantity, 0)} articles`}>Panier <span>{cart.reduce((count, item) => count + item.quantity, 0)}</span></Link></div></nav></header>
  );
};

export default Navbar;
