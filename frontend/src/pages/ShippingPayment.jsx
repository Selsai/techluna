import React from 'react';
import { useNavigate } from 'react-router-dom';
import ShippingMethodSelection from '../components/ShippingMethodSelection';
import PaymentMethodSelection from '../components/handlePaymentChange';
import ShippingAddress from '../components/ShippingAddress';


const ShippingPayment = () => {
  const navigate = useNavigate();
  // Naviguer vers la page de commande
  const handleSubmitOrder = () => {
    navigate('/order');
  };

  return (
    <div className="interior-page container mx-auto">
      <p className="eyebrow">VOTRE COMMANDE</p><h1>Livraison et paiement</h1>
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
