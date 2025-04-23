import prisma from "@/lib/prisma";
import {NextResponse} from "next/server";

export async function GET(){
    try {
        const categories = await prisma.spentCategory.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                _count: {
                    select: {
                        spents: true,
                        monthlySpents: true,
                    }
                }
            }
        })

        return NextResponse.json(
            categories.map(c => ({
                id: c.id,
                name: c.name,
                count: (c._count.spents + c._count.monthlySpents),
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