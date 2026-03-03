export { auth as middleware } from "@/lib/auth";

export const config = {
    matcher: ["/admin/:path*", "/dashboard/:path*", "/login", "/register"],
};
