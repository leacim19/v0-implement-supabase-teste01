import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardClient from "./dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Buscar perfil do usuário
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return <DashboardClient user={data.user} profile={profile} />
}
