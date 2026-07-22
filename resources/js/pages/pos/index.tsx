import { useState } from 'react';
import { CartItem, Product } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { LayoutGridIcon, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ProductGrid from '@/pages/pos/product-grid';
import CartPanel from '@/pages/pos/cart-panel';
import { useCart } from '@/pages/pos/use-cart';
import CheckoutDialog from '@/pages/pos/checkout-dialog';

interface Props {
  products: Product[];
}

export default function PosIndex({ products }: Props) {
  const [search, setSearch] = useState('');
  const { items, subtotal, addItem, removeItem, setQuantity, clearCart } =
    useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  // filtre de recherche: on prend toute la liste des produits et on ne conserve que ceux dont le nom ou la catégorie a été saisi.
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <Head title="Encaissement" />
      <div className="flex h-screen flex-col bg-background">
        {/*Top Bar*/}
        <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <LayoutGridIcon className="h-5 w-5" />
            </Link>

            <span className="font-semibold">Caisse</span>
          </div>

          {/*Recherche*/}
          <div className="relative w-full sm:ml-4 sm:max-w-sm sm:flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="border-primary/30 pl-9 focus-visible:ring-primary"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/*Main Area*/}
        <div className="flex flex-1 overflow-hidden">
          <ProductGrid products={filtered} onAdd={addItem} />
          <CartPanel
            items={items}
            subtotal={subtotal}
            onRemove={removeItem}
            onSetQuantity={setQuantity}
            onClear={clearCart}
            onCheckout={() => setShowCheckout(true)}
          />
        </div>
      </div>

      <CheckoutDialog
        open={showCheckout}
        items={items}
        subtotal={subtotal}
        onSuccess={clearCart}
        onClose={() => setShowCheckout(false)}
      />
    </>
  );
}
