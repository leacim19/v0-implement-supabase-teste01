import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("[v0] Client - Supabase URL exists:", !!url)
  console.log("[v0] Client - Supabase Key exists:", !!key)

  if (!url || !key) {
    console.error("[v0] Client - Missing environment variables")
    console.error("[v0] Client - URL:", url ? "SET" : "MISSING")
    console.error("[v0] Client - Key:", key ? "SET" : "MISSING")
    throw new Error("Missing Supabase environment variables")
  }

  return createBrowserClient(url, key)
}
