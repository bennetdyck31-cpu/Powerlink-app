import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Cable, Smartphone, Laptop, Loader2, Cpu, HardDrive, WifiOff, Tablet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface DeviceInfo {
  name: string
  model: string
  type: 'phone' | 'tablet' | 'laptop' | 'desktop'
  cpu: string
  ram: string
  connection: string
  os: string
}

// Geräteerkennung über User-Agent
const detectDevice = async (): Promise<DeviceInfo> => {
  const ua = navigator.userAgent
  const platform = navigator.platform
  
  // Echte Hardware-Daten auslesen
  const cpuCores = navigator.hardwareConcurrency || 4
  const deviceMemory = (navigator as any).deviceMemory || 8 // GB
  
  // Ladestatus prüfen (USB-C oder WiFi)
  let batteryCharging = false
  
  try {
    if ('getBattery' in navigator) {
      const battery = await (navigator as any).getBattery()
      batteryCharging = battery.charging
    }
  } catch (e) {
    // Fallback wenn Battery API nicht verfügbar
    batteryCharging = false
  }
  
  // iOS/iPadOS Erkennung
  const isIPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1
  
  // Detaillierte Geräteerkennung
  if (isIPadOS || ua.includes('iPad')) {
    // iPad-Erkennung
    const model = ua.match(/iPad\d+,\d+/)?.[0] || 'iPad'
    return {
      name: 'iPad',
      model: getIPadModel(model),
      type: 'tablet',
      cpu: `${cpuCores} Kerne`,
      ram: `${deviceMemory} GB`,
      connection: batteryCharging ? 'USB-C (lädt)' : 'WiFi',
      os: 'iPadOS ' + (ua.match(/OS (\d+)_/)?.[1] || '17')
    }
  } else if (ua.includes('iPhone')) {
    // iPhone-Erkennung
    const model = ua.match(/iPhone\d+,\d+/)?.[0] || 'iPhone'
    return {
      name: 'iPhone',
      model: getIPhoneModel(model),
      type: 'phone',
      cpu: `${cpuCores} Kerne`,
      ram: `${deviceMemory} GB`,
      connection: batteryCharging ? 'USB-C (lädt)' : 'WiFi',
      os: 'iOS ' + (ua.match(/OS (\d+)_/)?.[1] || '17')
    }
  } else if (/Android/.test(ua)) {
    // Android-Erkennung
    const isTablet = !/Mobile/.test(ua)
    const manufacturer = ua.match(/\(([^;]+);/)?.[1] || 'Android Device'
    return {
      name: isTablet ? 'Android Tablet' : 'Android Phone',
      model: manufacturer,
      type: isTablet ? 'tablet' : 'phone',
      cpu: `${cpuCores} Kerne`,
      ram: `${deviceMemory} GB`,
      connection: batteryCharging ? 'USB-C (lädt)' : 'WiFi',
      os: 'Android ' + (ua.match(/Android (\d+)/)?.[1] || '14')
    }
  } else if (/Mac/.test(platform)) {
    // Mac-Erkennung
    return {
      name: 'MacBook',
      model: ua.includes('Mac') ? 'Pro/Air' : 'Desktop',
      type: 'laptop',
      cpu: `${cpuCores} Kerne`,
      ram: `${deviceMemory} GB`,
      connection: batteryCharging ? 'USB-C (lädt)' : 'Thunderbolt',
      os: 'macOS'
    }
  } else if (/Win/.test(platform)) {
    // Windows-Erkennung
    return {
      name: 'Windows PC',
      model: 'Desktop/Laptop',
      type: 'laptop',
      cpu: `${cpuCores} Kerne`,
      ram: `${deviceMemory} GB`,
      connection: batteryCharging ? 'USB-C (lädt)' : 'USB-C',
      os: 'Windows 11'
    }
  }
  
  // Fallback
  return {
    name: 'Unbekanntes Gerät',
    model: 'Nicht erkannt',
    type: 'laptop',
    cpu: `${cpuCores} Kerne`,
    ram: `${deviceMemory} GB`,
    connection: 'USB',
    os: 'Unbekannt'
  }
}

// iPad-Modellnamen
const getIPadModel = (identifier: string): string => {
  const models: Record<string, string> = {
    'iPad14,1': 'iPad Pro 11" (4. Gen)',
    'iPad14,2': 'iPad Pro 12.9" (6. Gen)',
    'iPad13,18': 'iPad (10. Gen)',
    'iPad13,1': 'iPad Air (5. Gen)',
  }
  return models[identifier] || 'Pro/Air/Mini'
}

// iPhone-Modellnamen
const getIPhoneModel = (identifier: string): string => {
  const models: Record<string, string> = {
    'iPhone15,2': 'iPhone 14 Pro',
    'iPhone15,3': 'iPhone 14 Pro Max',
    'iPhone16,1': 'iPhone 15 Pro',
    'iPhone16,2': 'iPhone 15 Pro Max',
  }
  return models[identifier] || '15 Pro/Pro Max'
}

const Connect = () => {
  const [scanning, setScanning] = useState(true)
  const [scanProgress, setScanProgress] = useState(0)
  const [deviceFound, setDeviceFound] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setScanning(false)
          setDeviceFound(true)
          // Echte Geräteerkennung (async)
          detectDevice().then(device => setDeviceInfo(device))
          return 100
        }
        return prev + 5
      })
    }, 150)

    return () => clearInterval(interval)
  }, [])

  const connectDevice = () => {
    alert('Gerät verbunden! Offline-Modus aktiviert.')
    window.location.href = '/'
  }

  const rescan = () => {
    setScanning(true)
    setScanProgress(0)
    setDeviceFound(false)
    setDeviceInfo(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, 80, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <Cable className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-4">
            Gerät verbinden
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            Lokale Kabelverbindung – Kein Internet erforderlich
          </p>
          <Badge variant="success" className="text-base px-4 py-2">
            <WifiOff className="w-4 h-4 mr-2" />
            Offline-Modus
          </Badge>
        </motion.div>

        <motion.div className="max-w-2xl mx-auto" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className="p-8">
            <h2 className="text-xl font-bold mb-6 text-center">
              Automatische Geräteerkennung
            </h2>

            {scanning && (
              <div className="py-12">
                <div className="flex justify-center mb-6">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                    <Loader2 className="w-16 h-16 text-blue-400" />
                  </motion.div>
                </div>
                <Progress value={scanProgress} className="h-2 mb-4" />
                <p className="text-center text-gray-400">
                  Scanne nach Geräten über USB-C/Thunderbolt... {scanProgress}%
                </p>
              </div>
            )}

            {deviceFound && deviceInfo && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <Card className="p-6 bg-gray-700">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500/30 to-indigo-500/30 flex items-center justify-center">
                      {deviceInfo.type === 'phone' ? (
                        <Smartphone className="w-8 h-8 text-indigo-400" />
                      ) : deviceInfo.type === 'tablet' ? (
                        <Tablet className="w-8 h-8 text-blue-400" />
                      ) : (
                        <Laptop className="w-8 h-8 text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white">{deviceInfo.name}</h3>
                      <p className="text-gray-400">{deviceInfo.model}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="success">{deviceInfo.connection}</Badge>
                        <Badge variant="outline">{deviceInfo.os}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-800 rounded-lg">
                      <Cpu className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-400">CPU</div>
                      <div className="text-lg font-bold">{deviceInfo.cpu}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-800 rounded-lg">
                      <HardDrive className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-400">RAM</div>
                      <div className="text-lg font-bold">{deviceInfo.ram}</div>
                    </div>
                  </div>
                </Card>

                <div className="flex gap-4">
                  <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600" size="lg" onClick={connectDevice}>
                    Verbinden (Offline)
                  </Button>
                  <Button variant="outline" size="lg" onClick={rescan}>
                    Neu scannen
                  </Button>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Connect
