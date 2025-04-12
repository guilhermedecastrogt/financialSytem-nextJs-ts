"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Home,
  Menu,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  X,
  Tag,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/",
      active: pathname === "/",
    },
    {
      label: "Receitas",
      icon: TrendingUp,
      href: "/receitas",
      active: pathname.includes("/receitas"),
    },
    {
      label: "Despesas",
      icon: TrendingDown,
      href: "/despesas",
      active: pathname.includes("/despesas"),
    },
    {
      label: "Categorias",
      icon: Tag,
      href: "/categorias",
      active: pathname.includes("/categorias"),
    },
    {
      label: "Relatórios",
      icon: BarChart3,
      href: "/relatorios",
      active: pathname.includes("/relatorios"),
    },
    {
      label: "Configurações",
      icon: Settings,
      href: "/configuracoes",
      active: pathname.includes("/configuracoes"),
    },
  ]

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized)
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 lg:hidden">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transform border-r bg-background transition-all duration-300 ease-in-out lg:flex lg:flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isMinimized ? "lg:w-20" : "w-64",
        )}
      >
        <div className="flex h-full flex-col">
          <div
            className={cn("flex items-center border-b px-6 py-4", isMinimized ? "justify-center" : "justify-between")}
          >
            <Link href="/" className={cn("flex items-center gap-2 font-semibold", isMinimized && "justify-center")}>
              <BarChart3 className="h-6 w-6 text-primary" />
              {!isMinimized && <span>Sistema Financeiro</span>}
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="lg:hidden">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <nav className="grid gap-1 px-2">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    route.active ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-muted",
                    isMinimized && "justify-center px-0",
                  )}
                  title={isMinimized ? route.label : undefined}
                >
                  <route.icon className={cn("h-5 w-5", route.active && "text-primary")} />
                  {!isMinimized && route.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="border-t p-4">
            {!isMinimized ? (
              <>
                <div className="flex items-center justify-between">
                  <Button variant="default" size="sm" className="w-full" asChild>
                    <Link href="/nova-transacao">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Nova Transação
                    </Link>
                  </Button>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <ThemeToggle />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleMinimized}
                    className="ml-2 text-primary hover:text-primary hover:bg-primary/10 hover:border-primary/20"
                    title="Minimizar menu"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <Button variant="default" size="icon" asChild title="Nova Transação">
                  <Link href="/nova-transacao">
                    <PlusCircle className="h-4 w-4" />
                  </Link>
                </Button>
                <ThemeToggle />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMinimized}
                  className="text-primary hover:text-primary hover:bg-primary/10 hover:border-primary/20"
                  title="Expandir menu"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

