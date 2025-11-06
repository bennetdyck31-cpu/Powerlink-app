import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const Settings = () => {
  const [autoConnect, setAutoConnect] = useState(true)
  const [aes256, setAes256] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)

  const clearCache = () => {
    alert('Cache geleert! (Demo)')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Settings
          </h1>

          <div className="space-y-6">
            {/* Connection Settings */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-blue-400" />
                Connection
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-connect" className="text-base font-semibold">Auto-Connect</Label>
                  <p className="text-sm text-gray-400">Automatisch mit verfügbaren Geräten verbinden</p>
                </div>
                <Switch id="auto-connect" checked={autoConnect} onCheckedChange={setAutoConnect} />
              </div>
            </Card>

            {/* Security Settings */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-green-400" />
                Security
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="aes256" className="text-base font-semibold">AES-256 Encryption</Label>
                  <p className="text-sm text-gray-400">End-to-End Verschlüsselung aktiviert</p>
                </div>
                <Switch id="aes256" checked={aes256} onCheckedChange={setAes256} disabled className="opacity-50" />
              </div>
            </Card>

            {/* Notifications */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-yellow-400" />
                Notifications
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push" className="text-base font-semibold">Push Notifications</Label>
                  <p className="text-sm text-gray-400">Benachrichtigungen bei Task-Abschluss</p>
                </div>
                <Switch id="push" checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>
            </Card>

            {/* Data Management */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-orange-400" />
                Data
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Cache</Label>
                  <p className="text-sm text-gray-400">Temporäre Dateien und Logs löschen</p>
                </div>
                <Button variant="outline" className="text-orange-400 hover:text-orange-300" onClick={clearCache}>
                  Cache leeren
                </Button>
              </div>
            </Card>

            {/* App Info */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">App Info</h2>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Version</div>
                  <div className="text-lg font-bold">1.0.0</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Build</div>
                  <div className="text-lg font-bold">2025.11.03</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Platform</div>
                  <div className="text-lg font-bold">Web</div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Settings
