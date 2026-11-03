import { cartReducer } from './context/CartContext';
import { test, expect } from 'vitest';

test('ajout, incrément et retrait du panier', () => {
  const initial = { cart: [] };
  const product = { id: 'produit-1', name: 'Casque', price: 150 };
  const added = cartReducer(initial, { type: 'ADD_TO_CART', payload: product });
  const doubled = cartReducer(added, { type: 'ADD_TO_CART', payload: product });
  expect(doubled.cart[0].quantity).toBe(2);
  expect(cartReducer(doubled, { type: 'REMOVE_FROM_CART', payload: product }).cart).toHaveLength(0);
});
