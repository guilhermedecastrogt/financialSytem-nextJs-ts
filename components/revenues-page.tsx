"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowUpDown,
  ChevronDown,
  Download,
  Filter,
  Plus,
  Search,
  TrendingUp,
  Calendar,
  Loader2,
  AlertCircle,
  FileDown,
  Trash2,
  Edit,
  Eye,
} from "lucide-react"
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DateRange } from "react-day-picker"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useAllRevenues, type Revenue } from "@/hooks/revenues/useAllRevenues"
import { useRevenueCategories } from "@/hooks/revenues/useCategories"
import { useToast } from "@/components/ui/use-toast"

// Interface para o agrupamento de receitas por categoria
interface RevenueCategoryGroup {
  id: string
  name: string
  total: number
  count: number
  items: Revenue[]
}

export function RevenuesPage() {
  const { revenues, isLoading: revenuesLoading, isError: revenuesError } = useAllRevenues()
  const { categories, isLoading: categoriesLoading, isError: categoriesError } = useRevenueCategories()
  const { toast } = useToast()
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedView, setSelectedView] = useState<string>("list")
  const [sorting, setSorting] = useState<{ column: string; direction: "asc" | "desc" }>({
    column: "date",
    direction: "desc",
  })
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  // Filtrar receitas com base nos critérios selecionados
  const filteredRevenues =
      revenues?.filter((revenue) => {
        const matchesSearch = revenue.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory =
            selectedCategory === "all" || revenue.categories.some((cat) => cat.id === selectedCategory)

        const matchesStatus =
            selectedStatus === "all" ||
            (selectedStatus === "paid" && revenue.status === "pago") ||
            (selectedStatus === "pending" && revenue.status === "pendente")

        // Filtrar por data se o intervalo estiver definido
        const matchesDate =
            !date?.from || !date?.to || (new Date(revenue.date) >= date.from && new Date(revenue.date) <= date.to)

        return matchesSearch && matchesCategory && matchesStatus && matchesDate
      }) || []

  // Ordenar receitas
  const sortedRevenues = [...filteredRevenues].sort((a, b) => {
    const { column, direction } = sorting

    if (column === "date") {
      return direction === "asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime()
    }

    if (column === "amount") {
      return direction === "asc" ? a.value - b.value : b.value - a.value
    }

    if (column === "name") {
      return direction === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    }

    return 0
  })

  const handleSort = (column: string) => {
    setSorting((prev) => ({
      column,
      direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  // Calcular totais
  const totalRevenue = filteredRevenues.reduce((sum, revenue) => sum + revenue.value, 0)
  const paidRevenue = filteredRevenues
      .filter((revenue) => revenue.status === "pago")
      .reduce((sum, revenue) => sum + revenue.value, 0)
  const pendingRevenue = filteredRevenues
      .filter((revenue) => revenue.status === "pendente")
      .reduce((sum, revenue) => sum + revenue.value, 0)

  // Agrupar receitas por categoria
  const revenuesByCategory = filteredRevenues.reduce(
      (acc, revenue) => {
        revenue.categories.forEach((cat) => {
          if (!acc[cat.id]) {
            acc[cat.id] = {
              id: cat.id,
              name: cat.name,
              total: 0,
              count: 0,
              items: [],
            }
          }
          acc[cat.id].total += revenue.value
          acc[cat.id].count += 1
          acc[cat.id].items.push(revenue)
        })
        return acc
      },
      {} as Record<string, RevenueCategoryGroup>,
  )

  // Exportar dados para CSV
  const exportToCSV = () => {
    const headers = ["Nome", "Data", "Valor", "Categorias", "Status"]
    const csvData = sortedRevenues.map((revenue) => [
      revenue.name,
      formatDate(revenue.date),
      revenue.value.toString(),
      revenue.categories.map((cat) => cat.name).join(", "),
      revenue.status,
    ])

    const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n")

    // Criar e baixar o arquivo CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `receitas_${formatDate(new Date())}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Exportação concluída",
      description: "Os dados foram exportados com sucesso.",
    })
  }

  // Simular exclusão de item
  const handleDelete = (id: string) => {
    // Aqui você chamaria a API para excluir o item
    toast({
      title: "Item excluído",
      description: "A receita foi excluída com sucesso.",
    })
    setItemToDelete(null)
  }

  // Limpar filtros
  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSelectedStatus("all")
    setDate({
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date(),
    })
  }

  // Definir períodos rápidos
  const setThisMonth = () => {
    const now = new Date()
    setDate({
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(),
    })
  }

  const setLastMonth = () => {
    const now = new Date()
    setDate({
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      to: new Date(now.getFullYear(), now.getMonth(), 0),
    })
  }

  const setThisYear = () => {
    const now = new Date()
    setDate({
      from: new Date(now.getFullYear(), 0, 1),
      to: new Date(),
    })
  }

  // Verificar se está carregando
  const isLoading = revenuesLoading || categoriesLoading
  const isError = revenuesError || categoriesError

  // Renderizar estado de carregamento
  if (isLoading) {
    return (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Receitas</h1>
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-3 w-40" />
                  </CardContent>
                </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-6 flex justify-center items-center min-h-[300px] flex-col gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Carregando receitas...</p>
            </CardContent>
          </Card>
        </div>
    )
  }

  // Renderizar estado de erro
  if (isError) {
    return (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Receitas</h1>
            <p className="text-muted-foreground">Gerenciamento de receitas</p>
          </div>

          <Card>
            <CardContent className="p-6 flex justify-center items-center min-h-[300px] flex-col gap-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <h3 className="text-lg font-semibold">Erro ao carregar dados</h3>
              <p className="text-muted-foreground text-center">
                Ocorreu um erro ao carregar as receitas. Por favor, tente novamente mais tarde.
              </p>
              <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
            </CardContent>
          </Card>
        </div>
    )
  }

  return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Receitas</h1>
          <p className="text-muted-foreground">Gerencie suas receitas e acompanhe seus ganhos</p>
        </div>

        {/* Cards de resumo */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">{filteredRevenues.length} transações no período</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas Recebidas</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(paidRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {filteredRevenues.filter((r) => r.status === "pago").length} transações recebidas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas Pendentes</CardTitle>
              <TrendingUp className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{formatCurrency(pendingRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {filteredRevenues.filter((r) => r.status === "pendente").length} transações pendentes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e controles */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <DatePickerWithRange date={date} setDate={setDate} />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={setThisMonth}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Este mês
                </Button>
                <Button variant="outline" size="sm" onClick={setLastMonth}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Mês anterior
                </Button>
                <Button variant="outline" size="sm" onClick={setThisYear}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Este ano
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2 md:flex-row">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filtros
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Opções de filtro</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <p className="text-xs font-medium mb-1">Categoria</p>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        {/* Usar um Set para obter categorias únicas de todas as receitas */}
                        {Array.from(
                            new Set(
                                revenues
                                    ?.flatMap((revenue) => revenue.categories)
                                    .map((cat) => JSON.stringify({ id: cat.id, name: cat.name })),
                            ),
                        )
                            .map((cat) => JSON.parse(cat))
                            .map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium mb-1">Status</p>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="paid">Recebido</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={clearFilters} className="justify-center text-primary">
                    Limpar filtros
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" className="gap-2" onClick={exportToCSV}>
                <FileDown className="h-4 w-4" />
                Exportar
              </Button>
              <Button className="gap-2" asChild>
                <Link href="/nova-transacao">
                  <Plus className="h-4 w-4" />
                  Nova Receita
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Buscar receitas..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-auto">
              <Tabs value={selectedView} onValueChange={setSelectedView}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="list">Lista</TabsTrigger>
                  <TabsTrigger value="cards">Cards</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <Tabs value={selectedView} className="mt-4">
          <TabsContent value="list">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button variant="ghost" className="p-0 h-8 font-medium" onClick={() => handleSort("name")}>
                          Nome
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="p-0 h-8 font-medium" onClick={() => handleSort("date")}>
                          Data
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="p-0 h-8 font-medium" onClick={() => handleSort("amount")}>
                          Valor
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedRevenues.length > 0 ? (
                        sortedRevenues.map((revenue) => (
                            <TableRow key={revenue.id}>
                              <TableCell className="font-medium">{revenue.name}</TableCell>
                              <TableCell>{formatDate(revenue.date)}</TableCell>
                              <TableCell className="text-primary">{formatCurrency(revenue.value)}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {revenue.categories.map((cat) => (
                                      <Badge key={cat.id} variant="outline" className="whitespace-nowrap">
                                        {cat.name}
                                      </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={revenue.status === "pago" ? "success" : "outline"}>
                                  {revenue.status === "pago" ? "Recebido" : "Pendente"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver detalhes">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog
                                      open={itemToDelete === revenue.id}
                                      onOpenChange={(open) => !open && setItemToDelete(null)}
                                  >
                                    <AlertDialogTrigger asChild>
                                      <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-destructive"
                                          onClick={() => setItemToDelete(revenue.id)}
                                          title="Excluir"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Excluir receita</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Tem certeza que deseja excluir a receita "{revenue.name}"? Esta ação não pode ser
                                          desfeita.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleDelete(revenue.id)}
                                            className="bg-destructive text-destructive-foreground"
                                        >
                                          Excluir
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <p className="text-muted-foreground">Nenhuma receita encontrada</p>
                              <Button variant="outline" size="sm" onClick={clearFilters}>
                                Limpar filtros
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              {sortedRevenues.length > 0 && (
                  <CardFooter className="flex justify-between py-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {sortedRevenues.length} de {revenues.length} receitas
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled>
                        Anterior
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        Próximo
                      </Button>
                    </div>
                  </CardFooter>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="cards">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.values(revenuesByCategory).length > 0 ? (
                  (Object.values(revenuesByCategory) as RevenueCategoryGroup[]).map((category) => (
                      <Card key={category.id}>
                        <CardHeader>
                          <CardTitle className="flex justify-between items-center">
                            <span>{category.name}</span>
                            <Badge variant="outline">{category.count}</Badge>
                          </CardTitle>
                          <CardDescription>Total: {formatCurrency(category.total)}</CardDescription>
                        </CardHeader>
                        <CardContent className="max-h-60 overflow-y-auto">
                          <div className="space-y-2">
                            {category.items.map((revenue) => (
                                <div key={revenue.id} className="flex justify-between items-center p-2 border rounded-md">
                                  <div>
                                    <p className="font-medium">{revenue.name}</p>
                                    <p className="text-xs text-muted-foreground">{formatDate(revenue.date)}</p>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="text-primary">{formatCurrency(revenue.value)}</span>
                                    <Badge variant={revenue.status === "pago" ? "success" : "outline"} className="mt-1">
                                      {revenue.status === "pago" ? "Recebido" : "Pendente"}
                                    </Badge>
                                  </div>
                                </div>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t pt-4">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/categorias/${category.id}`}>Ver categoria</Link>
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Download className="h-4 w-4" />
                            Exportar
                          </Button>
                        </CardFooter>
                      </Card>
                  ))
              ) : (
                  <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center h-40 gap-2">
                      <p className="text-muted-foreground">Nenhuma receita encontrada</p>
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        Limpar filtros
                      </Button>
                    </CardContent>
                  </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
  )
}