import { NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try{
        const session = "realizar autenticacao de login";

        if(!session) {
            return NextResponse.json({ error: "Não autorizado." }, {status:500});
        }

        const body = await req.json();

        /*if(!body || typeof body === "object") {
            console.log(body);
            return NextResponse.json({error: "body incompletosla",body }, { status: 400 });
        }*/

        const { name, date, value, status, description, categories } = body;

        if(!name || !date || !status || !categories) {
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