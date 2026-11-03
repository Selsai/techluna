import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useLocation } from 'react-router-dom';

export default function MyOrders() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/orders/mine').then(({ data }) => setOrders(data)).catch(() => setError('Impossible de charger vos commandes.')); }, []);
  return <div className="interior-page"><p className="eyebrow">VOTRE ESPACE</p><h1>Mes commandes</h1>{location.state?.notice && <p className="auth-success" role="status">{location.state.notice}</p>}{error && <p className="auth-error" role="alert">{error}</p>}{orders.length === 0 && !error && <div className="interior-empty">Vous n'avez pas encore de commande.</div>}{orders.map((order) => <article key={order._id} className="bg-white rounded shadow p-5 mb-4"><div className="flex justify-between"><strong>Commande {order._id.slice(-8)}</strong><span>{order.status}</span></div><p className="mt-2">{new Date(order.createdAt).toLocaleDateString('fr-FR')} · {Number(order.total).toFixed(2)} €</p><p>{order.items.reduce((count, item) => count + item.quantity, 0)} article(s)</p></article>)}</div>;
}
