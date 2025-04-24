import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { slugify } from "@/lib/utils"
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/auth";

export async function GET() {

  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Não autorizado. Faça login primeiro." }, { status: 401 })
  }

  try {
    const categories = await prisma.revenueCategory.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Erro ao buscar categorias de receita:", error)
    return NextResponse.json({ error: "Erro ao buscar categorias de receita" }, { status: 500 })
  }
}

export async function POST(request: Request) {

  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Não autorizado. Faça login primeiro." }, { status: 401 })
  }

  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Nome da categoria é obrigatório" }, { status: 400 })
    }

    const slug = slugify(name)

    // Verificar se já existe uma categoria com este slug
    const existingCategory = await prisma.revenueCategory.findUnique({
      where: { slug },
    })

    if (existingCategory) {
      return NextResponse.json({ error: "Já existe uma categoria com este nome" }, { status: 400 })
    }

    const category = await prisma.revenueCategory.create({
      data: {
        name,
        slug,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Erro ao criar categoria de receita:", error)
    return NextResponse.json({ error: "Erro ao criar categoria de receita" }, { status: 500 })
  }
}

