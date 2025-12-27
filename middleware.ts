import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET || "your-secret-key-here";
const encodedKey = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  // 1. Check for the session cookie
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  // 2. Verify Session
  let isValidSession = false;
  if (session) {
    try {
      await jwtVerify(session, encodedKey, { algorithms: ["HS256"] });
      isValidSession = true;
    } catch (err) {
      console.log("Session invalid");
    }
  }

  // 3. Define Logic
  const isLoginPage = pathname === "/users/login";

  // Scenario A: Not Logged In + Trying to access Dashboard -> Go to Login
  if (!isLoginPage && !isValidSession) {
    return NextResponse.redirect(new URL("/users/login", request.url));
  }

  // Scenario B: Logged In + Trying to access Login -> Go to Dashboard
  if (isLoginPage && isValidSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Scenario C: Allow the request to continue normally
  return NextResponse.next();
}

// 4. Matcher (Don't run on static files or API images)
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
