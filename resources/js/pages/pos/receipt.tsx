import { Head, Link } from '@inertiajs/react';
import type { Sale } from '@/types';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';

interface Props {
  sale: Sale;
}

export default function Receipt({ sale }: Props) {
  return (
    <>
      <Head title={`Reçu #${sale.id}`} />

      {/*screen-only controls*/}
      <div className="no-print flex gap-2 border-b p-4">
        <Link href="/pos">
          <Button variant="outline">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour à la caisse
          </Button>
        </Link>
        <Button onClick={() => window.print()}>
          <Printer className="mr-1 h-4 w-4" />
          Imprimer le reçu
        </Button>
      </div>

      {/*Receipt body*/}
      <div className="receipt-paper mx-auto max-w-xs p-6 font-mono text-sm">
        <div className="mb-4 text-center">
          <p className="text-xl font-bold">POS Tuto</p>
          <p className="text-xs text-muted-foreground">Votre marché local</p>
          <p className="m-1 text-xs text-muted-foreground">
            {new Date(sale.created_at).toLocaleString('fr-FR')}
          </p>
          <p className="text-xs text-muted-foreground">Reçu #{sale.id}</p>
        </div>

        <div className="mb-3 space-y-2 border-t border-dashed pt-3">
          {sale.items.map(item => (
            <div key={item.id}>
              <div className="flex justify-between">
                <span className="flex-1 truncate">{item.product_name}</span>
                <span className="ml-2">{item.subtotal}€</span>
              </div>
              <div>
                {item.quantity} × {item.unit_price}€
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-1 border-t border-dashed pt-3">
          <div className="flex justify-between text-base font-bold">
            <span>TOTAL</span>
            <span>{sale.total}€</span>
          </div>

          <div className="flex justify-between">
            <span>Espèces</span>
            <span>{sale.cash_tendered}€</span>
          </div>

          <div className="flex justify-between">
            <span>Reste</span>
            <span>{sale.change_amount}€</span>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Merci pour vos achats!</p>
        </div>
      </div>
    </>
  );
}
