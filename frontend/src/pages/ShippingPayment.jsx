import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ShippingMethodSelection from '../components/ShippingMethodSelection';
import PaymentMethodSelection from '../components/handlePaymentChange';
import ShippingAddress from '../components/ShippingAddress';


const ShippingPayment = () => {
  const navigate = useNavigate();
  const { cart, shippingAddress, shippingMethod, paymentMethod } = useCart();
  const [error, setError] = useState('');
  // Naviguer vers la page de commande
  const handleSubmitOrder = () => {
    const missing = [];
    if (!cart.length) missing.push('un produit dans le panier');
    if (['street', 'city', 'postalCode', 'country'].some((key) => !shippingAddress[key]?.trim())) missing.push('une adresse complète');
    if (!shippingMethod) missing.push('une livraison');
    if (!paymentMethod) missing.push('un mode de paiement');
    if (missing.length) { setError(`Veuillez renseigner ${missing.join(', ')}.`); return; }
    navigate('/order');
  };

  return (
    <div className="interior-page container mx-auto">
      <p className="eyebrow">VOTRE COMMANDE</p><h1>Livraison et paiement</h1><p><span className="required-mark">*</span> Champs obligatoires.</p>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <ShippingAddress /> 
        </div>
        <div>
          <ShippingMethodSelection />
          <PaymentMethodSelection />
        </div>
      </div>
      <hr className="my-4" />
      <div>
      <button
              onClick={handleSubmitOrder}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Passer une commande
      </button>
      </div>
    </div>
  );
};

export default ShippingPayment;
