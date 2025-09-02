"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nomeCompleto, setNomeCompleto] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setIsLoading(false)
      return
    }

    try {
      console.log("[v0] Iniciando cadastro para:", email)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        console.log("[v0] Erro no signUp:", error)
        throw error
      }

      console.log("[v0] SignUp bem-sucedido:", data)

      if (data.user) {
        console.log("[v0] Criando perfil para user ID:", data.user.id)

        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: email,
          nome_completo: nomeCompleto,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (profileError) {
          console.log("[v0] Erro ao criar perfil:", profileError)
          throw profileError
        }

        console.log("[v0] Perfil criado com sucesso")

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          console.log("[v0] Erro no login automático:", signInError)
          throw signInError
        }

        console.log("[v0] Login automático bem-sucedido")
        router.push("/dashboard")
      }
    } catch (error: unknown) {
      console.log("[v0] Erro geral:", error)
      setError(error instanceof Error ? error.message : "Erro no cadastro")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Gadkin Alimentos</h1>
              <p className="text-sm text-muted-foreground">Sistema de Controle de Lotes</p>
            </div>
          </div>
          <CardTitle>Cadastrar</CardTitle>
          <CardDescription>Crie sua conta para acessar o sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Seu nome completo"
                required
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Cadastrando..." : "Cadastrar"}
            </Button>
            <div className="text-center text-sm">
              Já tem conta?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Faça login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
