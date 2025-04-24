"use client"

import { useState, useEffect } from "react"
import { Edit, Search, Trash2, UserPlus, UsersIcon, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

type AdminUser = {
    id: number
    username: string
    email: string
    password?: string
}

export function UsersPage() {
    const { toast } = useToast()
    const [users, setUsers] = useState<AdminUser[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [newUsername, setNewUsername] = useState("")
    const [newEmail, setNewEmail] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [editingUserId, setEditingUserId] = useState<number | null>(null)
    const [editUsername, setEditUsername] = useState("")
    const [editEmail, setEditEmail] = useState("")
    const [editPassword, setEditPassword] = useState("")
    const [userToDelete, setUserToDelete] = useState<number | null>(null)
    const [currentUser, setCurrentUser] = useState<AdminUser | null>(null)

    useEffect(() => {
        fetch("/api/admins")
            .then(res => res.json())
            .then(data => setUsers(data))
    }, [])

    const addUser = async (username: string, email: string, password: string) => {
        const res = await fetch("/api/admins", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        })
        const newUser: AdminUser = await res.json()
        setUsers([...users, newUser])
    }

    const updateUser = async (id: number, data: Partial<AdminUser>) => {
        const res = await fetch(`/api/admins/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
        const updatedUser: AdminUser = await res.json()
        setUsers(users.map(u => (u.id === id ? updatedUser : u)))
    }

    const deleteUser = async (id: number) => {
        await fetch(`/api/admins/${id}`, {
            method: "DELETE"
        })
        setUsers(users.filter(u => u.id !== id))
    }

    const filteredUsers = users.filter(
        (user) =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const startEditing = (userId: number) => {
        const user = users.find((u) => u.id === userId)
        if (user) {
            setEditingUserId(userId)
            setEditUsername(user.username)
            setEditEmail(user.email)
            setEditPassword("")
        }
    }

    const cancelEditing = () => {
        setEditingUserId(null)
        setEditUsername("")
        setEditEmail("")
        setEditPassword("")
    }

    const saveEditing = () => {
        if (editingUserId === null) return
        const updateData: Partial<AdminUser> = { username: editUsername, email: editEmail }
        if (editPassword) updateData.password = editPassword
        updateUser(editingUserId, updateData)
        toast({ title: "Usuário atualizado" })
        cancelEditing()
    }

    const handleAddUser = () => {
        addUser(newUsername, newEmail, newPassword)
        toast({ title: "Usuário adicionado" })
        setNewUsername("")
        setNewEmail("")
        setNewPassword("")
        setIsAddDialogOpen(false)
    }

    const confirmDelete = (userId: number) => setUserToDelete(userId)

    const handleDeleteUser = () => {
        if (userToDelete !== null) {
            deleteUser(userToDelete)
            toast({ title: "Usuário excluído" })
            setUserToDelete(null)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
                <p className="text-muted-foreground">Gerencie os usuários do sistema financeiro</p>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar usuários..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            Novo Usuário
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Adicionar Usuário</DialogTitle>
                            <DialogDescription>Crie um novo usuário para acessar o sistema financeiro.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="username">Nome de Usuário</Label>
                                <Input
                                    id="username"
                                    placeholder="Digite o nome de usuário"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Digite o email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Digite a senha"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleAddUser} disabled={!newUsername || !newEmail || !newPassword}>
                                Adicionar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UsersIcon className="h-5 w-5" />
                        Lista de Usuários
                    </CardTitle>
                    <CardDescription>Gerencie os usuários que têm acesso ao sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome de Usuário</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        {editingUserId === user.id ? (
                                            <Input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} className="h-8" />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {user.username}
                                                {currentUser?.id === user.id && <span className="text-xs text-primary">(Você)</span>}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingUserId === user.id ? (
                                            <Input
                                                value={editEmail}
                                                onChange={(e) => setEditEmail(e.target.value)}
                                                className="h-8"
                                                type="email"
                                            />
                                        ) : (
                                            user.email
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingUserId === user.id ? (
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1">
                                                    <Input
                                                        value={editPassword}
                                                        onChange={(e) => setEditPassword(e.target.value)}
                                                        className="h-8"
                                                        type="password"
                                                        placeholder="Nova senha (opcional)"
                                                    />
                                                </div>
                                                <Button size="icon" variant="ghost" onClick={saveEditing} className="h-8 w-8">
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={cancelEditing} className="h-8 w-8">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => startEditing(user.id)} className="h-8 w-8">
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">Editar</span>
                                                </Button>
                                                <AlertDialog
                                                    open={userToDelete === user.id}
                                                    onOpenChange={(open) => !open && setUserToDelete(null)}
                                                >
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => confirmDelete(user.id)}
                                                            className="h-8 w-8 text-destructive"
                                                            disabled={currentUser?.id === user.id}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">Excluir</span>
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Tem certeza que deseja excluir o usuário {user.username}? Esta ação não pode ser
                                                                desfeita.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={handleDeleteUser}
                                                                className="bg-destructive text-destructive-foreground"
                                                            >
                                                                Excluir
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredUsers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                        Nenhum usuário encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
