"use client"

import { useState } from "react"
import { Check, Edit, MoreHorizontal, Plus, Search, Tag, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { slugify } from "@/lib/utils"
import { useData } from "@/lib/data-context"

export function CategoriesPage() {
  const {
    revenueCategories,
    spentCategories,
    revenues,
    spents,
    addRevenueCategory,
    updateRevenueCategory,
    deleteRevenueCategory,
    addSpentCategory,
    updateSpentCategory,
    deleteSpentCategory,
  } = useData()

  const [activeTab, setActiveTab] = useState("revenue")
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null)

  // Calcular contagem de uso para cada categoria
  const revenueCategoriesWithCount = revenueCategories.map((category) => {
    const count = revenues.filter((revenue) => revenue.categories.includes(category.id)).length
    return { ...category, count }
  })

  const spentCategoriesWithCount = spentCategories.map((category) => {
    const count = spents.filter((spent) => spent.categories.includes(category.id)).length
    return { ...category, count }
  })

  const filteredRevenueCategories = revenueCategoriesWithCount.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredExpenseCategories = spentCategoriesWithCount.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  async function handleAddCategory ()  {
    if (activeTab === "revenue") {

      const res = await fetch("/api/revenues/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      })

      if(!res.ok) {
        throw new Error("Falha ao adicionar categoria de receitas")
      }

    } else {

      const res = await fetch("/api/spents/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      })

      if(!res.ok) {
        throw new Error("Falha ao adicionar categoria de despesas")
      }
    }
  }

  const handleEditCategory = () => {
    if (!editingCategory) return

    if (activeTab === "revenue") {
      updateRevenueCategory(editingCategory.id, newCategoryName)
    } else {
      updateSpentCategory(editingCategory.id, newCategoryName)
    }

    setNewCategoryName("")
    setEditingCategory(null)
  }

  const handleDeleteCategory = (id: string) => {
    if (activeTab === "revenue") {
      deleteRevenueCategory(id)
    } else {
      deleteSpentCategory(id)
    }
  }

  const startEditCategory = (category: { id: string; name: string }) => {
    setEditingCategory(category)
    setNewCategoryName(category.name)
  }

  const cancelEdit = () => {
    setEditingCategory(null)
    setNewCategoryName("")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
        <p className="text-muted-foreground">Gerencie as categorias para organizar suas receitas e despesas</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar categorias..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Categoria</DialogTitle>
              <DialogDescription>
                Crie uma nova categoria para {activeTab === "revenue" ? "receitas" : "despesas"}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Categoria</Label>
                <Input
                  id="name"
                  placeholder="Digite o nome da categoria"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              {newCategoryName && (
                <div className="grid gap-2">
                  <Label>Slug</Label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                    {slugify(newCategoryName)}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="revenue" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="revenue">Categorias de Receitas</TabsTrigger>
          <TabsTrigger value="expense">Categorias de Despesas</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Categorias de Receitas</CardTitle>
              <CardDescription>Gerencie as categorias utilizadas para classificar suas receitas.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Transações</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRevenueCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {editingCategory?.id === category.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              className="h-8"
                            />
                            <Button size="icon" variant="ghost" onClick={handleEditCategory} className="h-8 w-8">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-8 w-8">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-primary" />
                            {category.name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{category.slug}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{category.count}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {editingCategory?.id !== category.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => startEditCategory(category)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteCategory(category.id)}
                                disabled={category.count > 0}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expense" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Categorias de Despesas</CardTitle>
              <CardDescription>Gerencie as categorias utilizadas para classificar suas despesas.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Transações</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenseCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {editingCategory?.id === category.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              className="h-8"
                            />
                            <Button size="icon" variant="ghost" onClick={handleEditCategory} className="h-8 w-8">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-8 w-8">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-destructive" />
                            {category.name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{category.slug}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{category.count}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {editingCategory?.id !== category.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => startEditCategory(category)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteCategory(category.id)}
                                disabled={category.count > 0}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

