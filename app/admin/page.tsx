"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, BarChart3, Users, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Transaction {
  id: string
  userId: number
  fromCurrency: string
  toCurrency: string
  fromAmount: number
  toAmount: number
  timestamp: string
}

interface UserSummary {
  userId: number
  totalTransactions: number
  currencies: Set<string>
  totalVolumeTRY: number
  lastActive: string
}

export default function AdminPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [filterCurrency, setFilterCurrency] = useState<string>("all")
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)

  // Güvenli bir admin şifresi - gerçek uygulamada çevre değişkeni olarak saklanmalı
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123"

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      setAuthError(null)
      // Başarılı girişi yerel depolamada sakla (24 saat geçerli)
      const expiryTime = Date.now() + 24 * 60 * 60 * 1000
      localStorage.setItem("adminAuth", JSON.stringify({ authenticated: true, expiry: expiryTime }))
    } else {
      setAuthError("Geçersiz şifre!")
    }
  }

  useEffect(() => {
    // Yerel depolamadan kimlik doğrulama durumunu kontrol et
    const storedAuth = localStorage.getItem("adminAuth")
    if (storedAuth) {
      const { authenticated, expiry } = JSON.parse(storedAuth)
      if (authenticated && expiry > Date.now()) {
        setAuthenticated(true)
      } else {
        localStorage.removeItem("adminAuth")
      }
    }
  }, [])

  useEffect(() => {
    if (!authenticated) return

    async function fetchTransactions() {
      try {
        setLoading(true)
        const response = await fetch("/api/transactions")
        if (!response.ok) {
          throw new Error("Failed to fetch transactions")
        }
        const data = await response.json()
        setTransactions(data)
      } catch (err) {
        setError("İşlem geçmişi yüklenirken bir hata oluştu.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [authenticated])

  // Kullanıcı bazlı özet istatistikler
  const userSummaries = useMemo(() => {
    const summaries = new Map<number, UserSummary>()

    transactions.forEach((transaction) => {
      const { userId, fromCurrency, toCurrency, fromAmount, toAmount, timestamp } = transaction

      if (!summaries.has(userId)) {
        summaries.set(userId, {
          userId,
          totalTransactions: 0,
          currencies: new Set<string>(),
          totalVolumeTRY: 0,
          lastActive: timestamp,
        })
      }

      const summary = summaries.get(userId)!
      summary.totalTransactions += 1

      if (fromCurrency === "TRY") {
        summary.totalVolumeTRY += fromAmount
      } else if (toCurrency === "TRY") {
        summary.totalVolumeTRY += toAmount
      }

      summary.currencies.add(fromCurrency)
      summary.currencies.add(toCurrency)

      // En son işlem tarihini güncelle
      const transactionDate = new Date(timestamp)
      const lastActiveDate = new Date(summary.lastActive)
      if (transactionDate > lastActiveDate) {
        summary.lastActive = timestamp
      }
    })

    return Array.from(summaries.values())
  }, [transactions])

  // Para birimleri listesi
  const currencies = useMemo(() => {
    const currencySet = new Set<string>()
    transactions.forEach((t) => {
      currencySet.add(t.fromCurrency)
      currencySet.add(t.toCurrency)
    })
    return Array.from(currencySet)
  }, [transactions])

  // Filtreleme fonksiyonu
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        transaction.userId.toString().includes(searchLower) ||
        transaction.fromCurrency.toLowerCase().includes(searchLower) ||
        transaction.toCurrency.toLowerCase().includes(searchLower) ||
        transaction.fromAmount.toString().includes(searchLower) ||
        transaction.toAmount.toString().includes(searchLower) ||
        new Date(transaction.timestamp).toLocaleString("tr-TR").toLowerCase().includes(searchLower)

      const matchesCurrency =
        filterCurrency === "all" ||
        transaction.fromCurrency === filterCurrency ||
        transaction.toCurrency === filterCurrency

      return matchesSearch && matchesCurrency
    })
  }, [transactions, searchTerm, filterCurrency])

  // İstatistikler
  const stats = useMemo(() => {
    if (transactions.length === 0)
      return {
        totalTransactions: 0,
        uniqueUsers: 0,
        totalVolumeTRY: 0,
        mostPopularCurrency: "-",
      }

    const uniqueUsers = new Set(transactions.map((t) => t.userId)).size

    let totalVolumeTRY = 0
    const currencyCount: Record<string, number> = {}

    transactions.forEach((t) => {
      if (t.fromCurrency === "TRY") {
        totalVolumeTRY += t.fromAmount
      } else if (t.toCurrency === "TRY") {
        totalVolumeTRY += t.toAmount
      }

      currencyCount[t.fromCurrency] = (currencyCount[t.fromCurrency] || 0) + 1
      currencyCount[t.toCurrency] = (currencyCount[t.toCurrency] || 0) + 1
    })

    let mostPopularCurrency = "-"
    let maxCount = 0

    Object.entries(currencyCount).forEach(([currency, count]) => {
      if (count > maxCount) {
        mostPopularCurrency = currency
        maxCount = count
      }
    })

    return {
      totalTransactions: transactions.length,
      uniqueUsers,
      totalVolumeTRY,
      mostPopularCurrency,
    }
  }, [transactions])

  const handleLogout = () => {
    setAuthenticated(false)
    localStorage.removeItem("adminAuth")
  }

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Admin Girişi</CardTitle>
            <CardDescription>Lütfen admin şifresini girin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Şifre"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLogin()
                    }
                  }}
                />
                {authError && <p className="text-sm text-red-500">{authError}</p>}
              </div>
              <Button className="w-full" onClick={handleLogin}>
                Giriş Yap
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Paneli</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Çıkış Yap
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam İşlem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Benzersiz Kullanıcı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam TRY Hacmi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVolumeTRY.toLocaleString("tr-TR")} ₺</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En Popüler Para Birimi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mostPopularCurrency}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList className="mb-4">
          <TabsTrigger value="transactions">
            <BarChart3 className="h-4 w-4 mr-2" />
            İşlemler
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Kullanıcılar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>İşlem Geçmişi</CardTitle>
              <CardDescription>Tüm kullanıcıların dönüşüm işlemleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
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
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={filterCurrency} onValueChange={setFilterCurrency}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Para Birimi Filtrele" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Para Birimleri</SelectItem>
                      {currencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  {searchTerm || filterCurrency !== "all"
                    ? "Aramanızla eşleşen işlem bulunamadı."
                    : "Henüz işlem kaydı bulunmuyor."}
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
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Kullanıcı Özeti</CardTitle>
              <CardDescription>Kullanıcı bazlı işlem istatistikleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-6">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Kullanıcı ara..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : userSummaries.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">Henüz kullanıcı kaydı bulunmuyor.</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kullanıcı ID</TableHead>
                        <TableHead>İşlem Sayısı</TableHead>
                        <TableHead>Kullanılan Para Birimleri</TableHead>
                        <TableHead>Toplam TRY Hacmi</TableHead>
                        <TableHead>Son İşlem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userSummaries
                        .filter((user) => user.userId.toString().includes(searchTerm))
                        .map((user) => (
                          <TableRow key={user.userId}>
                            <TableCell>{user.userId}</TableCell>
                            <TableCell>{user.totalTransactions}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {Array.from(user.currencies).map((currency) => (
                                  <Badge key={currency} variant="outline">
                                    {currency}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>{user.totalVolumeTRY.toLocaleString("tr-TR")} ₺</TableCell>
                            <TableCell>{new Date(user.lastActive).toLocaleString("tr-TR")}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
