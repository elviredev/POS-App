import { Category, Product } from '@/types';
import { useForm } from '@inertiajs/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { toast } from 'sonner';

interface Props {
  categories: Category[];
  product?: Product | null;
  onClose: () => void;
}

export default function ProductForm({ categories, product, onClose }: Props) {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: product?.name ?? '',
    category_id: product?.category_id?.toString() ?? '',
    description: product?.description ?? '',
    price: product?.price ?? '',
    stock: product?.stock?.toString() ?? '0',
    is_active: product?.is_active ?? true,
    image: null as File | null,
  });

  function handleSubmit(e: any) {
    e.preventDefault();
    const options = {
      forceFormData: true, // Force l'envoi des donéées du form en multipart au lieu de json
      onSuccess: () => {
        toast.success(
          product
            ? 'Produit mis à jour avec succès'
            : 'Produit créé avec succès',
        );
        reset(); // réinitialise les champs du form
        onClose(); // ferme la modale de dialogue
      },
    };
    product ? put(`/products/${product.id}`, options) : post('/products', options);
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? 'Editer' : 'Créer'} un produit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
            />
            <InputError message={errors.name} />
          </div>

          <div>
            <Label>Catégorie</Label>
            <Select
              value={data.category_id}
              onValueChange={(value) => setData('category_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <InputError message={errors.category_id} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Prix (€)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                value={data.price}
                onChange={(e) => setData('price', e.target.value)}
              />
              <InputError message={errors.price} />
            </div>

            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={data.stock}
                onChange={(e) => setData('stock', e.target.value)}
              />
              <InputError message={errors.stock} />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
              />
              <InputError message={errors.description} />
            </div>

            <div>
              <Label htmlFor="image">Image (Optionnel)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setData('image', e.target.files?.[0] || null)}
              />
              <InputError message={errors.image} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={data.is_active}
              onChange={(e) => setData('is_active', e.target.checked)}
            />
            <Label htmlFor="is_active">Actif (visible sur le Point of Sale-POS)</Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? 'Enregistrement...' : product ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
