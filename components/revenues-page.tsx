"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpDown, ChevronDown, Download, Filter, MoreHorizontal, Plus, Search, TrendingUp } from "lucide-react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DateRange } from "react-day-picker"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useData } from "@/lib/data-context"

export function RevenuesPage() {
  const { revenues, revenueCategories } = useData()
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2023, 5, 1),
    to: new Date(2023, 5, 30),
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [sorting, setSorting] = useState<{ column: string; direction: "asc" | "desc" }>({
    column: "date",
    direction: "desc",
  })

  const filteredRevenues = revenues.filter((revenue) => {
    const matchesSearch = revenue.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || revenue.categories.includes(selectedCategory)
    const matchesStatus = selectedStatus === "all" || revenue.status === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

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

    return 0
  })

  const handleSort = (column: string) => {
    setSorting((prev) => ({
      column,
      direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const totalRevenue = filteredRevenues.reduce((sum, revenue) => sum + revenue.value, 0)
  const paidRevenue = filteredRevenues
    .filter((revenue) => revenue.status === "pago")
    .reduce((sum, revenue) => sum + revenue.value, 0)
  const pendingRevenue = filteredRevenues
    .filter((revenue) => revenue.status === "pendente")
    .reduce((sum, revenue) => sum + revenue.value, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Receitas</h1>
        <p className="text-muted-foreground">Gerencie suas receitas e acompanhe seus ganhos</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">{filteredRevenues.length} transações no período</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas Pagas</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(paidRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredRevenues.filter((r) => r.status === "pago").length} transações pagas
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

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <DatePickerWithRange date={date} setDate={setDate} />
          </div>
          <div className="flex flex-col gap-2 md:flex-row">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
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

        <div className="flex flex-col gap-4 md:flex-row">
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
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {revenueCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
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
                {sortedRevenues.map((revenue) => (
                  <TableRow key={revenue.id}>
                    <TableCell className="font-medium">{revenue.name}</TableCell>
                    <TableCell>{formatDate(revenue.date)}</TableCell>
                    <TableCell className="text-primary">{formatCurrency(revenue.value)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {revenue.categories.map((catId) => {
                          const category = revenueCategories.find((cat) => cat.id === catId)
                          return category ? (
                            <Badge key={catId} variant="outline" className="whitespace-nowrap">
                              {category.name}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={revenue.status === "pago" ? "success" : "outline"}>{revenue.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

