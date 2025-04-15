import prisma from "@/lib/prisma";
import {NextResponse} from "next/server";

export async function GET(){
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
                revenueCount: (c._count.revenues+c._count.monthlyRevenues),
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