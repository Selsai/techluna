// src/pages/Login.js
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const user = await login(credentials);

      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (error) {
      // Gestion des erreurs
      if (error.response) {
        // Erreur renvoyée par le serveur
        const { message } = error.response.data;
        setErrorMessage(message);
      } else {
        // Erreur réseau ou autre
        setErrorMessage("Impossible de joindre le serveur. Vérifiez que le backend est démarré, puis réessayez.");
      }
    }
  };

  return (
    <div className="auth-page">
      <aside className="auth-visual"><img src="/images/ordinateurs/mac-portable.jpg" alt="Ordinateur portable de la collection" /><div><p className="eyebrow">TECHLUNA</p><h2>Votre espace,<br /><em>votre inspiration.</em></h2><p>Retrouvez vos envies, vos commandes et notre sélection.</p></div></aside>
      <form
        onSubmit={handleSubmit}
        className="auth-card"
      >
        <p className="eyebrow">BON RETOUR</p><h1>Connexion</h1><p className="auth-subtitle">Heureuse de vous retrouver chez TechLuna. <span className="required-mark">*</span> Champs obligatoires.</p>
        {location.state?.notice && <p className="auth-success" role="status">{location.state.notice}</p>}
        {errorMessage && <p className="auth-error" role="alert">{errorMessage}</p>}
        <label htmlFor="login-username">Nom d'utilisateur <span className="required-mark">*</span></label>
        <input
          id="login-username"
          type="text"
          placeholder="Nom d'utilisateur"
          value={credentials.username}
          onChange={(e) =>
            setCredentials({ ...credentials, username: e.target.value })
          }
          className="border border-gray-300 p-2 w-full mb-4"
          required
        />
        <label htmlFor="login-password">Mot de passe <span className="required-mark">*</span></label>
        <input
          id="login-password"
          type="password"
          placeholder="Mot de passe"
          value={credentials.password}
          onChange={(e) =>
            setCredentials({ ...credentials, password: e.target.value })
          }
          className="border border-gray-300 p-2 w-full mb-4"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 w-full rounded"
        >
          Se connecter
        </button>
        <p className="auth-footnote">Vous découvrez la boutique ? <a href="/register">Créer un compte</a></p>
      </form>
    </div>
  );
};

export default Login;
