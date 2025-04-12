"use client"

import { useState, useEffect } from "react"
import { ArrowUpDown, MoreHorizontal, TrendingDown, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { formatCurrency, formatDate } from "@/lib/utils"
import { useData } from "@/lib/data-context"

interface RecentTransactionsTableProps {
  showAll?: boolean
}

export function RecentTransactionsTable({ showAll = false }: RecentTransactionsTableProps) {
  const { revenues, spents, revenueCategories, spentCategories } = useData()
  const [sorting, setSorting] = useState<{ column: string; direction: "asc" | "desc" }>({
    column: "date",
    direction: "desc",
  })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    // Verificar inicialmente
    checkMobile()

    // Adicionar listener para redimensionamento
    window.addEventListener("resize", checkMobile)

    // Limpar listener
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Combinar receitas e despesas em uma única lista de transações
  const transactions = [
    ...revenues.map((revenue) => ({
      id: revenue.id,
      name: revenue.name,
      date: revenue.date,
      amount: revenue.value,
      type: "revenue" as const,
      category: revenue.categories.map((catId) => revenueCategories.find((cat) => cat.id === catId)?.name || ""),
      status: revenue.status,
    })),
    ...spents.map((spent) => ({
      id: spent.id,
      name: spent.name,
      date: spent.date,
      amount: spent.value,
      type: "expense" as const,
      category: spent.categories.map((catId) => spentCategories.find((cat) => cat.id === catId)?.name || ""),
      status: spent.status ? "pago" : "pendente",
    })),
  ]

  const sortedTransactions = [...transactions].sort((a, b) => {
    const { column, direction } = sorting

    if (column === "date") {
      return direction === "asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime()
    }

    if (column === "amount") {
      return direction === "asc" ? a.amount - b.amount : b.amount - a.amount
    }

    return 0
  })

  const displayedTransactions = showAll ? sortedTransactions : sortedTransactions.slice(0, 5)

  const handleSort = (column: string) => {
    setSorting((prev) => ({
      column,
      direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  return (
    <div className="w-full overflow-auto">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs sm:text-sm">Nome</TableHead>
            <TableHead className="text-xs sm:text-sm">
              <Button
                variant="ghost"
                className="p-0 h-6 sm:h-8 font-medium text-xs sm:text-sm"
                onClick={() => handleSort("date")}
              >
                Data
                <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-xs sm:text-sm">
              <Button
                variant="ghost"
                className="p-0 h-6 sm:h-8 font-medium text-xs sm:text-sm"
                onClick={() => handleSort("amount")}
              >
                Valor
                <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </TableHead>
            {!isMobile && (
              <>
                <TableHead className="text-xs sm:text-sm">Categoria</TableHead>
                <TableHead className="text-xs sm:text-sm">Status</TableHead>
              </>
            )}
            <TableHead className="text-right text-xs sm:text-sm">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-4">
                {transaction.type === "revenue" ? (
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                ) : (
                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                )}
                <span className="truncate max-w-[80px] sm:max-w-full">{transaction.name}</span>
              </TableCell>
              <TableCell className="text-xs sm:text-sm py-2 sm:py-4">{formatDate(transaction.date)}</TableCell>
              <TableCell
                className={`text-xs sm:text-sm py-2 sm:py-4 ${transaction.type === "revenue" ? "text-primary" : "text-destructive"}`}
              >
                {transaction.type === "revenue" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </TableCell>
              {!isMobile && (
                <>
                  <TableCell className="text-xs sm:text-sm py-2 sm:py-4">
                    <div className="flex flex-wrap gap-1">
                      {transaction.category.slice(0, 1).map((cat, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] sm:text-xs whitespace-nowrap">
                          {cat}
                        </Badge>
                      ))}
                      {transaction.category.length > 1 && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs whitespace-nowrap">
                          +{transaction.category.length - 1}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm py-2 sm:py-4">
                    <Badge
                      variant={transaction.status === "pago" ? "default" : "outline"}
                      className="text-[10px] sm:text-xs"
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                </>
              )}
              <TableCell className="text-right text-xs sm:text-sm py-2 sm:py-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="text-xs sm:text-sm">
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
    </div>
  )
}

