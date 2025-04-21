"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface Transaction {
  id: string
  userId: number
  fromCurrency: string
  toCurrency: string
  fromAmount: number
  toAmount: number
  timestamp: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTransactions() {
      try {
        console.log("İşlemler getiriliyor...") // Debug için log ekledik
        const response = await fetch("/api/transactions")

        if (!response.ok) {
          console.error("API yanıtı başarısız:", response.status, response.statusText)
          throw new Error(`Failed to fetch transactions: ${response.status}`)
        }

        const data = await response.json()
        console.log("Alınan işlemler:", data) // Debug için log ekledik
        setTransactions(data)
      } catch (err) {
        console.error("İşlem getirme hatası:", err)
        setError("İşlem geçmişi yüklenirken bir hata oluştu.")
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  // Filtreleme fonksiyonu
  const filteredTransactions = transactions.filter((transaction) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      transaction.userId.toString().includes(searchLower) ||
      transaction.fromCurrency.toLowerCase().includes(searchLower) ||
      transaction.toCurrency.toLowerCase().includes(searchLower) ||
      transaction.fromAmount.toString().includes(searchLower) ||
      transaction.toAmount.toString().includes(searchLower) ||
      new Date(transaction.timestamp).toLocaleString("tr-TR").toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>İşlem Geçmişi</CardTitle>
          <CardDescription>Kullanıcıların gerçekleştirdiği tüm dönüşüm işlemleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="İşlemlerde ara..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {searchTerm ? "Aramanızla eşleşen işlem bulunamadı." : "Henüz işlem kaydı bulunmuyor."}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kullanıcı ID</TableHead>
                    <TableHead>Kaynak</TableHead>
                    <TableHead>Hedef</TableHead>
                    <TableHead>Miktar</TableHead>
                    <TableHead>Sonuç</TableHead>
                    <TableHead>Tarih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.userId}</TableCell>
                      <TableCell>{transaction.fromCurrency}</TableCell>
                      <TableCell>{transaction.toCurrency}</TableCell>
                      <TableCell>
                        {transaction.fromAmount.toLocaleString("tr-TR", {
                          maximumFractionDigits: 8,
                        })}
                      </TableCell>
                      <TableCell>
                        {transaction.toAmount.toLocaleString("tr-TR", {
                          maximumFractionDigits: 8,
                        })}
                      </TableCell>
                      <TableCell>{new Date(transaction.timestamp).toLocaleString("tr-TR")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
