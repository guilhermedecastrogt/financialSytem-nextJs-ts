import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useAllSpents() {
    const { data: spent, isLoading: loadingSpent } = useSWR("/api/spents/spent", fetcher)
    const { data: monthlySpent, isLoading: loadingMonthly } = useSWR("/api/spents/monthlySpent", fetcher)
    const { data: annualSpent, isLoading: loadingAnnual } = useSWR("/api/spents/annualSpent", fetcher)

    const all = [...(spent || []), ...(monthlySpent || []), ...(annualSpent || [])]
    const isLoading = loadingSpent || loadingMonthly || loadingAnnual

    return { spents: all, isLoading }
}