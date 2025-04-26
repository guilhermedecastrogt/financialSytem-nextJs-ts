import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/auth";
import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if(!session){
        return NextResponse.json(
            { error: "Não autorizado"},
            { status: 401 }
        )
    }
    try{
        const id = (await params).id
        if(!id){
            return NextResponse.json(
                { error: "Dados incompletos" },
                { status: 400 }
            )
        }

        const monthlySpent = await prisma.monthlySpent.findUnique({
            where: {
                id: id,
            }
        })

        const spent = await prisma.spent.findUnique({
            where: {
                id: id,
            }
        })

        const annualSpent = await prisma.annualSpent.findUnique({
            where: {
                id: id,
            }
        })

        if(monthlySpent){
            await prisma.monthlySpent.deleteMany({
                where: {
                    id: id,
                }
            })

            return NextResponse.json(
                { success: "MonthlySpent deleted successfully"},
                { status: 200 }
            )
        }

        if(spent){
            await prisma.spent.deleteMany({
                where: {
                    id: id,
                }
            })

            return NextResponse.json(
                { success: "Spent deleted successfully"},
                { status: 200 }
            )
        }

        if(annualSpent){
            await prisma.annualSpent.deleteMany({
                where: {
                    id: id,
                }
            })

            return NextResponse.json(
                { success: "AnnualSpent deleted successfully"},
                { status: 200 }
            )
        }

        return NextResponse.json(
            { error: "Spent não encontrado "},
            { status: 400 }
        )
    }
    catch(err){
        console.log(err)
        return NextResponse.json(
            { error: "Erro ao deletar spent "},
            { status: 500 }
        )
    }
}