import { NextResponse } from "next/server"
import { getAllTransactions, getUserTransactions, addTestTransaction } from "@/lib/db"

// İlk çağrıda test verisi ekle
let testDataAdded = false

export async function GET(request: Request) {
  try {
    // İlk kez çağrıldığında test verisi ekle
    if (!testDataAdded) {
      await addTestTransaction()
      testDataAdded = true
    }

    // URL'den userId parametresini al
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    let transactions

    if (userId) {
      // Belirli bir kullanıcının işlemlerini getir
      transactions = await getUserTransactions(Number(userId))
    } else {
      // Tüm işlemleri getir
      transactions = await getAllTransactions()
    }

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
