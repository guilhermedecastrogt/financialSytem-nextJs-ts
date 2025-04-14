"use client"

import React, {useEffect} from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
//import { useData } from "@/lib/data-context"

type RevenueCategory = {
  name: string
  id: string
}

type SpentCategory = {
  name: string
  id: string
}

export function NewTransactionPage() {
  const router = useRouter()
  /*const {
    revenueCategories,
    spentCategories,
    addRevenue,
    addMonthlyRevenue,
    addSpent,
    addMonthlySpent,
    addAnnualSpent,
  } = useData()*/

  const [transactionType, setTransactionType] = useState("revenue")
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [description, setDescription] = useState("")
  const [recurrenceType, setRecurrenceType] = useState("single")
  const [installments, setInstallments] = useState("1")
  const [status, setStatus] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [openCategorySelect, setOpenCategorySelect] = useState(false)
  const [revenueCategories, setRevenueCategories] = useState<RevenueCategory[]>([])
  const [spentCategories, setSpentCategories] = useState<SpentCategory[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData(){
    try{
      const revenueCategories = await fetch("/api/revenues/category")
      const spentCategories = await fetch("/api/spents/category")

      if(!revenueCategories /*|| !spentCategories*/){
        throw new Error("Revenue category or spent category not found")
      }
      setRevenueCategories(await revenueCategories.json())
      setSpentCategories(await spentCategories.json())
    }
    catch(error){
      console.log("erro ao carregar dados", error)
      alert("Erro ao carregar dados")
    }
  }

  const categories = transactionType === "revenue" ? revenueCategories : spentCategories

  const handleCategorySelect = (value: string) => {
    setSelectedCategories((current) => {
      if (current.includes(value)) {
        return current.filter((item) => item !== value)
      } else {
        return [...current, value]
      }
    })
  }

  async function handleSubmit(e: React.FormEvent)  {
    e.preventDefault()

    const value = Number.parseFloat(amount.replace(",", "."))

    if (transactionType === "revenue") {
      if (recurrenceType === "single") {
        const revenue = {
          name,
          date: date ? new Date(date).toISOString() : new Date().toISOString(),
          value,
          status: status ? "pago" : "pendente",
          description,
          categories: {
            connect: selectedCategories.map(id => ({ id }))
          },
        }
        const res = await fetch("/api/revenues/revenue", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(revenue),
        })
        if(!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || "Erro ao criar transação")
        }
      } else {
        const addMonthlyRevenue = {
          name,
          date: date ? new Date(date).toISOString() : new Date().toISOString(),
          value,
          installmentNumber: Number.parseInt(installments),
          status,
          description,
          categories: {
            connect: selectedCategories.map(id => ({ id }))
          },
        }
        const res = await fetch("/api/revenues/monthlyRevenue", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(addMonthlyRevenue),
        })
        if(!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || "Erro ao criar transação")
        }
      }
    } else {
      if (recurrenceType === "single") {
        const addSpent = {
          name,
          date: date ? new Date(date).toISOString() : new Date().toISOString(),
          value,
          status,
          description,
          categories: {
            connect: selectedCategories.map(id => ({ id }))
          }
        }
        const res = await fetch("/api/spents/spent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(addSpent)
        })
        if(!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || "Erro ao criar despesa")
        }
      } else if (recurrenceType === "monthly") {
        const addMonthlySpent = {
          name,
          date: date ? new Date(date).toISOString() : new Date().toISOString(),
          value,
          installmentNumber: Number.parseInt(installments),
          status,
          description,
          categories: {
            connect: selectedCategories.map(id => ({ id }))
          },
        }
        const res = await fetch("/api/spents/monthlySpent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(addMonthlySpent)
        })
        if(!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || "Erro ao criar despesa")
        }
      } else {
        const addAnnualSpent = {
          name,
          date: date ? new Date(date).toISOString() : new Date().toISOString(),
          value,
          status,
          description,
          categories: selectedCategories,
        }
        const res = await fetch("/api/spents/annualSpent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(addAnnualSpent)
        })
        if(!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || "Erro ao criar despesa")
        }
      }
    }
    alert("Transação realizada com sucesso!")
    router.push(transactionType === "revenue" ? "/receitas" : "/despesas")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Nova Transação</h1>
        <p className="text-muted-foreground">Adicione uma nova receita ou despesa ao sistema</p>
      </div>

      <Tabs defaultValue="revenue" value={transactionType} onValueChange={setTransactionType}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="expense">Despesa</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Nova Receita</CardTitle>
                <CardDescription>Adicione uma nova receita ao sistema financeiro.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Salário, Freelance, etc."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <Input
                    id="amount"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => {
                      // Permitir apenas números e vírgula
                      const value = e.target.value.replace(/[^0-9,]/g, "")
                      setAmount(value)
                    }}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Data</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={ptBR} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label>Categorias</Label>
                  <Popover open={openCategorySelect} onOpenChange={setOpenCategorySelect}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCategorySelect}
                        className="w-full justify-between"
                      >
                        {selectedCategories.length > 0
                          ? `${selectedCategories.length} categorias selecionadas`
                          : "Selecione as categorias"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Buscar categoria..." />
                        <CommandList>
                          <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                          <CommandGroup>
                            {categories.map((category) => (
                              <CommandItem
                                key={category.id}
                                value={category.id}
                                onSelect={() => handleCategorySelect(category.id)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedCategories.includes(category.id) ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {category.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label>Tipo de Recorrência</Label>
                  <RadioGroup
                    value={recurrenceType}
                    onValueChange={setRecurrenceType}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="single" />
                      <Label htmlFor="single">Receita Única</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly">Receita Mensal</Label>
                    </div>
                  </RadioGroup>
                </div>
                {recurrenceType === "monthly" && (
                  <div className="grid gap-2">
                    <Label htmlFor="installments">Número de Parcelas</Label>
                    <Input
                      id="installments"
                      type="number"
                      min="1"
                      value={installments}
                      onChange={(e) => setInstallments(e.target.value)}
                    />
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Switch id="status" checked={status} onCheckedChange={setStatus} />
                  <Label htmlFor="status">Receita já recebida</Label>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Adicione detalhes sobre esta receita"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Receita</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="expense">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Nova Despesa</CardTitle>
                <CardDescription>Adicione uma nova despesa ao sistema financeiro.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Aluguel, Supermercado, etc."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <Input
                    id="amount"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => {
                      // Permitir apenas números e vírgula
                      const value = e.target.value.replace(/[^0-9,]/g, "")
                      setAmount(value)
                    }}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Data</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={ptBR} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label>Categorias</Label>
                  <Popover open={openCategorySelect} onOpenChange={setOpenCategorySelect}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCategorySelect}
                        className="w-full justify-between"
                      >
                        {selectedCategories.length > 0
                          ? `${selectedCategories.length} categorias selecionadas`
                          : "Selecione as categorias"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Buscar categoria..." />
                        <CommandList>
                          <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                          <CommandGroup>
                            {categories.map((category) => (
                              <CommandItem
                                key={category.id}
                                value={category.id}
                                onSelect={() => handleCategorySelect(category.id)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedCategories.includes(category.id) ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {category.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label>Tipo de Recorrência</Label>
                  <RadioGroup
                    value={recurrenceType}
                    onValueChange={setRecurrenceType}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="single-expense" />
                      <Label htmlFor="single-expense">Despesa Única</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly-expense" />
                      <Label htmlFor="monthly-expense">Despesa Mensal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="annual" id="annual-expense" />
                      <Label htmlFor="annual-expense">Despesa Anual</Label>
                    </div>
                  </RadioGroup>
                </div>
                {recurrenceType === "monthly" && (
                  <div className="grid gap-2">
                    <Label htmlFor="installments-expense">Número de Parcelas</Label>
                    <Input
                      id="installments-expense"
                      type="number"
                      min="1"
                      value={installments}
                      onChange={(e) => setInstallments(e.target.value)}
                    />
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Switch id="status-expense" checked={status} onCheckedChange={setStatus} />
                  <Label htmlFor="status-expense">Despesa já paga</Label>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description-expense">Descrição (opcional)</Label>
                  <Textarea
                    id="description-expense"
                    placeholder="Adicione detalhes sobre esta despesa"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Despesa</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

