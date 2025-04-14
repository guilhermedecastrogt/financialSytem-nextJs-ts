import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = "session aqui";
        if (!session) {
            return NextResponse.json(
                {error: "Não autorizado"},
                {status: 500}
            )
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