import { NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try{
        const session = "fazer a autenticacao de login aqui"

        if(!session){
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            )
        }

        const body = await req.json();

        if(!body || typeof body !== "object"){
            return NextResponse.json(
                { error: "Dados inválidos" },
                { status: 400 }
            );
        }

        const  { name } = body;
        const slug = slugify(name);



        const newRevenueCategory = await prisma.revenueCategory.create({
            data: {
                name,
                slug
            }
        })

        return NextResponse.json(newRevenueCategory, { status: 201 });
    }
    catch (error) {
        console.log("Erro ao criar categoria de receitas",error);
        return NextResponse.json(
            { error: "Erro ao criar categoria de receitas" },
            { status: 500 }
        );
    }
}

function slugify(name: string): string {
    return name
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/--+/g, "-")
        .trim();
}

export async function GET(){
    try{
        const revenueCategory = await prisma.revenueCategory.findMany({
            orderBy: { createdAt: "desc" }
        })

        const revenueCategoryList = revenueCategory.map((revenueCategory) => ({
            id: revenueCategory.id,
            name: revenueCategory.name,
            slug: revenueCategory.slug
        }));

        return NextResponse.json(revenueCategoryList, { status: 200});
    }
    catch(error){
        console.log("erro ao buscar categorias de receitas", error);
        return NextResponse.json(
            { error: "Erro ao criar categorias" },
            { status: 500 }
        )
    }
}