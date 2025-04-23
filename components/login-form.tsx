"use client"

import React, {useEffect} from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BarChart3, Eye, EyeOff, Lock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { signIn, useSession } from "next-auth/react";


export function LoginForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/admin/empregos");
        }
    }, [status, router]);

    async function handleSubmit (e: React.FormEvent)  {
        e.preventDefault()
        setIsLoading(true)

        const success =  await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if(success?.error) {
            toast({
                title: "Erro ao fazer login",
                description: "Email ou senha incorretos",
                variant: "destructive",
            })
        }
        else {
            toast({
                title: "Login realizado com sucesso",
                description: "Bem-vindo ao Sistema Financeiro",
                variant: "default",
            })
            router.push("/")
        }
    }

    if (status === "loading") {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <div className="flex items-center justify-center mb-4">
                    <BarChart3 className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold text-center">Sistema Financeiro</CardTitle>
                <CardDescription className="text-center">Entre com suas credenciais para acessar o sistema</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                className="pl-9"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-9 pr-9"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1 h-8 w-8"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="sr-only">{showPassword ? "Esconder senha" : "Mostrar senha"}</span>
                            </Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Entrando..." : "Entrar"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
