"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Transaction {
  id: string
  userId: number
  fromCurrency: string
  toCurrency: string
  fromAmount: number
  toAmount: number
  timestamp: string
}

export default function DebugPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiResponse, setApiResponse] = useState<string>("")

  async function fetchTransactions() {
    try {
      setLoading(true)
      const response = await fetch("/api/transactions")
      const responseText = await response.text()

      setApiResponse(responseText)

      try {
        const data = JSON.parse(responseText)
        setTransactions(data)
      } catch (parseError) {
        setError(`JSON ayrıştırma hatası: ${parseError}`)
      }
    } catch (err) {
      setError(`Hata: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Debug Sayfası</CardTitle>
          <CardDescription>API yanıtlarını ve veritabanı durumunu kontrol edin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button onClick={fetchTransactions} disabled={loading}>
              {loading ? "Yükleniyor..." : "Verileri Yenile"}
            </Button>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">API Yanıtı:</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">{apiResponse || "Yanıt yok"}</pre>
          </div>

          {error && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-red-500">Hata:</h3>
              <pre className="bg-red-50 text-red-500 p-4 rounded-md overflow-auto max-h-60">{error}</pre>
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium mb-2">İşlem Sayısı: {transactions.length}</h3>
            {transactions.length > 0 && (
              <ul className="list-disc pl-5">
                {transactions.map((t) => (
                  <li key={t.id}>
                    {t.fromCurrency} → {t.toCurrency}: {t.fromAmount} → {t.toAmount}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
