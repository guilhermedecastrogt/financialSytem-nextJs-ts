"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"

const data = [
  {
    name: "Jan",
    receitas: 12000,
    despesas: 8000,
  },
  {
    name: "Fev",
    receitas: 11000,
    despesas: 7500,
  },
  {
    name: "Mar",
    receitas: 13000,
    despesas: 9000,
  },
  {
    name: "Abr",
    receitas: 12500,
    despesas: 8200,
  },
  {
    name: "Mai",
    receitas: 14000,
    despesas: 8500,
  },
  {
    name: "Jun",
    receitas: 15000,
    despesas: 9500,
  },
]

export function RevenueExpenseChart() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    // Verificar inicialmente
    checkMobile()

    // Adicionar listener para redimensionamento
    window.addEventListener("resize", checkMobile)

    // Limpar listener
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: isMobile ? 0 : 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={!isMobile} />
        <XAxis dataKey="name" tick={{ fontSize: isMobile ? 10 : 12 }} tickMargin={isMobile ? 5 : 10} />
        <YAxis
          tickFormatter={(value) =>
            new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
              notation: "compact",
              compactDisplay: "short",
            }).format(value)
          }
          tick={{ fontSize: isMobile ? 10 : 12 }}
          width={isMobile ? 50 : 80}
        />
        <Tooltip
          formatter={(value) =>
            new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(Number(value))
          }
          contentStyle={{ fontSize: isMobile ? 10 : 12 }}
        />
        <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12, paddingTop: isMobile ? 5 : 10 }} />
        <Bar dataKey="receitas" name="Receitas" fill="#3cdaa1" radius={[4, 4, 0, 0]} />
        <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

