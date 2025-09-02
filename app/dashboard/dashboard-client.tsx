"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"

interface Profile {
  id: string
  email: string
  nome_completo: string
  empresa: string
}

interface Lote {
  id: string
  numero_lote: string
  produto: string
  quantidade_planejada: number
  quantidade_produzida: number
  unidade: string
  data_inicio: string
  data_fim?: string
  status: string
  materias_primas: any[]
  data_criacao: string
}

interface MateriaPrima {
  nome: string
  quantidade: number
  unidade: string
  moega: string
}

export default function DashboardClient({ user, profile }: { user: User; profile: Profile }) {
  const [lotes, setLotes] = useState<Lote[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("novo-lote")
  const [materiasPrimas, setMateriasPrimas] = useState<MateriaPrima[]>([
    { nome: "", quantidade: 0, unidade: "kg", moega: "Moega 1" },
  ])
  const router = useRouter()
  const supabase = createClient()

  // Form states
  const [numeroLote, setNumeroLote] = useState("")
  const [produto, setProduto] = useState("")
  const [quantidadePlanejada, setQuantidadePlanejada] = useState("")
  const [unidade, setUnidade] = useState("kg")
  const [dataInicio, setDataInicio] = useState("")

  const produtos = [
    "Ração Suína Inicial",
    "Ração Suína Crescimento",
    "Ração Suína Terminação",
    "Ração Bovina Bezerro",
    "Ração Bovina Engorda",
    "Ração Avícola Inicial",
    "Ração Avícola Crescimento",
    "Ração Avícola Postura",
  ]

  const materiasDisponiveis = [
    "Milho",
    "Soja",
    "Farelo de Soja",
    "Farelo de Trigo",
    "Calcário",
    "Fosfato Bicálcico",
    "Sal Comum",
    "Premix Vitamínico",
    "Óleo de Soja",
    "Lisina",
    "Metionina",
    "Treonina",
  ]

  useEffect(() => {
    loadLotes()
  }, [])

  const loadLotes = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("lotes").select("*").order("data_criacao", { ascending: false })

      if (error) throw error
      setLotes(data || [])
    } catch (error) {
      console.error("Erro ao carregar lotes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const gerarNumeroLote = () => {
    const agora = new Date()
    const ano = agora.getFullYear()
    const mes = String(agora.getMonth() + 1).padStart(2, "0")
    const dia = String(agora.getDate()).padStart(2, "0")
    const hora = String(agora.getHours()).padStart(2, "0")
    const minuto = String(agora.getMinutes()).padStart(2, "0")
    return `L${ano}${mes}${dia}${hora}${minuto}`
  }

  const adicionarMateria = () => {
    setMateriasPrimas([...materiasPrimas, { nome: "", quantidade: 0, unidade: "kg", moega: "Moega 1" }])
  }

  const removerMateria = (index: number) => {
    setMateriasPrimas(materiasPrimas.filter((_, i) => i !== index))
  }

  const updateMateria = (index: number, field: keyof MateriaPrima, value: string | number) => {
    const updated = [...materiasPrimas]
    updated[index] = { ...updated[index], [field]: value }
    setMateriasPrimas(updated)
  }

  const handleSubmitLote = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const loteData = {
        numero_lote: numeroLote || gerarNumeroLote(),
        produto,
        quantidade_planejada: Number.parseFloat(quantidadePlanejada),
        unidade,
        data_inicio: new Date(dataInicio).toISOString(),
        materias_primas: materiasPrimas.filter((m) => m.nome && m.quantidade > 0),
        status: "ativo",
      }

      const { error } = await supabase.from("lotes").insert([loteData])

      if (error) throw error

      // Reset form
      setNumeroLote("")
      setProduto("")
      setQuantidadePlanejada("")
      setUnidade("kg")
      setDataInicio("")
      setMateriasPrimas([{ nome: "", quantidade: 0, unidade: "kg", moega: "Moega 1" }])

      await loadLotes()
      setActiveTab("lotes-ativos")
      alert("Lote criado com sucesso!")
    } catch (error) {
      console.error("Erro ao criar lote:", error)
      alert("Erro ao criar lote")
    } finally {
      setLoading(false)
    }
  }

  const concluirLote = async (loteId: string) => {
    try {
      const { error } = await supabase
        .from("lotes")
        .update({
          status: "concluido",
          data_fim: new Date().toISOString(),
        })
        .eq("id", loteId)

      if (error) throw error
      await loadLotes()
      alert("Lote concluído com sucesso!")
    } catch (error) {
      console.error("Erro ao concluir lote:", error)
      alert("Erro ao concluir lote")
    }
  }

  const lotesAtivos = lotes.filter((l) => l.status === "ativo")
  const lotesHistorico = lotes.filter((l) => l.status !== "ativo")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-white rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gadkin Alimentos</h1>
              <p className="text-gray-600">Sistema de Controle de Lotes</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{profile?.nome_completo || user.email}</span>
            <Button variant="outline" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="novo-lote">Novo Lote</TabsTrigger>
            <TabsTrigger value="lotes-ativos">Lotes Ativos ({lotesAtivos.length})</TabsTrigger>
            <TabsTrigger value="historico">Histórico ({lotesHistorico.length})</TabsTrigger>
            <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          </TabsList>

          {/* Novo Lote */}
          <TabsContent value="novo-lote">
            <Card>
              <CardHeader>
                <CardTitle>Criar Novo Lote</CardTitle>
                <CardDescription>Preencha os dados para criar um novo lote de produção</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitLote} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="numero-lote">Número do Lote</Label>
                      <Input
                        id="numero-lote"
                        placeholder="Deixe vazio para gerar automaticamente"
                        value={numeroLote}
                        onChange={(e) => setNumeroLote(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="produto">Produto</Label>
                      <Select value={produto} onValueChange={setProduto} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {produtos.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="data-inicio">Data de Início</Label>
                      <Input
                        id="data-inicio"
                        type="datetime-local"
                        required
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantidade">Quantidade Planejada</Label>
                      <Input
                        id="quantidade"
                        type="number"
                        step="0.01"
                        required
                        value={quantidadePlanejada}
                        onChange={(e) => setQuantidadePlanejada(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unidade">Unidade</Label>
                      <Select value={unidade} onValueChange={setUnidade}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                          <SelectItem value="ton">Toneladas (ton)</SelectItem>
                          <SelectItem value="saca">Sacas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Matérias-primas */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Matérias-Primas</h3>
                      <Button type="button" variant="outline" onClick={adicionarMateria}>
                        Adicionar Matéria-Prima
                      </Button>
                    </div>

                    {materiasPrimas.map((materia, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-4 border rounded-lg">
                        <div className="space-y-2">
                          <Label>Matéria-Prima</Label>
                          <Select value={materia.nome} onValueChange={(value) => updateMateria(index, "nome", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {materiasDisponiveis.map((m) => (
                                <SelectItem key={m} value={m}>
                                  {m}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Quantidade</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={materia.quantidade}
                            onChange={(e) => updateMateria(index, "quantidade", Number.parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Unidade</Label>
                          <Select
                            value={materia.unidade}
                            onValueChange={(value) => updateMateria(index, "unidade", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="ton">ton</SelectItem>
                              <SelectItem value="saca">saca</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Moega</Label>
                          <Select value={materia.moega} onValueChange={(value) => updateMateria(index, "moega", value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map((n) => (
                                <SelectItem key={n} value={`Moega ${n}`}>
                                  Moega {n}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removerMateria(index)}
                            disabled={materiasPrimas.length === 1}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Criando..." : "Criar Lote"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lotes Ativos */}
          <TabsContent value="lotes-ativos">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Lotes Ativos</h2>
              {loading ? (
                <div className="text-center text-white">Carregando...</div>
              ) : lotesAtivos.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">Nenhum lote ativo encontrado</p>
                  </CardContent>
                </Card>
              ) : (
                lotesAtivos.map((lote) => (
                  <Card key={lote.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{lote.numero_lote}</CardTitle>
                          <CardDescription>{lote.produto}</CardDescription>
                        </div>
                        <Badge variant="secondary">{lote.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Quantidade Planejada</p>
                          <p className="font-semibold">
                            {lote.quantidade_planejada} {lote.unidade}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Data Início</p>
                          <p className="font-semibold">{new Date(lote.data_inicio).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Matérias-Primas</p>
                          <p className="font-semibold">{lote.materias_primas.length} itens</p>
                        </div>
                        <div className="flex justify-end">
                          <Button onClick={() => concluirLote(lote.id)}>Concluir Lote</Button>
                        </div>
                      </div>

                      {lote.materias_primas.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Matérias-Primas:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {lote.materias_primas.map((materia: any, index: number) => (
                              <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                                {materia.nome}: {materia.quantidade} {materia.unidade} ({materia.moega})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Histórico */}
          <TabsContent value="historico">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Histórico de Lotes</h2>
              {loading ? (
                <div className="text-center text-white">Carregando...</div>
              ) : lotesHistorico.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">Nenhum lote no histórico</p>
                  </CardContent>
                </Card>
              ) : (
                lotesHistorico.map((lote) => (
                  <Card key={lote.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{lote.numero_lote}</CardTitle>
                          <CardDescription>{lote.produto}</CardDescription>
                        </div>
                        <Badge variant={lote.status === "concluido" ? "default" : "destructive"}>{lote.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Quantidade</p>
                          <p className="font-semibold">
                            {lote.quantidade_planejada} {lote.unidade}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Data Início</p>
                          <p className="font-semibold">{new Date(lote.data_inicio).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Data Fim</p>
                          <p className="font-semibold">
                            {lote.data_fim ? new Date(lote.data_fim).toLocaleDateString() : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Matérias-Primas</p>
                          <p className="font-semibold">{lote.materias_primas.length} itens</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Estatísticas */}
          <TabsContent value="estatisticas">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Estatísticas</h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total de Lotes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{lotes.length}</div>
                    <p className="text-xs text-muted-foreground">Lotes criados</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Lotes Ativos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{lotesAtivos.length}</div>
                    <p className="text-xs text-muted-foreground">Em produção</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Lotes Concluídos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{lotes.filter((l) => l.status === "concluido").length}</div>
                    <p className="text-xs text-muted-foreground">Finalizados</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Produção Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {lotes.reduce((acc, lote) => acc + lote.quantidade_planejada, 0).toFixed(0)}
                    </div>
                    <p className="text-xs text-muted-foreground">kg planejados</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
