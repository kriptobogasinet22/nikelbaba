import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Admin sayfasına erişim kontrolü burada yapılabilir
  // Şimdilik basit bir şifre koruması kullandığımız için middleware'de ek kontrol yapmıyoruz
  return NextResponse.next()
}
