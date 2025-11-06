import './index.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ConnectScan from './pages/ConnectScan'
import Performance from './pages/Performance'
import Settings from './pages/Settings'
import { DeviceProvider } from './context/DeviceContext'

export default function App() {
  return (
    <DeviceProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Connect route nur für QR-Code Scanning */}
            <Route path="/connect" element={<ConnectScan />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </DeviceProvider>
  )
}
