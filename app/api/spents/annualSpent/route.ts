import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Não autorizado. Faça login primeiro." }, { status: 401 })
        }

        const body = await req.json();

        const {name, value, date, description, status, categories} = body;

        if (!name || !value || !date || !status || !categories) {
            return NextResponse.json({error: "campos imcompletos"}, {status: 400})
        }

        const newAnnualSpent = await prisma.annualSpent.create({
            data: {
                name,
                value,
                date,
                description,
                status,
                categories,
            }
        })

        return NextResponse.json(newAnnualSpent, { status: 201 });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error },
            { status: 500 }
        )
    }
}

export async function GET (){
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json( { error: "Não autorizado"}, { status: 401 })
    }
    try{
        const spents = await prisma.annualSpent.findMany({
            include: {
                categories: true
            }, orderBy: {
                date: "desc"
            }
        })

        return NextResponse.json(
            spents,
            { status: 200 }
        );
    } catch(error) {
        console.log(error);
        return NextResponse.json({ error: "Erro ao buscar despesas"}, { status: 500})
    }
}