"use client"

import { useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, CalendarIcon, DollarSign, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RevenueExpenseChart } from "@/components/charts/revenue-expense-chart"
import { CategoryDistributionChart } from "@/components/charts/category-distribution-chart"
import { MonthlyBreakdownChart } from "@/components/charts/monthly-breakdown-chart"
import { RecentTransactionsTable } from "@/components/recent-transactions-table"
import type { DateRange } from "react-day-picker"
import { subMonths } from "date-fns"
import { useData } from "@/lib/data-context"
import { formatCurrency } from "@/lib/utils"

export function DashboardPage() {
  const { revenues, spents, revenueCategories, spentCategories } = useData()

  const [date, setDate] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  })

  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  // Calcular métricas do dashboard
  const grossProfit = revenues
    .filter((revenue) => revenue.status === "pago")
    .reduce((sum, revenue) => sum + revenue.value, 0)

  const totalExpenses = spents.filter((spent) => spent.status).reduce((sum, spent) => sum + spent.value, 0)

  const netProfit = grossProfit - totalExpenses
  const isLoss = netProfit < 0

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Visão geral das suas finanças</p>
      </div>

      {/* Filtros e controles */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <DatePickerWithRange date={date} setDate={setDate} className="w-full sm:w-auto" />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <CalendarIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Este mês
            </Button>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <CalendarIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Último mês
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="text-xs sm:text-sm">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {[...revenueCategories, ...spentCategories].map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="text-xs sm:text-sm">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="annual">Anual</SelectItem>
              <SelectItem value="fixed">Fixo</SelectItem>
              <SelectItem value="variable">Variável</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="text-xs sm:text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Lucro Bruto</CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-base sm:text-2xl font-bold">{formatCurrency(grossProfit)}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total de receitas pagas</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Gastos Totais</CardTitle>
            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-base sm:text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total de despesas pagas</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Lucro Líquido</CardTitle>
            {isLoss ? (
              <ArrowDownIcon className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
            ) : (
              <ArrowUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
            )}
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className={`text-base sm:text-2xl font-bold ${isLoss ? "text-destructive" : "text-success"}`}>
              {formatCurrency(netProfit)}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{isLoss ? "Prejuízo" : "Lucro"} no período</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Balanço</CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span>{formatCurrency(grossProfit)}</span>
              </div>
              <span className="text-muted-foreground">vs</span>
              <div className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                <span>{formatCurrency(totalExpenses)}</span>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Receitas vs Despesas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs e conteúdo principal */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-3 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm py-2">
            Análise
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs sm:text-sm py-2">
            Transações
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo da aba Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            <Card className="lg:col-span-4 overflow-hidden">
              <CardHeader className="p-4">
                <CardTitle className="text-sm sm:text-base">Receitas vs Despesas</CardTitle>
                <CardDescription className="text-xs">
                  Comparação entre receitas e despesas ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:pl-2 h-[250px] sm:h-[350px]">
                <RevenueExpenseChart />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3 overflow-hidden">
              <CardHeader className="p-4">
                <CardTitle className="text-sm sm:text-base">Distribuição por Categoria</CardTitle>
                <CardDescription className="text-xs">Distribuição de despesas por categoria</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] sm:h-[300px] p-0">
                <CategoryDistributionChart />
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            <Card className="lg:col-span-3 overflow-hidden">
              <CardHeader className="p-4">
                <CardTitle className="text-sm sm:text-base">Detalhamento Mensal</CardTitle>
                <CardDescription className="text-xs">Receitas e despesas por mês</CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:pl-2 h-[250px] sm:h-[300px]">
                <MonthlyBreakdownChart />
              </CardContent>
            </Card>
            <Card className="lg:col-span-4 overflow-hidden">
              <CardHeader className="p-4">
                <CardTitle className="text-sm sm:text-base">Transações Recentes</CardTitle>
                <CardDescription className="text-xs">Últimas transações registradas</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-auto">
                <div className="max-h-[250px] sm:max-h-[300px] overflow-auto">
                  <RecentTransactionsTable />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conteúdo da aba Análise */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="overflow-hidden">
              <CardHeader className="p-4">
                <CardTitle className="text-sm sm:text-base">Categorias Mais Utilizadas</CardTitle>
                <CardDescription className="text-xs">Top 5 categorias por valor</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-primary" />
                      <span>Alimentação</span>
                    </div>
                    <span className="font-medium">R$ 2.500,00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-blue-500" />
                      <span>Moradia</span>
                    </div>
                    <span className="font-medium">R$ 1.800,00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-green-500" />
                      <span>Transporte</span>
                    </div>
                    <span className="font-medium">R$ 1.200,00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-yellow-500" />
                      <span>Lazer</span>
                    </div>
                    <span className="font-medium">R$ 950,00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-purple-500" />
                      <span>Saúde</span>
                    </div>
                    <span className="font-medium">R$ 850,00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <CardHeader className="p-4">
                <CardTitle className="text-sm sm:text-base">Status de Pagamento</CardTitle>
                <CardDescription className="text-xs">Proporção de transações pagas vs pendentes</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span>Receitas Pagas</span>
                      <span className="font-medium">75%</span>
                    </div>
                    <div className="h-1.5 sm:h-2 w-full rounded-full bg-muted">
                      <div className="h-1.5 sm:h-2 w-[75%] rounded-full bg-primary" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span>Receitas Pendentes</span>
                      <span className="font-medium">25%</span>
                    </div>
                    <div className="h-1.5 sm:h-2 w-full rounded-full bg-muted">
                      <div className="h-1.5 sm:h-2 w-[25%] rounded-full bg-warning" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span>Despesas Pagas</span>
                      <span className="font-medium">80%</span>
                    </div>
                    <div className="h-1.5 sm:h-2 w-full rounded-full bg-muted">
                      <div className="h-1.5 sm:h-2 w-[80%] rounded-full bg-destructive" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span>Despesas Pendentes</span>
                      <span className="font-medium">20%</span>
                    </div>
                    <div className="h-1.5 sm:h-2 w-full rounded-full bg-muted">
                      <div className="h-1.5 sm:h-2 w-[20%] rounded-full bg-orange-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden md:col-span-2 lg:col-span-1">
              <CardHeader className="p-4">
                <CardTitle className="text-sm sm:text-base">Tendência Mensal</CardTitle>
                <CardDescription className="text-xs">Variação percentual em relação ao mês anterior</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span>Receitas</span>
                    <div className="flex items-center gap-1">
                      <ArrowUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      <span className="text-primary">+12%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Despesas</span>
                    <div className="flex items-center gap-1">
                      <ArrowUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                      <span className="text-destructive">+5%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Lucro Líquido</span>
                    <div className="flex items-center gap-1">
                      <ArrowUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      <span className="text-primary">+18%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conteúdo da aba Transações */}
        <TabsContent value="transactions" className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle className="text-sm sm:text-base">Todas as Transações</CardTitle>
              <CardDescription className="text-xs">Histórico completo de transações</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-auto">
              <div className="max-h-[500px] overflow-auto">
                <RecentTransactionsTable showAll />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

