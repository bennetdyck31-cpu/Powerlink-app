import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Connect from './pages/Connect'
import Tasks from './pages/Tasks'
import Performance from './pages/Performance'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  )
}
