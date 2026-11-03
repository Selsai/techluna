// src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/auth/register', formData);
      navigate('/login', { state: { notice: 'Compte créé avec succès. Connectez-vous pour continuer.' } });
    } catch (err) {
      //console.error('Erreur lors de l\'inscription', err);
      if (err.response) {
        // Erreur renvoyée par le serveur
        const { message } = err.response.data;
        setError(message);
      } else {
        // Erreur réseau ou autre
        setError("Impossible de joindre le serveur. Vérifiez que le backend est démarré, puis réessayez.");
      }
      //setError('Une erreur est survenue lors de la création du compte.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="auth-page">
      <aside className="auth-visual"><img src="/images/smartphones/iphone-16-pro-max.jpg" alt="Smartphone bordeaux de la collection" /><div><p className="eyebrow">TECHLUNA</p><h2>Les belles idées<br /><em>commencent ici.</em></h2><p>Un compte pour retrouver vos coups de cœur.</p></div></aside>
      <form onSubmit={handleSubmit} className="auth-card">
        <p className="eyebrow">BIENVENUE</p><h1>Créer un compte</h1><p className="auth-subtitle">Rejoignez notre univers tech et créatif. <span className="required-mark">*</span> Champs obligatoires.</p>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <label htmlFor="register-username">Nom d'utilisateur <span className="required-mark">*</span></label>
        <input
          id="register-username"
          type="text"
          name="username"
          placeholder="Nom d'utilisateur"
          value={formData.username}
          onChange={handleChange}
          className="border border-gray-300 p-2 w-full mb-4"
          required
        />
        <label htmlFor="register-email">Adresse email <span className="required-mark">*</span></label>
        <input
          id="register-email"
          type="email"
          name="email"
          placeholder="Adresse email"
          value={formData.email}
          onChange={handleChange}
          className="border border-gray-300 p-2 w-full mb-4"
          required
        />
        <label htmlFor="register-password">Mot de passe <span className="required-mark">*</span></label>
        <input
          id="register-password"
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          className="border border-gray-300 p-2 w-full mb-4"
          required
          minLength={12}
        />
        <p className="password-hint">12 caractères minimum pour protéger votre compte.</p><button type="submit" disabled={submitting} className="bg-blue-500 text-white p-2 w-full rounded">{submitting ? 'Création en cours…' : "S'inscrire"}</button><p className="auth-footnote">Déjà inscrite ? <a href="/login">Se connecter</a></p>
      </form>
    </div>
  );
};

export default Register;
