import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { slugify } from "@/lib/utils"

export async function GET() {
  try {
    const categories = await prisma.spentCategory.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Erro ao buscar categorias de despesa:", error)
    return NextResponse.json({ error: "Erro ao buscar categorias de despesa" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Nome da categoria é obrigatório" }, { status: 400 })
    }

    const slug = slugify(name)

    // Verificar se já existe uma categoria com este slug
    const existingCategory = await prisma.spentCategory.findUnique({
      where: { slug },
    })

    if (existingCategory) {
      return NextResponse.json({ error: "Já existe uma categoria com este nome" }, { status: 400 })
    }

    const category = await prisma.spentCategory.create({
      data: {
        name,
        slug,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Erro ao criar categoria de despesa:", error)
    return NextResponse.json({ error: "Erro ao criar categoria de despesa" }, { status: 500 })
  }
}

