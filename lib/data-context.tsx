"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

// Tipos de dados
export interface Category {
  id: string
  name: string
  slug: string
}

export interface Revenue {
  id: string
  name: string
  createdAt: Date
  date: Date
  value: number
  status: "pago" | "pendente"
  description?: string
  categories: string[] // IDs das categorias
}

export interface MonthlyRevenue {
  id: string
  name: string
  createdAt: Date
  date: Date
  value: number
  installmentNumber: number
  status: boolean
  description?: string
  categories: string[] // IDs das categorias
}

export interface Spent {
  id: string
  name: string
  createdAt: Date
  date: Date
  value: number
  status: boolean
  description?: string
  categories: string[] // IDs das categorias
}

export interface MonthlySpent {
  id: string
  name: string
  createdAt: Date
  date: Date
  value: number
  installmentNumber: number
  status: boolean
  description?: string
  categories: string[] // IDs das categorias
}

export interface AnnualSpent {
  id: string
  name: string
  createdAt: Date
  date: Date
  value: number
  status: boolean
  description?: string
  categories: string[] // IDs das categorias
}

// Dados iniciais
const initialRevenueCategories: Category[] = [
  { id: "1", name: "Salário", slug: "salario" },
  { id: "2", name: "Investimentos", slug: "investimentos" },
  { id: "3", name: "Freelance", slug: "freelance" },
  { id: "4", name: "Vendas", slug: "vendas" },
  { id: "5", name: "Imóveis", slug: "imoveis" },
]

const initialSpentCategories: Category[] = [
  { id: "1", name: "Alimentação", slug: "alimentacao" },
  { id: "2", name: "Moradia", slug: "moradia" },
  { id: "3", name: "Transporte", slug: "transporte" },
  { id: "4", name: "Lazer", slug: "lazer" },
  { id: "5", name: "Saúde", slug: "saude" },
  { id: "6", name: "Educação", slug: "educacao" },
  { id: "7", name: "Serviços", slug: "servicos" },
]

const initialRevenues: Revenue[] = [
  {
    id: "1",
    name: "Salário",
    createdAt: new Date(2023, 5, 1),
    date: new Date(2023, 5, 5),
    value: 5000,
    status: "pago",
    categories: ["1"],
  },
  {
    id: "2",
    name: "Freelance",
    createdAt: new Date(2023, 5, 8),
    date: new Date(2023, 5, 10),
    value: 1500,
    status: "pago",
    categories: ["3", "4"],
  },
  {
    id: "3",
    name: "Dividendos",
    createdAt: new Date(2023, 5, 12),
    date: new Date(2023, 5, 15),
    value: 800,
    status: "pago",
    categories: ["2"],
  },
  {
    id: "4",
    name: "Venda de produtos",
    createdAt: new Date(2023, 5, 18),
    date: new Date(2023, 5, 20),
    value: 1200,
    status: "pendente",
    categories: ["4"],
  },
  {
    id: "5",
    name: "Aluguel de imóvel",
    createdAt: new Date(2023, 5, 22),
    date: new Date(2023, 5, 25),
    value: 2000,
    status: "pendente",
    categories: ["5", "2"],
  },
]

const initialMonthlyRevenues: MonthlyRevenue[] = []

const initialSpents: Spent[] = [
  {
    id: "1",
    name: "Aluguel",
    createdAt: new Date(2023, 5, 1),
    date: new Date(2023, 5, 5),
    value: 1200,
    status: true,
    categories: ["2"],
  },
  {
    id: "2",
    name: "Supermercado",
    createdAt: new Date(2023, 5, 8),
    date: new Date(2023, 5, 10),
    value: 450,
    status: true,
    categories: ["1"],
  },
  {
    id: "3",
    name: "Internet",
    createdAt: new Date(2023, 5, 12),
    date: new Date(2023, 5, 15),
    value: 120,
    status: true,
    categories: ["7", "3"],
  },
  {
    id: "4",
    name: "Seguro do carro",
    createdAt: new Date(2023, 5, 18),
    date: new Date(2023, 5, 20),
    value: 300,
    status: false,
    categories: ["3"],
  },
  {
    id: "5",
    name: "Restaurante",
    createdAt: new Date(2023, 5, 22),
    date: new Date(2023, 5, 25),
    value: 180,
    status: false,
    categories: ["1", "4"],
  },
]

const initialMonthlySpents: MonthlySpent[] = []
const initialAnnualSpents: AnnualSpent[] = []

// Contexto de dados
interface DataContextType {
  // Dados
  revenueCategories: Category[]
  spentCategories: Category[]
  revenues: Revenue[]
  monthlyRevenues: MonthlyRevenue[]
  spents: Spent[]
  monthlySpents: MonthlySpent[]
  annualSpents: AnnualSpent[]
  loading: boolean

  // Métodos para categorias
  addRevenueCategory: (name: string) => Promise<void>
  updateRevenueCategory: (id: string, name: string) => Promise<void>
  deleteRevenueCategory: (id: string) => Promise<void>
  addSpentCategory: (name: string) => Promise<void>
  updateSpentCategory: (id: string, name: string) => Promise<void>
  deleteSpentCategory: (id: string) => Promise<void>

  // Métodos para receitas
  addRevenue: (revenue: Omit<Revenue, "id" | "createdAt">) => Promise<void>
  updateRevenue: (id: string, revenue: Partial<Omit<Revenue, "id" | "createdAt">>) => Promise<void>
  deleteRevenue: (id: string) => Promise<void>
  addMonthlyRevenue: (revenue: Omit<MonthlyRevenue, "id" | "createdAt">) => Promise<void>
  updateMonthlyRevenue: (id: string, revenue: Partial<Omit<MonthlyRevenue, "id" | "createdAt">>) => Promise<void>
  deleteMonthlyRevenue: (id: string) => Promise<void>

  // Métodos para despesas
  addSpent: (spent: Omit<Spent, "id" | "createdAt">) => Promise<void>
  updateSpent: (id: string, spent: Partial<Omit<Spent, "id" | "createdAt">>) => Promise<void>
  deleteSpent: (id: string) => Promise<void>
  addMonthlySpent: (spent: Omit<MonthlySpent, "id" | "createdAt">) => Promise<void>
  updateMonthlySpent: (id: string, spent: Partial<Omit<MonthlySpent, "id" | "createdAt">>) => Promise<void>
  deleteMonthlySpent: (id: string) => Promise<void>
  addAnnualSpent: (spent: Omit<AnnualSpent, "id" | "createdAt">) => Promise<void>
  updateAnnualSpent: (id: string, spent: Partial<Omit<AnnualSpent, "id" | "createdAt">>) => Promise<void>
  deleteAnnualSpent: (id: string) => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  // Estados para armazenar os dados
  const [revenueCategories, setRevenueCategories] = useState<Category[]>(initialRevenueCategories)
  const [spentCategories, setSpentCategories] = useState<Category[]>(initialSpentCategories)
  const [revenues, setRevenues] = useState<Revenue[]>(initialRevenues)
  const [monthlyRevenues, setMonthlyRevenues] = useState<MonthlyRevenue[]>(initialMonthlyRevenues)
  const [spents, setSpents] = useState<Spent[]>(initialSpents)
  const [monthlySpents, setMonthlySpents] = useState<MonthlySpent[]>(initialMonthlySpents)
  const [annualSpents, setAnnualSpents] = useState<AnnualSpent[]>(initialAnnualSpents)
  const [loading, setLoading] = useState(true)

  // Carregar dados iniciais do banco de dados
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true)

        // Aqui você faria chamadas para carregar os dados do banco via API
        // Por exemplo:
        // const revenueCategoriesResponse = await fetch('/api/revenue-categories')
        // const revenueCategoriesData = await revenueCategoriesResponse.json()
        // setRevenueCategories(revenueCategoriesData)

        // Por enquanto, vamos manter os dados iniciais
        // Mas em uma implementação real, você carregaria do banco
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error)
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // Métodos para categorias de receitas
  const addRevenueCategory = async (name: string) => {
    try {
      const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, "-")

      // Em uma implementação real, você faria uma chamada API
      // const response = await fetch('/api/revenue-categories', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, slug })
      // })
      // const newCategory = await response.json()

      // Por enquanto, simulamos a criação
      const newCategory: Category = {
        id: uuidv4(),
        name,
        slug,
      }

      setRevenueCategories([...revenueCategories, newCategory])
    } catch (error) {
      console.error("Erro ao adicionar categoria de receita:", error)
      throw error
    }
  }

  const updateRevenueCategory = async (id: string, name: string) => {
    try {
      const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, "-")

      // Em uma implementação real, você faria uma chamada API
      // await fetch(`/api/revenue-categories/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, slug })
      // })

      setRevenueCategories(
        revenueCategories.map((category) => (category.id === id ? { ...category, name, slug } : category)),
      )
    } catch (error) {
      console.error("Erro ao atualizar categoria de receita:", error)
      throw error
    }
  }

  const deleteRevenueCategory = async (id: string) => {
    try {
      // Em uma implementação real, você faria uma chamada API
      // await fetch(`/api/revenue-categories/${id}`, {
      //   method: 'DELETE'
      // })

      setRevenueCategories(revenueCategories.filter((category) => category.id !== id))
    } catch (error) {
      console.error("Erro ao excluir categoria de receita:", error)
      throw error
    }
  }

  // Métodos para categorias de despesas
  const addSpentCategory = async (name: string) => {
    try {
      const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, "-")

      // Em uma implementação real, você faria uma chamada API
      // const response = await fetch('/api/spent-categories', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, slug })
      // })
      // const newCategory = await response.json()

      const newCategory: Category = {
        id: uuidv4(),
        name,
        slug,
      }

      setSpentCategories([...spentCategories, newCategory])
    } catch (error) {
      console.error("Erro ao adicionar categoria de despesa:", error)
      throw error
    }
  }

  const updateSpentCategory = async (id: string, name: string) => {
    try {
      const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, "-")

      // Em uma implementação real, você faria uma chamada API
      // await fetch(`/api/spent-categories/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, slug })
      // })

      setSpentCategories(
        spentCategories.map((category) => (category.id === id ? { ...category, name, slug } : category)),
      )
    } catch (error) {
      console.error("Erro ao atualizar categoria de despesa:", error)
      throw error
    }
  }

  const deleteSpentCategory = async (id: string) => {
    try {
      // Em uma implementação real, você faria uma chamada API
      // await fetch(`/api/spent-categories/${id}`, {
      //   method: 'DELETE'
      // })

      setSpentCategories(spentCategories.filter((category) => category.id !== id))
    } catch (error) {
      console.error("Erro ao excluir categoria de despesa:", error)
      throw error
    }
  }

  // Métodos para receitas
  const addRevenue = async (revenue: Omit<Revenue, "id" | "createdAt">) => {
    try {
      // Em uma implementação real, você faria uma chamada API
      // const response = await fetch('/api/revenues', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(revenue)
      // })
      // const newRevenue = await response.json()

      const newRevenue: Revenue = {
        id: uuidv4(),
        createdAt: new Date(),
        ...revenue,
      }

      setRevenues([...revenues, newRevenue])
    } catch (error) {
      console.error("Erro ao adicionar receita:", error)
      throw error
    }
  }

  const updateRevenue = async (id: string, revenue: Partial<Omit<Revenue, "id" | "createdAt">>) => {
    try {
      // Em uma implementação real, você faria uma chamada API
      // await fetch(`/api/revenues/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(revenue)
      // })

      setRevenues(revenues.map((item) => (item.id === id ? { ...item, ...revenue } : item)))
    } catch (error) {
      console.error("Erro ao atualizar receita:", error)
      throw error
    }
  }

  const deleteRevenue = async (id: string) => {
    try {
      // Em uma implementação real, você faria uma chamada API
      // await fetch(`/api/revenues/${id}`, {
      //   method: 'DELETE'
      // })

      setRevenues(revenues.filter((revenue) => revenue.id !== id))
    } catch (error) {
      console.error("Erro ao excluir receita:", error)
      throw error
    }
  }

  // Métodos para receitas mensais
  const addMonthlyRevenue = async (revenue: Omit<MonthlyRevenue, "id" | "createdAt">) => {
    try {
      // Em uma implementação real, você faria uma chamada API
      // const response = await fetch('/api/monthly-revenues', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(revenue)
      // })
      // const newRevenue = await response.json()

      const newRevenue: MonthlyRevenue = {
        id: uuidv4(),
        createdAt: new Date(),
        ...revenue,
      }

      setMonthlyRevenues([...monthlyRevenues, newRevenue])
    } catch (error) {
      console.error("Erro ao adicionar receita mensal:", error)
      throw error
    }
  }

  const updateMonthlyRevenue = async (id: string, revenue: Partial<Omit<MonthlyRevenue, "id" | "createdAt">>) => {
    try {
      // Em uma implementação real, você faria uma chamada API
      // await fetch(`/api/monthly-revenues/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(revenue)
      // })

      setMonthlyRevenues(monthlyRevenues.map((item) => (item.id === id ? { ...item, ...revenue } : item)))
    } catch (error) {
      console.error("Erro ao atualizar receita mensal:", error)
      throw error
    }
  }

  const deleteMonthlyRevenue = async (id: string) => {
    try {
      // Em uma implementação real, você faria uma chamada API
      // await fetch(`/api/monthly-revenues/${id}`, {
      //   method: 'DELETE'
      // })

      setMonthlyRevenues(monthlyRevenues.filter((revenue) => revenue.id !== id))
    } catch (error) {
      console.error("Erro ao excluir receita mensal:", error)
      throw error
    }
  }

  // Métodos para despesas
  const addSpent = async (spent: Omit<Spent, "id" | "createdAt">) => {
    try {
      // Em uma implementação real, você faria uma chamada API
      // const response = await fetch('/api/spents', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(spent)
      // })
      // const newSpent = await response.json()

      const newSpent: Spent = {
        id: uuidv4(),
        createdAt: new Date(),
        ...spent,
      }

      setSpents([...spents, newSpent])
    } catch (error) {
      console.error("Erro ao adicionar despesa:", error)
      throw error
    }
  }

  const updateSpent = async (id: string, spent: Partial<Omit<Spent, "id" | "createdAt">>) => {
    try {
      // Em uma implementação real, você faria uma chamada API
      // await fetch(`/api/spents/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(spent)
      // })

      setSpents(spents.map((item) => (item.id === id ? { ...item, ...spent } : item)))
    } catch (error) {
      console.error("Erro ao atualizar despesa:", error)
      throw error
    }
  }

  const deleteSpent = async (id: string) => {
    try {
      // Em uma implementação real, você faria uma chamada API
      // await fetch(`/api/spents/${id}`, {
      //   method: 'DELETE'
      // })

      setSpents(spents.filter((spent) => spent.id !== id))
    } catch (error) {
      console.error("Erro ao excluir despesa:", error)
      throw error
    }
  }

  // Métodos para despesas mensais
  const addMonthlySpent = async (spent: Omit<MonthlySpent, "id" | "createdAt">) => {
    try {
      // Em uma implementação real, você faria uma chamada API
      // const response = await fetch('/api/monthly-spents', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(spent)
      // })
      // const newSpent = await response.json()

      const newSpent: MonthlySpent = {
        id: uuidv4(),
        createdAt: new Date(),
        ...spent,
      }

      setMonthlySpents([...monthlySpents, newSpent])
    } catch (error) {
      console.error("Erro ao adicionar despesa mensal:", error)
      throw error
    }
  }

  const updateMonthlySpent = async (id: string, spent: Partial<Omit<MonthlySpent, "id" | "createdAt">>) => {
    try {
      // Em uma implementação real, você faria uma chamada API
      // await fetch(`/api/monthly-spents/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(spent)
      // })

      setMonthlySpents(monthlySpents.map((item) => (item.id === id ? { ...item, ...spent } : item)))
    } catch (error) {
      console.error("Erro ao atualizar despesa mensal:", error)
      throw error
    }
  }

  const deleteMonthlySpent = async (id: string) => {
    try {
      // Em uma implementação real, você faria uma chamada API
      // await fetch(`/api/monthly-spents/${id}`, {
      //   method: 'DELETE'
      // })

      setMonthlySpents(monthlySpents.filter((spent) => spent.id !== id))
    } catch (error) {
      console.error("Erro ao excluir despesa mensal:", error)
      throw error
    }
  }

  // Métodos para despesas anuais
  const addAnnualSpent = async (spent: Omit<AnnualSpent, "id" | "createdAt">) => {
    try {
      // Em uma implementação real, você faria uma chamada API
      // const response = await fetch('/api/annual-spents', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(spent)
      // })
      // const newSpent = await response.json()

      const newSpent: AnnualSpent = {
        id: uuidv4(),
        createdAt: new Date(),
        ...spent,
      }

      setAnnualSpents([...annualSpents, newSpent])
    } catch (error) {
      console.error("Erro ao adicionar despesa anual:", error)
      throw error
    }
  }

  const updateAnnualSpent = async (id: string, spent: Partial<Omit<AnnualSpent, "id" | "createdAt">>) => {
    try {
      // Em uma implementação real, você faria uma chamada API
      // await fetch(`/api/annual-spents/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(spent)
      // })

      setAnnualSpents(annualSpents.map((item) => (item.id === id ? { ...item, ...spent } : item)))
    } catch (error) {
      console.error("Erro ao atualizar despesa anual:", error)
      throw error
    }
  }

  const deleteAnnualSpent = async (id: string) => {
    try {
      // Em uma implementação real, você faria uma chamada API
      // await fetch(`/api/annual-spents/${id}`, {
      //   method: 'DELETE'
      // })

      setAnnualSpents(annualSpents.filter((spent) => spent.id !== id))
    } catch (error) {
      console.error("Erro ao excluir despesa anual:", error)
      throw error
    }
  }

  // Valor do contexto
  const value: DataContextType = {
    revenueCategories,
    spentCategories,
    revenues,
    monthlyRevenues,
    spents,
    monthlySpents,
    annualSpents,
    loading,
    addRevenueCategory,
    updateRevenueCategory,
    deleteRevenueCategory,
    addSpentCategory,
    updateSpentCategory,
    deleteSpentCategory,
    addRevenue,
    updateRevenue,
    deleteRevenue,
    addMonthlyRevenue,
    updateMonthlyRevenue,
    deleteMonthlyRevenue,
    addSpent,
    updateSpent,
    deleteSpent,
    addMonthlySpent,
    updateMonthlySpent,
    deleteMonthlySpent,
    addAnnualSpent,
    updateAnnualSpent,
    deleteAnnualSpent,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// Hook para usar o contexto
export function useData() {
  const context = useContext(DataContext)

  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }

  return context
}

