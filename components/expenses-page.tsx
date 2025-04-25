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
  TrendingDown,
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
import { useData } from "@/lib/data-context"
import { useAllSpents } from "@/lib/hooks/spents/useAllSpents"
import { useToast } from "@/components/ui/use-toast"

type Category = {
  id: string
  name: string
}

// Primeiro, vamos definir uma interface para a categoria agrupada
interface ExpenseCategoryGroup {
  id: string
  name: string
  total: number
  count: number
  items: Array<{
    id: string
    name: string
    date: string | Date
    value: number
    status: boolean
    categories: Category[]
    description?: string
  }>
}

export function ExpensesPage() {
  const { spents, isLoading, isError } = useAllSpents()
  const { spentCategories } = useData()
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

  // Filtrar despesas com base nos critérios selecionados
  const filteredExpenses =
      spents?.filter((expense) => {
        const matchesSearch = expense.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory =
            selectedCategory === "all" || expense.categories.some((cat: Category) => cat.id === selectedCategory)

        const matchesStatus =
            selectedStatus === "all" ||
            (selectedStatus === "paid" && expense.status) ||
            (selectedStatus === "pending" && !expense.status)

        // Filtrar por data se o intervalo estiver definido
        const matchesDate =
            !date?.from || !date?.to || (new Date(expense.date) >= date.from && new Date(expense.date) <= date.to)

        return matchesSearch && matchesCategory && matchesStatus && matchesDate
      }) || []

  // Ordenar despesas
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
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
  const totalExpense = filteredExpenses.reduce((sum, expense) => sum + expense.value, 0)
  const paidExpense = filteredExpenses
      .filter((expense) => expense.status)
      .reduce((sum, expense) => sum + expense.value, 0)
  const pendingExpense = filteredExpenses
      .filter((expense) => !expense.status)
      .reduce((sum, expense) => sum + expense.value, 0)

  // Agora, vamos atualizar a parte onde agrupamos as despesas por categoria
  const expensesByCategory = filteredExpenses.reduce(
      (acc, expense) => {
        expense.categories.forEach((cat: Category) => {
          if (!acc[cat.id]) {
            acc[cat.id] = {
              id: cat.id,
              name: cat.name,
              total: 0,
              count: 0,
              items: [],
            }
          }
          acc[cat.id].total += expense.value
          acc[cat.id].count += 1
          acc[cat.id].items.push(expense)
        })
        return acc
      },
      {} as Record<string, ExpenseCategoryGroup>,
  )

  // Exportar dados para CSV
  const exportToCSV = () => {
    const headers = ["Nome", "Data", "Valor", "Categorias", "Status"]
    const csvData = sortedExpenses.map((expense) => [
      expense.name,
      formatDate(expense.date),
      expense.value.toString(),
      expense.categories.map((cat: Category) => cat.name).join(", "),
      expense.status ? "Pago" : "Pendente",
    ])

    const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `despesas_${formatDate(new Date())}.csv`)
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
      description: "A despesa foi excluída com sucesso.",
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

  // Renderizar estado de carregamento
  if (isLoading) {
    return (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Despesas</h1>
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
              <p className="text-muted-foreground">Carregando despesas...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Despesas</h1>
            <p className="text-muted-foreground">Gerenciamento de despesas</p>
          </div>

          <Card>
            <CardContent className="p-6 flex justify-center items-center min-h-[300px] flex-col gap-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <h3 className="text-lg font-semibold">Erro ao carregar dados</h3>
              <p className="text-muted-foreground text-center">
                Ocorreu um erro ao carregar as despesas. Por favor, tente novamente mais tarde.
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
          <h1 className="text-3xl font-bold tracking-tight">Despesas</h1>
          <p className="text-muted-foreground">Gerencie suas despesas e acompanhe seus gastos</p>
        </div>

        {/* Cards de resumo */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalExpense)}</div>
              <p className="text-xs text-muted-foreground">{filteredExpenses.length} transações no período</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas Pagas</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{formatCurrency(paidExpense)}</div>
              <p className="text-xs text-muted-foreground">
                {filteredExpenses.filter((e) => e.status).length} transações pagas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas Pendentes</CardTitle>
              <TrendingDown className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{formatCurrency(pendingExpense)}</div>
              <p className="text-xs text-muted-foreground">
                {filteredExpenses.filter((e) => !e.status).length} transações pendentes
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
                        {spentCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
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
                        <SelectItem value="paid">Pago</SelectItem>
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
                  Nova Despesa
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
                    placeholder="Buscar despesas..."
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
                    {sortedExpenses.length > 0 ? (
                        sortedExpenses.map((expense) => (
                            <TableRow key={expense.id}>
                              <TableCell className="font-medium">{expense.name}</TableCell>
                              <TableCell>{formatDate(expense.date)}</TableCell>
                              <TableCell className="text-destructive">{formatCurrency(expense.value)}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {expense.categories.map((cat: Category) => (
                                      <Badge key={cat.id} variant="outline" className="whitespace-nowrap">
                                        {cat.name}
                                      </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={expense.status ? "destructive" : "outline"}>
                                  {expense.status ? "Pago" : "Pendente"}
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
                                      open={itemToDelete === expense.id}
                                      onOpenChange={(open) => !open && setItemToDelete(null)}
                                  >
                                    <AlertDialogTrigger asChild>
                                      <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-destructive"
                                          onClick={() => setItemToDelete(expense.id)}
                                          title="Excluir"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Excluir despesa</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Tem certeza que deseja excluir a despesa "{expense.name}"? Esta ação não pode ser
                                          desfeita.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleDelete(expense.id)}
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
                              <p className="text-muted-foreground">Nenhuma despesa encontrada</p>
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
              {sortedExpenses.length > 0 && (
                  <CardFooter className="flex justify-between py-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {sortedExpenses.length} de {spents.length} despesas
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

          {/* E na parte do TabsContent, vamos corrigir o mapeamento */}
          <TabsContent value="cards">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.values(expensesByCategory).length > 0 ? (
                  (Object.values(expensesByCategory) as ExpenseCategoryGroup[]).map((category) => (
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
                            {category.items.map((expense) => (
                                <div key={expense.id} className="flex justify-between items-center p-2 border rounded-md">
                                  <div>
                                    <p className="font-medium">{expense.name}</p>
                                    <p className="text-xs text-muted-foreground">{formatDate(expense.date)}</p>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="text-destructive">{formatCurrency(expense.value)}</span>
                                    <Badge variant={expense.status ? "destructive" : "outline"} className="mt-1">
                                      {expense.status ? "Pago" : "Pendente"}
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
                      <p className="text-muted-foreground">Nenhuma despesa encontrada</p>
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
