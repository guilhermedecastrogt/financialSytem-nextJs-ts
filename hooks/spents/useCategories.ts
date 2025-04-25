import useSWR from "swr"

export interface Category {
    id: string
    name: string
    slug: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useCategories() {
    const { data, error, isLoading } = useSWR<Category[]>("/api/spents/category", fetcher)

    return {
        categories: data || [],
        isLoading,
        isError: error
    }
}
