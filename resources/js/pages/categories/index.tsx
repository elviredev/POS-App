import { Category } from '@/types';
import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import ProductIndex from '@/pages/products';
import { Button } from '@/components/ui/button';
import { PencilIcon, Plus, TrashIcon } from 'lucide-react';
import {
  toast
} from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Label
} from '@/components/ui/label';
import {
  Input
} from '@/components/ui/input';
import InputError
  from '@/components/input-error';

type CategoryWithCount = Category & { products_count: number };

interface Props {
  categories: CategoryWithCount[];
}

export default function CategoryIndex({ categories }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: '',
    description: '',
  });

  function openCreate() {
    reset();
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(category: Category) {
    setData({ name: category.name, description: category.description ?? '' });
    setEditing(category);
    setShowForm(true);
  }

  function closeForm() {
    reset();
    setShowForm(false);
    setEditing(null);
  }

  function handleSubmit(e: any) {
    e.preventDefault()
    if (editing) {
      put(`/categories/${editing.id}`, {
        onSuccess: () => { toast.success('Categorie modifiée'); closeForm() }
      })
    } else {
      post('/categories', {
        onSuccess: () => { toast.success('Categorie créée'); closeForm() }
      })
    }
  }

  function handleDelete(category: CategoryWithCount) {
    if(category.products_count > 0) {
      toast.error(`Vous ne pouvez pas supprimer la catégorie "${category.name}" - car elle contient ${category.products_count} produits. Réaffecter ces produits dans une autre catégorie en amont.`)
      return;
    }
    if (!confirm(`Supprimer la catégorie "${category.name}"?`)) return;
    router.delete(`/categories/${category.id}`, {
      onSuccess: () => toast.success("Catégorie supprimée.")
    })
  }

  return (
    <>
      <Head title="Categories" />

      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Catégories</h1>
          <Button onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" />
            Ajouter une catégorie
          </Button>
        </div>

        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">Nom</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">Produits</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Pas encore de catégories. Ajoutez-en une pour commencer.
                  </td>
                </tr>
              )}
              {categories.map((category) => (
                <tr key={category.id} className="border-b last:border-0 hover:bg-muted/25">
                  <td className="px-4 py-3 font-medium">{category.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {category.description ?? 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {category.products_count}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(category)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(category)}>
                      <TrashIcon className="h-4 w-4 textdestructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/*dialog*/}
      <Dialog open={showForm} onOpenChange={closeForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier la catégorie" : "Créer une catégorie"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="cat-name">Nom</Label>
              <Input id="cat-name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
              <InputError message={errors.name} />
            </div>

            <div>
              <Label htmlFor="cat-desc">Description (optionnel)</Label>
              <Input id="cat-desc" value={data.description} onChange={(e) => setData('description', e.target.value)} />
              <InputError message={errors.description} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeForm}>
                Annuler
              </Button>
              <Button type="submit">
                {processing ? "Enregistrement..." : editing ? "Modifier" : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

CategoryIndex.layout = {
  breadcrumbs: [{ title: 'Catégories', href: '/categories' }],
};
