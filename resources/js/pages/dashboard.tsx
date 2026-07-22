import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Sale } from '@/types';

interface Stats {
  today_revenue: string;
  today_transactions: number;
  total_products: number;
  low_stock_count: number;
}

interface TopProduct {
  product_name: string;
  total_quantity: number;
  total_revenue: string;
}

interface Props {
  stats: Stats;
  top_products: TopProduct[];
  recent_sales: Sale[];
}

export default function Dashboard({ stats, top_products, recent_sales }: Props) {
  return (
    <>
      <Head title="Tableau de Bord" />
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Tableau de Bord</h1>
        {/*stats row*/}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard title="Revenu du jour" value={`${stats.today_revenue}€`} />
          <StatCard
            title="Transaction(s) du jour"
            value={stats.today_transactions.toString()}
          />
          <StatCard
            title="Produits Actifs"
            value={stats.total_products.toString()}
          />
          <StatCard
            title="Stock ≤ 5"
            value={stats.low_stock_count.toString()}
            highlight={stats.low_stock_count > 0}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/*top products*/}
          <div className="rounded-lg border">
            <div className="border-b px-4 py-3">
              <h2 className="font-semibold">Produits les plus vendus</h2>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Produit</th>
                  <th className="px-4 py-2 text-right">Quantité</th>
                  <th className="px-4 py-2 text-right">Revenu</th>
                </tr>
              </thead>
              <tbody>
                {top_products.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                      Aucun produit vendu récemment.
                    </td>
                  </tr>
                ) : (
                  top_products.map((product) => (
                    <tr key={product.product_name} className="border-t">
                      <td className="px-4 py-2">{product.product_name}</td>
                      <td className="px-4 py-2 text-right">{product.total_quantity}</td>
                      <td className="px-4 py-2 text-right">{product.total_revenue}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/*recent sales*/}
          <div className="rounded-lg border">
            <div className="border-b px-4 py-3">
              <h2 className="font-semibold">Ventes récentes</h2>
            </div>

            <div className="divide-y">
              {recent_sales.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">Aucune vente récente.</p>
              ) : (
                recent_sales.map(sale => (
                  <div key={sale.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">Vente #{sale.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {sale.items.map(i => `${i.product_name} × ${i.quantity}`).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{sale.total}€</p>
                      <p className="text-xs text-muted-foregroud">
                        {new Date(sale.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

Dashboard.layout = {
  breadcrumbs: [
    {
      title: 'Tableau de Bord',
      href: dashboard(),
    },
  ],
};

function StatCard({ title, value, highlight = false }: { title: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/20' : 'bg-card'}`}>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${highlight ? 'text-orange-600': ''}`}>{value}</p>
    </div>
  );
}