import { proxy, config as proxyConfig } from "@/proxy"

export const middleware = proxy
export const config = {
  matcher: [
    ...proxyConfig.matcher,
    "/api/admin/:path*",
  ],
}
