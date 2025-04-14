import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try{
        const session = "session aqui";
        if(!session){
            return NextResponse.json({ error: "Não autorizado" }, { status: 500 })
        }

        const body = await req.json();

        const { name, value, date, description, installmentNumber, status, categories } = body;

        if(!name || !value || !date || !installmentNumber || !status || !categories ) {
            return NextResponse.json({ error: "campos imcompletos"}, { status: 400 })
        }

        const newMonthlySpent = await prisma.monthlySpent.create({
            data: {
                name,
                date,
                value,
                description,
                installmentNumber,
                status,
                categories,
            }
        })

        return NextResponse.json(newMonthlySpent, { status: 201 });
    }
    catch(err){
        console.log(err);
        return NextResponse.json(
            { error: err },
            { status: 500 }
        )
    }
}