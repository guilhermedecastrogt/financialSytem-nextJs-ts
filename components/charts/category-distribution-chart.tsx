"use client"

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useEffect, useState } from "react"

const data = [
  { name: "Alimentação", value: 2500 },
  { name: "Moradia", value: 1800 },
  { name: "Transporte", value: 1200 },
  { name: "Lazer", value: 950 },
  { name: "Saúde", value: 850 },
  { name: "Outros", value: 1200 },
]

const COLORS = ["#3cdaa1", "#22c55e", "#ef4444", "#f59e0b", "#8b5cf6", "#64748b"]

export function CategoryDistributionChart() {
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
      <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={isMobile ? 60 : 80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) =>
            isMobile ? `${(percent * 100).toFixed(0)}%` : `${name} ${(percent * 100).toFixed(0)}%`
          }
          labelStyle={{ fontSize: isMobile ? 10 : 12 }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) =>
            new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(Number(value))
          }
          contentStyle={{ fontSize: isMobile ? 10 : 12 }}
        />
        <Legend
          layout={isMobile ? "horizontal" : "vertical"}
          verticalAlign={isMobile ? "bottom" : "middle"}
          align={isMobile ? "center" : "right"}
          wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

