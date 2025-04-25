import useSWR from "swr"

export interface Category {
    id: string
    name: string
    slug: string
    createdAt: string
    updatedAt: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useRevenueCategories() {
    const { data, error, isLoading } = useSWR<Category[]>("/api/revenues/category", fetcher)

    return {
        categories: data || [],
        isLoading,
        isError: error,
    }
}
