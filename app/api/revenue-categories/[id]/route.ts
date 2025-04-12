import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { slugify } from "@/lib/utils"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const category = await prisma.revenueCategory.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Erro ao buscar categoria de receita:", error)
    return NextResponse.json({ error: "Erro ao buscar categoria de receita" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Nome da categoria é obrigatório" }, { status: 400 })
    }

    const slug = slugify(name)

    // Verificar se já existe outra categoria com este slug
    const existingCategory = await prisma.revenueCategory.findFirst({
      where: {
        slug,
        id: {
          not: params.id,
        },
      },
    })

    if (existingCategory) {
      return NextResponse.json({ error: "Já existe uma categoria com este nome" }, { status: 400 })
    }

    const category = await prisma.revenueCategory.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        slug,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Erro ao atualizar categoria de receita:", error)
    return NextResponse.json({ error: "Erro ao atualizar categoria de receita" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar se a categoria está sendo usada
    const revenuesUsingCategory = await prisma.revenue.findMany({
      where: {
        categories: {
          some: {
            id: params.id,
          },
        },
      },
      take: 1,
    })

    if (revenuesUsingCategory.length > 0) {
      return NextResponse.json({ error: "Não é possível excluir uma categoria que está sendo usada" }, { status: 400 })
    }

    await prisma.revenueCategory.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir categoria de receita:", error)
    return NextResponse.json({ error: "Erro ao excluir categoria de receita" }, { status: 500 })
  }
}

