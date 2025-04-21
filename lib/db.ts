import { supabase } from "./supabase"

// İşlem tipi
export interface Transaction {
  id?: string
  userId: number
  fromCurrency: string
  toCurrency: string
  fromAmount: number
  toAmount: number
  timestamp: Date
}

// Tüm işlemleri getir
export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase.from("transactions").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching transactions:", error)
      return []
    }

    // Supabase'den gelen verileri uygulama formatına dönüştür
    return data.map((item) => ({
      id: item.id,
      userId: item.user_id,
      fromCurrency: item.from_currency,
      toCurrency: item.to_currency,
      fromAmount: item.from_amount,
      toAmount: item.to_amount,
      timestamp: new Date(item.created_at),
    }))
  } catch (error) {
    console.error("Error reading transactions:", error)
    return []
  }
}

// Kullanıcıya ait işlemleri getir
export async function getUserTransactions(userId: number): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user transactions:", error)
      return []
    }

    return data.map((item) => ({
      id: item.id,
      userId: item.user_id,
      fromCurrency: item.from_currency,
      toCurrency: item.to_currency,
      fromAmount: item.from_amount,
      toAmount: item.to_amount,
      timestamp: new Date(item.created_at),
    }))
  } catch (error) {
    console.error("Error reading user transactions:", error)
    return []
  }
}

// Yeni işlem kaydet
export async function saveTransaction(transaction: Transaction): Promise<Transaction> {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          user_id: transaction.userId,
          from_currency: transaction.fromCurrency,
          to_currency: transaction.toCurrency,
          from_amount: transaction.fromAmount,
          to_amount: transaction.toAmount,
          created_at: transaction.timestamp.toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Error saving transaction:", error)
      throw new Error("Failed to save transaction")
    }

    // Supabase'den dönen veriyi uygulama formatına dönüştür
    const savedTransaction = data[0]
    return {
      id: savedTransaction.id,
      userId: savedTransaction.user_id,
      fromCurrency: savedTransaction.from_currency,
      toCurrency: savedTransaction.to_currency,
      fromAmount: savedTransaction.from_amount,
      toAmount: savedTransaction.to_amount,
      timestamp: new Date(savedTransaction.created_at),
    }
  } catch (error) {
    console.error("Error saving transaction:", error)
    throw new Error("Failed to save transaction")
  }
}

// Test işlemi ekle - uygulama başladığında örnek veri oluşturur
export async function addTestTransaction() {
  // Veritabanında hiç işlem yoksa test verisi ekle
  const transactions = await getAllTransactions()

  if (transactions.length === 0) {
    const testTransaction: Transaction = {
      userId: 123456789,
      fromCurrency: "TRY",
      toCurrency: "BTC",
      fromAmount: 1000,
      toAmount: 0.0012,
      timestamp: new Date(),
    }

    await saveTransaction(testTransaction)
    console.log("Test işlemi eklendi")
  }
}
