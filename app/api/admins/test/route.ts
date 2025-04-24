import argon2 from "argon2";
import {NextResponse} from "next/server";

export async function POST(req: Request){
    try{
        const body = await req.json();

        const { password } = body;

        console.log(password);
        const hashedPassword = await argon2.hash(password);
        console.log(hashedPassword);

        return NextResponse.json(hashedPassword);
    } catch (error) {
        console.log(error);
        return NextResponse.json({error: "catch"});
    }
 }