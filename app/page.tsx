import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">SafeMoneyRobot - Telegram Kripto Bot</CardTitle>
          <CardDescription>Kripto para dönüşümleri ve fiyat takibi için Telegram botu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Bu uygulama, Telegram üzerinden kripto para dönüşümleri yapmanıza ve fiyatları takip etmenize olanak tanır.
          </p>

          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium mb-2">Özellikler:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Güncel kripto para fiyatlarını görüntüleme</li>
              <li>TRY ve kripto paralar arasında dönüşüm yapma</li>
              <li>İşlem geçmişini takip etme</li>
              <li>TRY-TRX dönüşüm oranlarını görüntüleme</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Link href="/transactions" className="w-full sm:w-auto">
            <Button className="w-full">İşlem Geçmişi</Button>
          </Link>
          <Link href="/admin" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              Admin Paneli
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
