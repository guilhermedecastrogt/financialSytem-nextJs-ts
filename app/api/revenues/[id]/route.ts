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

        const monthlyRevenue = await prisma.monthlyRevenue.findUnique({
            where: {
                id: id,
            }
        })

        const revenue = await prisma.revenue.findUnique({
            where: {
                id: id,
            }
        })


        if(monthlyRevenue){
            await prisma.monthlyRevenue.deleteMany({
                where: {
                    id: id,
                }
            })

            return NextResponse.json(
                { success: "MonthlyRevenue deleted successfully"},
                { status: 200 }
            )
        }

        if(revenue){
            await prisma.revenue.deleteMany({
                where: {
                    id: id,
                }
            })

            return NextResponse.json(
                { success: "Revenue deleted successfully"},
                { status: 200 }
            )
        }


        return NextResponse.json(
            { error: "revenue não encontrado "},
            { status: 400 }
        )
    }
    catch(err){
        console.log(err)
        return NextResponse.json(
            { error: "Erro ao deletar revenue "},
            { status: 500 }
        )
    }
}