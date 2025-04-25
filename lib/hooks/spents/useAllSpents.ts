import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useAllSpents() {
    const { data: spent, error: spentError, isLoading: loadingSpent } = useSWR("/api/spents/spent", fetcher)
    const {
        data: monthlySpent,
        error: monthlyError,
        isLoading: loadingMonthly,
    } = useSWR("/api/spents/monthlySpent", fetcher)
    const { data: annualSpent, error: annualError, isLoading: loadingAnnual } = useSWR("/api/spents/annualSpent", fetcher)

    const all = [...(spent || []), ...(monthlySpent || []), ...(annualSpent || [])]
    const isLoading = loadingSpent || loadingMonthly || loadingAnnual
    const isError = spentError || monthlyError || annualError

    return {
        spents: all,
        isLoading,
        isError,
    }
}