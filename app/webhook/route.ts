import { NextResponse } from "next/server"
import { handleUpdate } from "@/lib/telegram"

export async function POST(request: Request) {
  try {
    const update = await request.json()
    console.log("Webhook: Telegram güncellemesi alındı", JSON.stringify(update).substring(0, 100) + "...")

    await handleUpdate(update)
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("Webhook: Hata oluştu:", error)
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
