import '../App.css'
import { CalculationsPage } from '@/features/calculations/pages/CalculationsPage'
import { AuthGuard } from '@/components/AuthGuard'

/**
 * Main application shell
 * 
 * This component serves as the root of the application.
 * In the future, this is where you would add:
 * - React Router or TanStack Router
 * - Global providers (TanStack Query, theme, auth, etc.)
 * - Layout components
 * - Error boundaries
 */
function App() {
  return (
    <AuthGuard>
      <CalculationsPage />
    </AuthGuard>
  )
}

export default App;

