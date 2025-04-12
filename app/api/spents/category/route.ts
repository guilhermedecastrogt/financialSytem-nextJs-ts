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


        const newSpentCategory = await prisma.spentCategory.create({
            data: {
                name,
                slug
            }
        })

        return NextResponse.json(newSpentCategory, { status: 201 });
    }
    catch (error) {
        console.log("Erro ao criar categoria de despesa",error);
        return NextResponse.json(
            { error: "Erro ao criar categoria de despesa" },
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
        const spentCategory = await prisma.spentCategory.findMany({
            orderBy: { createdAt: "desc" }
        })

        const spentCategoryList = spentCategory.map((spentCategory) => ({
            id: spentCategory.id,
            name: spentCategory.name,
            slug: spentCategory.slug
        }));

        return NextResponse.json(spentCategoryList, { status: 200});
    }
    catch(error){
        console.log("erro ao buscar categorias de receitas", error);
        return NextResponse.json(
            { error: "Erro ao criar categorias" },
            { status: 500 }
        )
    }
}