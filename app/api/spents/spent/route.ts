import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try{
        const session = "session aqui";
        if(!session){
            return NextResponse.json({ error: "Não autorizado"}, { status:500 })
        }

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