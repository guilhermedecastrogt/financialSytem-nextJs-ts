import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({error: "Não autorizado. Faça login primeiro."}, {status: 401})
    }
    try{
        const body = await req.json();

        const { name, date, value, status, description, categories } = body;

        console.log(body);

        if(!name || !date || !status || !categories || !value) {
            return NextResponse.json( { error: "Campos incompletos" }, { status:400 })
        }

        const newSpent = await prisma.spent.create({
            data: {
                name,
                date,
                value,
                status,
                description,
                categories,
            }
        })

        return NextResponse.json(
            newSpent,
            { status: 201 }
        );
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

export async function GET (){
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json( { error: "Não autorizado"}, { status: 401 })
    }
    try{
        const spents = await prisma.spent.findMany({
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