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

        /*if(!body || typeof body === "object") {
            console.log(body);
            return NextResponse.json({error: "body incompletosla",body }, { status: 400 });
        }*/

        const { name, date, value, status, description, categories } = body;

        console.log(body);

        if(!name || !date || !status || !categories || !value) {
            return NextResponse.json(
                { error: "Campos incompletos"},
                { status: 400 }
            )
        }

        const newRevenue = await prisma.revenue.create({
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
            newRevenue,
            { status: 201 }
        );
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}