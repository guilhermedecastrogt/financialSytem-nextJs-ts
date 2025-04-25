import useSWR from "swr"

// Interface para as categorias de receitas
export interface Category {
    id: string
    name: string
    slug: string
    createdAt: string
    updatedAt: string
}

// Interface para as receitas
export interface Revenue {
    id: string
    name: string
    createdAt: string
    date: string | Date
    value: number
    status: "pago" | "pendente"
    description?: string
    updatedAt: string
    categories: Category[]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useAllRevenues() {
    const {
        data: revenue,
        error: revenueError,
        isLoading: loadingRevenue,
    } = useSWR<Revenue[]>("/api/revenues/revenue", fetcher)
    const {
        data: monthlyRevenue,
        error: monthlyError,
        isLoading: loadingMonthly,
    } = useSWR<Revenue[]>("/api/revenues/monthlyRevenue", fetcher)

    const all = [...(revenue || []), ...(monthlyRevenue || [])]
    const isLoading = loadingRevenue || loadingMonthly
    const isError = revenueError || monthlyError

    return {
        revenues: all,
        isLoading,
        isError,
    }
}