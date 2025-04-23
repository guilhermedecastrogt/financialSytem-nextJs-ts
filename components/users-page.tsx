"use client"

import { useState } from "react"
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

export function UsersPage() {
    const { toast } = useToast()
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

    // Estados para o formulário de adição
    const [newUsername, setNewUsername] = useState("")
    const [newEmail, setNewEmail] = useState("")
    const [newPassword, setNewPassword] = useState("")

    // Estados para edição inline
    const [editingUserId, setEditingUserId] = useState<string | null>(null)
    const [editUsername, setEditUsername] = useState("")
    const [editEmail, setEditEmail] = useState("")
    const [editPassword, setEditPassword] = useState("")

    // Estado para o usuário a ser excluído
    const [userToDelete, setUserToDelete] = useState<string | null>(null)

    // Filtrar usuários com base no termo de busca
    const filteredUsers = users.filter(
        (user) =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Iniciar edição de um usuário
    const startEditing = (userId: string) => {
        const user = users.find((u) => u.id === userId)
        if (user) {
            setEditingUserId(userId)
            setEditUsername(user.username)
            setEditEmail(user.email)
            setEditPassword("")
        }
    }

    // Cancelar edição
    const cancelEditing = () => {
        setEditingUserId(null)
        setEditUsername("")
        setEditEmail("")
        setEditPassword("")
    }

    // Salvar edição
    const saveEditing = () => {
        if (!editingUserId) return

        const updateData: { username: string; email: string; password?: string } = {
            username: editUsername,
            email: editEmail,
        }

        // Só atualizar a senha se foi fornecida
        if (editPassword) {
            updateData.password = editPassword
        }

        updateUser(editingUserId, updateData)

        toast({
            title: "Usuário atualizado",
            description: "As informações do usuário foram atualizadas com sucesso.",
        })

        cancelEditing()
    }

    // Adicionar novo usuário
    const handleAddUser = () => {
        addUser(newUsername, newEmail, newPassword)

        toast({
            title: "Usuário adicionado",
            description: "O novo usuário foi adicionado com sucesso.",
        })

        setNewUsername("")
        setNewEmail("")
        setNewPassword("")
        setIsAddDialogOpen(false)
    }

    // Confirmar exclusão de usuário
    const confirmDelete = (userId: string) => {
        setUserToDelete(userId)
    }

    // Executar exclusão de usuário
    const handleDeleteUser = () => {
        if (userToDelete) {
            deleteUser(userToDelete)

            toast({
                title: "Usuário excluído",
                description: "O usuário foi excluído com sucesso.",
            })

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
