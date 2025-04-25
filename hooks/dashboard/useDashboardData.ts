"use client"
import { useAllRevenues } from "@/hooks/revenues/useAllRevenues"
import { useAllSpents } from "@/hooks/spents/useAllSpents"
import { useRevenueCategories } from "@/hooks/revenues/useCategories"
import { useCategories as useSpentCategories } from "@/hooks/spents/useCategories"
import { useMemo } from "react"
import { formatCurrency } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Interface para dados agregados por mês
export interface MonthlyData {
    month: string
    revenues: number
    expenses: number
    balance: number
}

// Interface para dados agregados por categoria
export interface CategoryData {
    id: string
    name: string
    value: number
    percentage: number
    color: string
}

// Interface para transações recentes
export interface RecentTransaction {
    id: string
    name: string
    date: string | Date
    value: number
    type: "revenue" | "expense"
    category: string
    status: string
}

// Interface para resumo financeiro
export interface FinancialSummary {
    totalRevenues: number
    totalExpenses: number
    balance: number
    pendingRevenues: number
    pendingExpenses: number
    formattedTotalRevenues: string
    formattedTotalExpenses: string
    formattedBalance: string
    formattedPendingRevenues: string
    formattedPendingExpenses: string
}

// Cores para categorias
const CATEGORY_COLORS = [
    "#3cdaa1", // primary
    "#22c55e", // green
    "#8b5cf6", // purple
    "#f59e0b", // amber
    "#ef4444", // red
    "#06b6d4", // cyan
    "#ec4899", // pink
    "#64748b", // slate
    "#0ea5e9", // sky
    "#84cc16", // lime
    "#d946ef", // fuchsia
    "#f97316", // orange
]

// Adicionar uma função para filtrar dados por intervalo de datas
export function filterDataByDateRange(
    data: any[],
    dateRange: { from?: Date; to?: Date } | undefined,
    dateField = "date",
) {
    if (!data) return []

    // If no date range is provided, return all data
    if (!dateRange) return data

    return data.filter((item) => {
        const itemDate = new Date(item[dateField])

        // If from date is provided, check if item date is after or equal to from date
        const isAfterFromDate = dateRange.from ? itemDate >= dateRange.from : true

        // If to date is provided, check if item date is before or equal to to date
        let isBeforeToDate = true
        if (dateRange.to) {
            // Adjust to date to end of day
            const endDate = new Date(dateRange.to)
            endDate.setHours(23, 59, 59, 999)
            isBeforeToDate = itemDate <= endDate
        }

        return isAfterFromDate && isBeforeToDate
    })
}

// Atualizar a assinatura da função para aceitar o intervalo de datas como parâmetro
export function useDashboardData(date?: { from?: Date; to?: Date }) {
    // Buscar dados de receitas e despesas
    const { revenues, isLoading: revenuesLoading, isError: revenuesError } = useAllRevenues()
    const { spents, isLoading: spentsLoading, isError: spentsError } = useAllSpents()
    const {
        categories: revenueCategories,
        isLoading: revenueCategoriesLoading,
        isError: revenueCategoriesError,
    } = useRevenueCategories()
    const {
        categories: spentCategories,
        isLoading: spentCategoriesLoading,
        isError: spentCategoriesError,
    } = useSpentCategories()

    // Status de carregamento e erro
    const isLoading = revenuesLoading || spentsLoading || revenueCategoriesLoading || spentCategoriesLoading
    const isError = revenuesError || spentsError || revenueCategoriesError || spentCategoriesError

    // Atualizar o cálculo do resumo financeiro para usar a função de filtro
    const financialSummary = useMemo(() => {
        if (isLoading || isError || !revenues || !spents) {
            return {
                totalRevenues: 0,
                totalExpenses: 0,
                balance: 0,
                pendingRevenues: 0,
                pendingExpenses: 0,
                formattedTotalRevenues: formatCurrency(0),
                formattedTotalExpenses: formatCurrency(0),
                formattedBalance: formatCurrency(0),
                formattedPendingRevenues: formatCurrency(0),
                formattedPendingExpenses: formatCurrency(0),
            }
        }

        // Filtrar dados pelo intervalo de datas selecionado
        const filteredRevenues = filterDataByDateRange(revenues, date)
        const filteredExpenses = filterDataByDateRange(spents, date)

        const totalRevenues = filteredRevenues.reduce((sum, revenue) => sum + revenue.value, 0)
        const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.value, 0)
        const balance = totalRevenues - totalExpenses
        const pendingRevenues = filteredRevenues
            .filter((revenue) => revenue.status === "pendente")
            .reduce((sum, revenue) => sum + revenue.value, 0)
        const pendingExpenses = filteredExpenses
            .filter((expense) => !expense.status)
            .reduce((sum, expense) => sum + expense.value, 0)

        return {
            totalRevenues,
            totalExpenses,
            balance,
            pendingRevenues,
            pendingExpenses,
            formattedTotalRevenues: formatCurrency(totalRevenues),
            formattedTotalExpenses: formatCurrency(totalExpenses),
            formattedBalance: formatCurrency(balance),
            formattedPendingRevenues: formatCurrency(pendingRevenues),
            formattedPendingExpenses: formatCurrency(pendingExpenses),
        }
    }, [revenues, spents, isLoading, isError, date])

    // Atualizar o cálculo dos dados mensais para considerar apenas o intervalo selecionado
    const monthlyData = useMemo(() => {
        if (isLoading || isError || !revenues || !spents) {
            return []
        }

        // Filtrar dados pelo intervalo de datas selecionado
        const filteredRevenues = filterDataByDateRange(revenues, date)
        const filteredExpenses = filterDataByDateRange(spents, date)

        // Criar mapa de meses
        const monthsMap = new Map<string, { revenues: number; expenses: number }>()

        // Função para obter a chave do mês (formato: YYYY-MM)
        const getMonthKey = (date: string | Date) => {
            const dateObj = typeof date === "string" ? new Date(date) : date
            return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`
        }

        // Função para obter o nome do mês (formato: Jan, Fev, etc.)
        const getMonthName = (monthKey: string) => {
            const [year, month] = monthKey.split("-")
            const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1)
            return date.toLocaleDateString("pt-BR", { month: "short" })
        }

        // Processar receitas filtradas
        filteredRevenues.forEach((revenue) => {
            const monthKey = getMonthKey(revenue.date)
            if (!monthsMap.has(monthKey)) {
                monthsMap.set(monthKey, { revenues: 0, expenses: 0 })
            }
            const monthData = monthsMap.get(monthKey)!
            monthData.revenues += revenue.value
        })

        // Processar despesas filtradas
        filteredExpenses.forEach((expense) => {
            const monthKey = getMonthKey(expense.date)
            if (!monthsMap.has(monthKey)) {
                monthsMap.set(monthKey, { revenues: 0, expenses: 0 })
            }
            const monthData = monthsMap.get(monthKey)!
            monthData.expenses += expense.value
        })

        // Converter mapa para array e ordenar por mês
        const result: MonthlyData[] = Array.from(monthsMap.entries())
            .map(([monthKey, data]) => ({
                month: getMonthName(monthKey),
                revenues: data.revenues,
                expenses: data.expenses,
                balance: data.revenues - data.expenses,
            }))
            .sort((a, b) => {
                const monthA = new Date(a.month + " 1, 2000").getMonth()
                const monthB = new Date(b.month + " 1, 2000").getMonth()
                return monthA - monthB
            })

        return result
    }, [revenues, spents, isLoading, isError, date])

    // Atualizar o cálculo da distribuição por categoria para usar os dados filtrados
    const expenseCategoryDistribution = useMemo(() => {
        if (isLoading || isError || !spents || !spentCategories) {
            return []
        }

        // Filtrar despesas pelo intervalo de datas selecionado
        const filteredExpenses = filterDataByDateRange(spents, date)

        // Criar mapa de categorias
        const categoriesMap = new Map<string, { id: string; name: string; value: number }>()

        // Inicializar categorias
        spentCategories.forEach((category) => {
            categoriesMap.set(category.id, { id: category.id, name: category.name, value: 0 })
        })

        // Processar despesas filtradas
        filteredExpenses.forEach((expense) => {
            expense.categories.forEach((category: CategoryData) => {
                if (categoriesMap.has(category.id)) {
                    const categoryData = categoriesMap.get(category.id)!
                    categoryData.value += expense.value / expense.categories.length // Dividir valor entre categorias
                }
            })
        })

        // Calcular total
        const total = Array.from(categoriesMap.values()).reduce((sum, category) => sum + category.value, 0)

        // Converter mapa para array, calcular percentagens e ordenar por valor
        const result: CategoryData[] = Array.from(categoriesMap.values())
            .filter((category) => category.value > 0) // Remover categorias sem despesas
            .map((category, index) => ({
                id: category.id,
                name: category.name,
                value: category.value,
                percentage: total > 0 ? (category.value / total) * 100 : 0,
                color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
            }))
            .sort((a, b) => b.value - a.value)

        return result
    }, [spents, spentCategories, isLoading, isError, date])

    // Atualizar o cálculo da distribuição por categoria para receitas
    const revenueCategoryDistribution = useMemo(() => {
        if (isLoading || isError || !revenues || !revenueCategories) {
            return []
        }

        // Filtrar receitas pelo intervalo de datas selecionado
        const filteredRevenues = filterDataByDateRange(revenues, date)

        // Criar mapa de categorias
        const categoriesMap = new Map<string, { id: string; name: string; value: number }>()

        // Inicializar categorias
        revenueCategories.forEach((category) => {
            categoriesMap.set(category.id, { id: category.id, name: category.name, value: 0 })
        })

        // Processar receitas filtradas
        filteredRevenues.forEach((revenue) => {
            revenue.categories.forEach((category: CategoryData) => {
                if (categoriesMap.has(category.id)) {
                    const categoryData = categoriesMap.get(category.id)!
                    categoryData.value += revenue.value / revenue.categories.length // Dividir valor entre categorias
                }
            })
        })

        // Calcular total
        const total = Array.from(categoriesMap.values()).reduce((sum, category) => sum + category.value, 0)

        // Converter mapa para array, calcular percentagens e ordenar por valor
        const result: CategoryData[] = Array.from(categoriesMap.values())
            .filter((category) => category.value > 0) // Remover categorias sem receitas
            .map((category, index) => ({
                id: category.id,
                name: category.name,
                value: category.value,
                percentage: total > 0 ? (category.value / total) * 100 : 0,
                color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
            }))
            .sort((a, b) => b.value - a.value)

        return result
    }, [revenues, revenueCategories, isLoading, isError, date])

    // Atualizar o cálculo das transações recentes para usar os dados filtrados
    const recentTransactions = useMemo(() => {
        if (isLoading || isError || !revenues || !spents) {
            return []
        }

        // Filtrar dados pelo intervalo de datas selecionado
        const filteredRevenues = filterDataByDateRange(revenues, date)
        const filteredExpenses = filterDataByDateRange(spents, date)

        // Converter receitas para o formato de transação
        const revenueTransactions: RecentTransaction[] = filteredRevenues.map((revenue) => ({
            id: revenue.id,
            name: revenue.name,
            date: revenue.date,
            value: revenue.value,
            type: "revenue",
            category: revenue.categories.length > 0 ? revenue.categories[0].name : "Sem categoria",
            status: revenue.status,
        }))

        // Converter despesas para o formato de transação
        const expenseTransactions: RecentTransaction[] = filteredExpenses.map((expense) => ({
            id: expense.id,
            name: expense.name,
            date: expense.date,
            value: expense.value,
            type: "expense",
            category: expense.categories.length > 0 ? expense.categories[0].name : "Sem categoria",
            status: expense.status ? "pago" : "pendente",
        }))

        // Combinar e ordenar por data (mais recentes primeiro)
        return [...revenueTransactions, ...expenseTransactions]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10) // Limitar a 10 transações
    }, [revenues, spents, isLoading, isError, date])

    return {
        isLoading,
        isError,
        financialSummary,
        monthlyData,
        expenseCategoryDistribution,
        revenueCategoryDistribution,
        recentTransactions,
        date,
    }
}
