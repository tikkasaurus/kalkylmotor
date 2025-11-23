import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient.ts'
import { ThemeProvider } from './lib/theme-context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
