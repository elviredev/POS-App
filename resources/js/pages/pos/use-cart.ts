/**
 * Hook de gestion du panier
 * Ajout, suppression, modification de quantité, vidage
 * Calcul du sous-total
 **/

import { useReducer, useMemo } from 'react';
import { CartItem, Product } from '@/types';

/** Description de toutes les actions possibles */
type CartAction =
  | { type: 'ADD'; product: Product }
  | { type: 'REMOVE'; productId: number }
  | { type: 'SET_QTY'; productId: number; quantity: number }
  | { type: 'CLEAR' };

/**
 * Le reducer reçoit tjs l'état actuel et l'action à effectuer puis retourne un nouvel état du panier.
 *
 */
function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find((i) => i.product.id === action.product.id);
      // produit déja présent dans le panier
      if (existing) {
        return state.map((i) =>
          i.product.id === action.product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      // ajout d'un nouveau produit
      return [...state, { product: action.product, quantity: 1 }];
    }
    case 'REMOVE': // retourne un nouveau tableau contenant tous les produits sauf celui à supprimer
      return state.filter((i) => i.product.id !== action.productId);
    case 'SET_QTY':
      if (action.quantity <= 0) {
        // retourne un nouveau tableau contenant tous les produits sauf celui dont le stock est <= 0
        return state.filter((i) => i.product.id !== action.productId);
      }
      // mise à jour uniquement de la quantité du produit correspondant
      return state.map((i) =>
        i.product.id === action.productId
          ? { ...i, quantity: action.quantity }
          : i,
      );
    case 'CLEAR':
      // effacement du panier
      return [];
    default:
      return state;
  }
}

export function useCart() {
  const [items, dispatch] = useReducer(cartReducer, []);

  // Calcule le sous-total et met le résultat en cache. Ne se recalcule que lorsque le tableau d'items (les pdts du panier) change
  // Aver useMemo React dit "Je garde le dernier résultat en mémoire. Tant que items ne change pas, je réutilise ce résultat."
  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, i) => sum + parseFloat(i.product.price) * i.quantity,
        0,
      ),
    [items],
  );

  return {
    items,
    subtotal,
    addItem: (product: Product) => dispatch({ type: 'ADD', product }),
    removeItem: (productId: number) => dispatch({ type: 'REMOVE', productId }),
    setQuantity: (productId: number, quantity: number) => dispatch({ type: 'SET_QTY', productId, quantity }),
    clearCart: () => dispatch({ type: 'CLEAR' }),
  };
}
