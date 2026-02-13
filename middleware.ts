import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // 🛡️ LAYER 1: PROTEKSI RUANG KOMANDO (ADMIN)
    // Jika akses jalur "/admin" TAPI pangkat bukan "ADMIN" -> TENDANG ke Dashboard
    if (req.nextUrl.pathname.startsWith("/admin") && req.nextauth.token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      // 🛡️ LAYER 2: CEK KARTU AKSES (LOGIN)
      // Return true = Boleh lewat (Sudah Login)
      // Return false = Ditahan (Belum Login) -> Otomatis dilempar ke /login
      authorized: ({ token }) => !!token, 
    },
  }
);

// 🚧 ZONA YANG DIJAGA KETAT (MATCHER)
export const config = {
  matcher: [
    "/dashboard/:path*", // Jaga seluruh area Dashboard
    "/admin/:path*"      // Jaga seluruh area Admin
  ],
};