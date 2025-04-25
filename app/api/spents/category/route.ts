import { NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/auth";

export async function POST(req: Request) {
    try{
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Não autorizado. Faça login primeiro." }, { status: 401 })
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

export async function PUT(req: Request, res: Response){
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
                { error: "Dados Inválidos" },
                { status: 400 }
            )
        }

        const { name, id } = body;
        if( !name || !id ){
            return NextResponse.json(
                { error: "Dados incompletos "},
                { status: 400 }
            )
        }
        const slug = slugify(name);

        const updatedSpentCategory =
            await prisma.spentCategory.update
            ({
                where: {
                    id: id
                },
                data: {
                    name,
                    slug
                }
            })

        return NextResponse.json(
            updatedSpentCategory,
            { status: 201 }
        )
    }
    catch(error){
        console.log("Erro ao editar categorias", error);
        return NextResponse.json(
            { error: "Erro ao editar categorias" },
            { status: 500 }
        )
    }
}

export async function DELETE(req: Request, res: Response){
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
                { error: "Dados inválidos "},
                { status: 400 }
            )
        }

        const { id } = body;

        const count = await prisma.spentCategory.findFirst({
            where: {
                id: id
            },
            select: {
                name: true,
                _count: {
                    select: {
                        spents: true,
                        monthlySpents: true
                    }
                }
            }
        })

        if(!count){
            return NextResponse.json(
                { error: "Não foi possível deletar categoria erro: Categoria inexistente"},
                { status: 400 }
            )
        }

        if((count._count.spents + count._count.monthlySpents) > 0){
            return NextResponse.json(
                { error: "Categoria com alguma receita cadastrada"},
                { status: 400 }
            )
        }

        const removedSpentCategory = await prisma.spentCategory.delete({
            where: {
                id: id
            }
        })

        return NextResponse.json(
            removedSpentCategory,
            { status: 201 }
        )
    }
    catch(error){
        console.log("Erro ao deletar categorias", error);
        return NextResponse.json(
            { error: "Erro ao deletar categorias" },
            { status: 500 }
        )
    }
}