import prisma from "@/lib/prisma";
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/auth";

export async function GET(){

    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ error: "Não autorizado. Faça login primeiro." }, { status: 401 })
    }

    try {
        const categories = await prisma.revenueCategory.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                _count: {
                    select: {
                        revenues: true,
                        monthlyRevenues: true,
                    }
                }
            }
        })

        return NextResponse.json(
            categories.map(c => ({
                id: c.id,
                name: c.name,
                count: (c._count.revenues+c._count.monthlyRevenues),
            })),
            { status: 201 }
        )
    }
    catch(error){
        console.log("Erro ao buscar categorias", error);
        return NextResponse.json({ error: "Erro ao criar categorias" }, {
            status: 500
        });
    }
}