<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Throwable;

/**
 * Le controller pour la caisse a une seule tâche : récupérer le panier depuis le frontend React,
 * le valider, enregistrer la vente en BDD, réduire les stocks et rediriger vers le ticket de caisse.
 */
class CheckoutController extends Controller
{
  /**
   * @throws Throwable
   */
  public function store(Request $request): RedirectResponse
  {
    $validated = $request->validate([
      'items' => ['required', 'array', 'min:1'],
      'items.*.product_id' => ['required', 'exists:products,id'],
      'items.*.quantity' => ['required', 'integer', 'min:1'],
      'cash_tendered' => ['required', 'numeric', 'min:0.01'],
    ]);

    $saleId = DB::transaction(function () use ($validated, $request) {
      $total = 0;
      $saleItems = [];

      // on itère sur chaque article soumis par le caissier et pour chacun on récupère le produit depuis la BDD
      foreach ($validated['items'] as $item) {
        // vérouille la bdd sur la ligne du produit pendant qu'on vérifie le stock et qu'on le décrémente pour éviter les problèmes de concurrence
        // si 2 caissiers tentent de vendre la dernière unité d'un produit en même temps, le second attend que le premier ait fini de traiter la transaction avant de vérifier le stock et de le décrémenter.
        $product = Product::lockForUpdate()->findOrFail($item['product_id']);

        if ($product->stock < $item['quantity']) {
          throw ValidationException::withMessages([
            'items' => ["Le produit \"$product->name\" n'a pas assez de stock."],
          ]);
        }

        $subtotal = (float)$product->price * $item['quantity'];
        $total += $subtotal;
        // préparation des futures lignes de vente
        $saleItems[] = [
          'product_id' => $product->id,
          'product_name' => $product->name,
          'unit_price' => $product->price,
          'quantity' => $item['quantity'],
          'subtotal' => round($subtotal, 2),
        ];

        $product->decrement('stock', $item['quantity']);
      }

      $cash = (float)$validated['cash_tendered'];

      if ($cash < $total) {
        throw ValidationException::withMessages([
          'cash_tendered' => ["Le montant en espèces est inférieur au total."],
        ]);
      }

      // créer l'enregistrement de la vente
      $sale = Sale::create([
        'user_id' => $request->user()->id,
        'total' => round($total, 2),
        'cash_tendered' => $cash,
        'change_amount' => round($cash - $total, 2),
      ]);

      // Lignes de vente : si $saleItems contient 5 produits, Laravel créé 5 lignes dans la table "sale_items" en une seule fois
      $sale->items()->createMany($saleItems);

      return $sale->id;
    });

    // exemple : /receipt/154
    return redirect()->route('receipt', $saleId);
  }

  public function receipt(Sale $sale)
  {
    $sale->load('items');

    return Inertia::render('pos/receipt', [
      'sale' => $sale,
    ]);
  }
}
