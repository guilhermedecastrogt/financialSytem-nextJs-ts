import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const spents = await prisma.spent.findMany({
      include: {
        categories: true,
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(spents)
  } catch (error) {
    console.error("Erro ao buscar despesas:", error)
    return NextResponse.json({ error: "Erro ao buscar despesas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, date, value, status, description, categories } = data

    if (!name || !date || value === undefined || !categories) {
      return NextResponse.json({ error: "Nome, data, valor e categorias são obrigatórios" }, { status: 400 })
    }

    const spent = await prisma.spent.create({
      data: {
        name,
        date: new Date(date),
        value: Number.parseFloat(value.toString()),
        status,
        description,
        categories: {
          connect: categories.map((id: string) => ({ id })),
        },
      },
      include: {
        categories: true,
      },
    })

    return NextResponse.json(spent)
  } catch (error) {
    console.error("Erro ao criar despesa:", error)
    return NextResponse.json({ error: "Erro ao criar despesa" }, { status: 500 })
  }
}

