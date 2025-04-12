import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const spent = await prisma.spent.findUnique({
      where: {
        id: params.id,
      },
      include: {
        categories: true,
      },
    })

    if (!spent) {
      return NextResponse.json({ error: "Despesa não encontrada" }, { status: 404 })
    }

    return NextResponse.json(spent)
  } catch (error) {
    console.error("Erro ao buscar despesa:", error)
    return NextResponse.json({ error: "Erro ao buscar despesa" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const { name, date, value, status, description, categories } = data

    // Preparar os dados para atualização
    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (date !== undefined) updateData.date = new Date(date)
    if (value !== undefined) updateData.value = Number.parseFloat(value.toString())
    if (status !== undefined) updateData.status = status
    if (description !== undefined) updateData.description = description

    // Atualizar a despesa
    const spent = await prisma.spent.update({
      where: {
        id: params.id,
      },
      data: {
        ...updateData,
        ...(categories && {
          categories: {
            set: [], // Remover todas as categorias existentes
            connect: categories.map((id: string) => ({ id })), // Conectar as novas categorias
          },
        }),
      },
      include: {
        categories: true,
      },
    })

    return NextResponse.json(spent)
  } catch (error) {
    console.error("Erro ao atualizar despesa:", error)
    return NextResponse.json({ error: "Erro ao atualizar despesa" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.spent.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir despesa:", error)
    return NextResponse.json({ error: "Erro ao excluir despesa" }, { status: 500 })
  }
}

