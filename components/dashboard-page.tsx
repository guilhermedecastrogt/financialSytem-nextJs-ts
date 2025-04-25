"use client"

import { useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  DollarSign,
  Download,
  Loader2,
  Plus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
} from "recharts"
import type { DateRange } from "react-day-picker"
import { subMonths } from "date-fns"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useDashboardData } from "@/hooks/dashboard/useDashboardData"
import Link from "next/link"

export function DashboardPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  })
  const [period, setPeriod] = useState<string>("3months")
  const [view, setView] = useState<string>("overview")

  // Modificar a chamada do hook para passar o intervalo de datas
  const {
    isLoading,
    isError,
    financialSummary,
    monthlyData,
    expenseCategoryDistribution,
    revenueCategoryDistribution,
    recentTransactions,
  } = useDashboardData(date)

  // Função para definir períodos rápidos
  const setThisMonth = () => {
    const now = new Date()
    setDate({
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(),
    })
    setPeriod("thisMonth")
  }

  const setLastMonth = () => {
    const now = new Date()
    setDate({
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      to: new Date(now.getFullYear(), now.getMonth(), 0),
    })
    setPeriod("lastMonth")
  }

  const setLast3Months = () => {
    setDate({
      from: subMonths(new Date(), 3),
      to: new Date(),
    })
    setPeriod("3months")
  }

  const setThisYear = () => {
    const now = new Date()
    setDate({
      from: new Date(now.getFullYear(), 0, 1),
      to: new Date(),
    })
    setPeriod("thisYear")
  }

  // Função para filtrar transações por data
  const filterTransactionsByDate = (transactions: any[]) => {
    if (!transactions || transactions.length === 0) return []

    // If no date range is provided, return all transactions
    if (!date) return transactions

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)

      // If from date is provided, check if transaction date is after or equal to from date
      const isAfterFromDate = date.from ? transactionDate >= date.from : true

      // If to date is provided, check if transaction date is before or equal to to date
      let isBeforeToDate = true
      if (date.to) {
        // Ajustar para o final do dia para a data final
        const endDate = new Date(date.to)
        endDate.setHours(23, 59, 59, 999)
        isBeforeToDate = transactionDate <= endDate
      }

      return isAfterFromDate && isBeforeToDate
    })
  }

  // Renderizar estado de carregamento
  if (isLoading) {
    return (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
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
              <p className="text-muted-foreground">Carregando dashboard...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral das suas finanças</p>
          </div>

          <Card>
            <CardContent className="p-6 flex justify-center items-center min-h-[300px] flex-col gap-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <h3 className="text-lg font-semibold">Erro ao carregar dados</h3>
              <p className="text-muted-foreground text-center">
                Ocorreu um erro ao carregar os dados do dashboard. Por favor, tente novamente mais tarde.
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das suas finanças</p>
        </div>

        {/* Filtros e controles */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <DatePickerWithRange date={date} setDate={setDate} />
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              <Button variant={period === "thisMonth" ? "default" : "outline"} size="sm" onClick={setThisMonth}>
                <Calendar className="mr-2 h-4 w-4" />
                Este mês
              </Button>
              <Button variant={period === "lastMonth" ? "default" : "outline"} size="sm" onClick={setLastMonth}>
                <Calendar className="mr-2 h-4 w-4" />
                Mês anterior
              </Button>
              <Button variant={period === "3months" ? "default" : "outline"} size="sm" onClick={setLast3Months}>
                <Calendar className="mr-2 h-4 w-4" />
                Últimos 3 meses
              </Button>
              <Button variant={period === "thisYear" ? "default" : "outline"} size="sm" onClick={setThisYear}>
                <Calendar className="mr-2 h-4 w-4" />
                Este ano
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button size="sm" asChild>
              <Link href="/nova-transacao">
                <Plus className="mr-2 h-4 w-4" />
                Nova Transação
              </Link>
            </Button>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                  className={`text-2xl font-bold ${financialSummary.balance >= 0 ? "text-primary" : "text-destructive"}`}
              >
                {financialSummary.formattedBalance}
              </div>
              <div className="flex items-center pt-1">
                {financialSummary.balance >= 0 ? (
                    <ArrowUp className="mr-1 h-3 w-3 text-primary" />
                ) : (
                    <ArrowDown className="mr-1 h-3 w-3 text-destructive" />
                )}
                <span className="text-xs text-muted-foreground">
                {financialSummary.balance >= 0 ? "Positivo" : "Negativo"}
              </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{financialSummary.formattedTotalRevenues}</div>
              <div className="flex items-center pt-1">
                <Badge variant="outline" className="text-xs">
                  {financialSummary.formattedPendingRevenues} pendente
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{financialSummary.formattedTotalExpenses}</div>
              <div className="flex items-center pt-1">
                <Badge variant="outline" className="text-xs">
                  {financialSummary.formattedPendingExpenses} pendente
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Economia</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {financialSummary.totalRevenues > 0 ? (
                  <>
                    <div className="text-2xl font-bold">
                      {Math.round((1 - financialSummary.totalExpenses / financialSummary.totalRevenues) * 100)}%
                    </div>
                    <Progress
                        value={Math.min(100, 100 - (financialSummary.totalExpenses / financialSummary.totalRevenues) * 100)}
                        className="h-2 mt-2"
                    />
                  </>
              ) : (
                  <div className="text-2xl font-bold">0%</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs e conteúdo principal */}
        <Tabs defaultValue="overview" value={view} onValueChange={setView} className="space-y-4">
          <TabsList className="grid grid-cols-3 h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs sm:text-sm py-2">
              Categorias
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs sm:text-sm py-2">
              Transações
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo da aba Visão Geral */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Receitas vs Despesas</CardTitle>
                  <CardDescription>Comparação mensal entre receitas e despesas</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis
                          tickFormatter={(value) =>
                              new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                                notation: "compact",
                                compactDisplay: "short",
                              }).format(value)
                          }
                      />
                      <Tooltip
                          formatter={(value) =>
                              new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(Number(value))
                          }
                      />
                      <Legend />
                      <Bar dataKey="revenues" name="Receitas" fill="#3cdaa1" />
                      <Bar dataKey="expenses" name="Despesas" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Saldo Mensal</CardTitle>
                  <CardDescription>Evolução do saldo ao longo dos meses</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis
                          tickFormatter={(value) =>
                              new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                                notation: "compact",
                                compactDisplay: "short",
                              }).format(value)
                          }
                      />
                      <Tooltip
                          formatter={(value) =>
                              new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(Number(value))
                          }
                      />
                      <Legend />
                      <Line
                          type="monotone"
                          dataKey="balance"
                          name="Saldo"
                          stroke="#3cdaa1"
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Transações Recentes</CardTitle>
                  <CardDescription>Últimas transações registradas</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="space-y-2">
                    {filterTransactionsByDate(recentTransactions)
                        .slice(0, 5)
                        .map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between px-6 py-2 hover:bg-muted/50"
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                    className={`p-2 rounded-full ${transaction.type === "revenue" ? "bg-primary/20" : "bg-destructive/20"}`}
                                >
                                  {transaction.type === "revenue" ? (
                                      <TrendingUp className={`h-4 w-4 text-primary`} />
                                  ) : (
                                      <TrendingDown className={`h-4 w-4 text-destructive`} />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{transaction.name}</p>
                                  <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p
                                    className={`text-sm font-medium ${transaction.type === "revenue" ? "text-primary" : "text-destructive"}`}
                                >
                                  {transaction.type === "revenue" ? "+" : "-"}
                                  {formatCurrency(transaction.value)}
                                </p>
                                <p className="text-xs text-muted-foreground">{transaction.category}</p>
                              </div>
                            </div>
                        ))}
                  </div>
                  {recentTransactions.length > 5 && (
                      <div className="px-6 py-3 border-t">
                        <Button variant="ghost" size="sm" className="w-full" onClick={() => setView("transactions")}>
                          Ver todas as transações
                        </Button>
                      </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumo de Gastos</CardTitle>
                  <CardDescription>Principais categorias de despesas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {expenseCategoryDistribution.slice(0, 5).map((category) => (
                        <div key={category.id} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }} />
                              <span className="text-sm">{category.name}</span>
                            </div>
                            <span className="text-sm font-medium">{formatCurrency(category.value)}</span>
                          </div>
                          <Progress value={category.percentage} className="h-2" />
                          <p className="text-xs text-muted-foreground text-right">{category.percentage.toFixed(1)}%</p>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Conteúdo da aba Categorias */}
          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distribuição de Despesas</CardTitle>
                  <CardDescription>Despesas por categoria</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                          data={expenseCategoryDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {expenseCategoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                          formatter={(value) =>
                              new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(Number(value))
                          }
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distribuição de Receitas</CardTitle>
                  <CardDescription>Receitas por categoria</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                          data={revenueCategoryDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {revenueCategoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                          formatter={(value) =>
                              new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(Number(value))
                          }
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalhamento de Despesas</CardTitle>
                  <CardDescription>Todas as categorias de despesas</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="space-y-1">
                    {expenseCategoryDistribution.map((category) => (
                        <div key={category.id} className="flex items-center justify-between px-6 py-2 hover:bg-muted/50">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }} />
                            <span className="text-sm">{category.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatCurrency(category.value)}</p>
                            <p className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalhamento de Receitas</CardTitle>
                  <CardDescription>Todas as categorias de receitas</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="space-y-1">
                    {revenueCategoryDistribution.map((category) => (
                        <div key={category.id} className="flex items-center justify-between px-6 py-2 hover:bg-muted/50">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }} />
                            <span className="text-sm">{category.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatCurrency(category.value)}</p>
                            <p className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Conteúdo da aba Transações */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Todas as Transações</CardTitle>
                <CardDescription>Histórico completo de transações</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <div className="space-y-1">
                  {filterTransactionsByDate(recentTransactions).length > 0 ? (
                      filterTransactionsByDate(recentTransactions).map((transaction) => (
                          <div
                              key={transaction.id}
                              className="flex items-center justify-between px-6 py-3 hover:bg-muted/50 border-b last:border-0"
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                  className={`p-2 rounded-full ${transaction.type === "revenue" ? "bg-primary/20" : "bg-destructive/20"}`}
                              >
                                {transaction.type === "revenue" ? (
                                    <TrendingUp className={`h-4 w-4 text-primary`} />
                                ) : (
                                    <TrendingDown className={`h-4 w-4 text-destructive`} />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{transaction.name}</p>
                                <div className="flex items-center space-x-2">
                                  <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                                  <Badge variant="outline" className="text-xs">
                                    {transaction.category}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                  className={`text-sm font-medium ${transaction.type === "revenue" ? "text-primary" : "text-destructive"}`}
                              >
                                {transaction.type === "revenue" ? "+" : "-"}
                                {formatCurrency(transaction.value)}
                              </p>
                              <Badge
                                  variant={
                                    transaction.status === "pago" || transaction.status === "paid" ? "success" : "outline"
                                  }
                                  className="text-xs"
                              >
                                {transaction.status === "pago" || transaction.status === "paid" ? "Pago" : "Pendente"}
                              </Badge>
                            </div>
                          </div>
                      ))
                  ) : (
                      <div className="px-6 py-4 text-center text-muted-foreground">Nenhuma transação encontrada</div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t">
                <p className="text-sm text-muted-foreground">Mostrando {recentTransactions.length} transações</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/receitas">Ver Receitas</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/despesas">Ver Despesas</Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}
