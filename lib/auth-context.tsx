"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Tipo de usuário
export interface User {
    id: string
    username: string
    email: string
    password: string
}

// Dados iniciais de usuários
const initialUsers: User[] = [
    {
        id: "1",
        username: "admin",
        email: "admin@example.com",
        password: "admin123",
    },
    {
        id: "2",
        username: "usuario",
        email: "usuario@example.com",
        password: "usuario123",
    },
]

// Contexto de autenticação
interface AuthContextType {
    // Estado
    isAuthenticated: boolean
    currentUser: User | null
    users: User[]

    // Métodos de autenticação
    login: (email: string, password: string) => boolean
    logout: () => void

    // Métodos de gerenciamento de usuários
    addUser: (username: string, email: string, password: string) => void
    updateUser: (id: string, data: Partial<Omit<User, "id">>) => void
    deleteUser: (id: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [users, setUsers] = useState<User[]>(initialUsers)
    const router = useRouter()

    // Verificar se o usuário está autenticado ao carregar a página
    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser")
        if (storedUser) {
            const user = JSON.parse(storedUser)
            setCurrentUser(user)
            setIsAuthenticated(true)
        }
    }, [])

    // Função de login
    const login = (email: string, password: string): boolean => {
        const user = users.find((u) => u.email === email && u.password === password)

        if (user) {
            setCurrentUser(user)
            setIsAuthenticated(true)
            localStorage.setItem("currentUser", JSON.stringify(user))
            return true
        }

        return false
    }

    // Função de logout
    const logout = () => {
        setCurrentUser(null)
        setIsAuthenticated(false)
        localStorage.removeItem("currentUser")
        router.push("/login")
    }

    // Função para adicionar usuário
    const addUser = (username: string, email: string, password: string) => {
        const newUser: User = {
            id: Date.now().toString(),
            username,
            email,
            password,
        }

        setUsers([...users, newUser])
    }

    // Função para atualizar usuário
    const updateUser = (id: string, data: Partial<Omit<User, "id">>) => {
        setUsers(
            users.map((user) => {
                if (user.id === id) {
                    return { ...user, ...data }
                }
                return user
            }),
        )

        // Se o usuário atual foi atualizado, atualizar também o currentUser
        if (currentUser && currentUser.id === id) {
            const updatedUser = { ...currentUser, ...data }
            setCurrentUser(updatedUser)
            localStorage.setItem("currentUser", JSON.stringify(updatedUser))
        }
    }

    // Função para excluir usuário
    const deleteUser = (id: string) => {
        // Não permitir excluir o próprio usuário logado
        if (currentUser && currentUser.id === id) {
            alert("Você não pode excluir seu próprio usuário enquanto estiver logado.")
            return
        }

        setUsers(users.filter((user) => user.id !== id))
    }

    // Valor do contexto
    const value: AuthContextType = {
        isAuthenticated,
        currentUser,
        users,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook para usar o contexto
export function useAuth() {
    const context = useContext(AuthContext)

    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }

    return context
}
