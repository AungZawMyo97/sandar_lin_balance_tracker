import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET || "your-secret-key-here";
const encodedKey = new TextEncoder().encode(secretKey);

export async function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  let isValidSession = false;
  if (session) {
    try {
      await jwtVerify(session, encodedKey, { algorithms: ["HS256"] });
      isValidSession = true;
    } catch {
      console.log("Session invalid");
    }
  }

  const isLoginPage = pathname === "/users/login";

  if (!isLoginPage && !isValidSession) {
    return NextResponse.redirect(new URL("/users/login", request.url));
  }

  if (isLoginPage && isValidSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
