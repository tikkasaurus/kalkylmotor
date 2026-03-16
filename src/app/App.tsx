import '../App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProjectsPage } from '@/features/calculations/pages/ProjectsPage'
import { SingleProjectPage } from '@/features/calculations/pages/SingleProjectPage'
import { AuthGuard } from '@/components/AuthGuard'
import { ToastContainer } from '@/components/ui/toast'

/**
 * Main application shell
 *
 * Routes (supports iframe with base path):
 * - / - All calculations grouped by project
 * - /project/:projectId - Single project view (queries backend with projectId)
 *
 * Note: All non-existent routes redirect to the base path (/)
 * Supports iframe usage - can be embedded at any base path like /some/path/project/123
 */
function App() {
  // Get base path for iframe support
  // Allows the app to work when embedded in an iframe at a custom base path
  const getBasename = () => {
    const path = window.location.pathname
    // Check if we're in a subdirectory (for iframe usage)
    // Example: /custom/path/project/123 -> basename: /custom/path
    if (path.includes('/project/')) {
      const parts = path.split('/').filter(Boolean)
      const projectIndex = parts.findIndex(p => p === 'project')
      if (projectIndex > 0) {
        return '/' + parts.slice(0, projectIndex).join('/')
      }
    }
    return undefined
  }

  const basename = getBasename()

  return (
    <AuthGuard>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<ProjectsPage />} />
          <Route path="/project/:projectId" element={<SingleProjectPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </AuthGuard>
  )
}

export default App;

