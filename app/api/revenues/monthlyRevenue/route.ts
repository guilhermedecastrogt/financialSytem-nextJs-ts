import { NextResponse } from "next/server";
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

        const { name, date, value, status, description, installmentNumber, categories } = body;

        if(!name || !date || !value || !status || !installmentNumber || !categories){
            return NextResponse.json(
                { error: "Campos incompletos" },
                { status: 400 }
            )
        }

        const newMonthlyRevenue = await prisma.monthlyRevenue.create({
            data: {
                name,
                date,
                value,
                status,
                description,
                installmentNumber,
                categories,
            }
        })

        return NextResponse.json(
            newMonthlyRevenue,
            { status: 201 }
        );
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status:500 });
    }
}

export async function GET (){
    const session = await getServerSession(authOptions)
    if (!session) { return NextResponse.json( { error: "Não autorizado"}, { status: 401 }) }
    try{
        const revenues = await prisma.monthlyRevenue.findMany({
            include: {
                categories: true
            }, orderBy: {
                date: "desc"
            }
        })

        return NextResponse.json(
            revenues,
            { status: 200 }
        );
    } catch(error) {
        console.log(error);
        return NextResponse.json({ error: "Erro ao buscar receitas"}, { status: 500})
    }
}