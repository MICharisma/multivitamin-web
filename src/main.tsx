import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router"
import { router } from "./routes/router"
import "./index.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Artifacts change only when a multivitamin is rebuilt; the manifest's version stamp
      // is part of every per-example query key, so a refreshed manifest invalidates them.
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
