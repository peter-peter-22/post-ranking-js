import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Infinity,
            refetchOnWindowFocus: false,
            gcTime: Infinity,
            retry: false
        }
    }
})

export default function TanstackProvider({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}