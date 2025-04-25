import useSWR from "swr"

export interface Category {
    id: string
    name: string
    slug: string
    createdAt: string
    updatedAt: string
}

export interface Spent {
    id: string
    name: string
    createdAt: string
    date: string | Date
    value: number
    status: boolean
    description?: string
    updatedAt: string
    categories: Category[]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useAllSpents() {
    const { data: spent, error: spentError, isLoading: loadingSpent } = useSWR<Spent[]>("/api/spents/spent", fetcher)
    const {
        data: monthlySpent,
        error: monthlyError,
        isLoading: loadingMonthly,
    } = useSWR<Spent[]>("/api/spents/monthlySpent", fetcher)
    const {
        data: annualSpent,
        error: annualError,
        isLoading: loadingAnnual,
    } = useSWR<Spent[]>("/api/spents/annualSpent", fetcher)

    const all = [...(spent || []), ...(monthlySpent || []), ...(annualSpent || [])]
    const isLoading = loadingSpent || loadingMonthly || loadingAnnual
    const isError = spentError || monthlyError || annualError

    return {
        spents: all,
        isLoading,
        isError,
    }
}