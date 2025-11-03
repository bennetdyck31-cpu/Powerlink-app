import { useState } from 'react'
import { motion } from 'framer-motion'
import { Cable, Smartphone, Laptop, Loader2, Cpu, HardDrive, Battery } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const Connect = () => {
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [deviceFound, setDeviceFound] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<any>(null)

  const startScan = () => {
    setScanning(true)
    setScanProgress(0)
    setDeviceFound(false)
    setDeviceInfo(null)

    // Simuliere Scan
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setScanning(false)
          setDeviceFound(true)
          setDeviceInfo({
            name: 'iPhone 15 Pro',
            model: 'Pro Max',
            type: 'phone',
            cpu: '6 Kerne',
            ram: '8 GB',
            battery: 85
          })
          return 100
        }
        return prev + 5
      })
    }, 150)
  }

  const connectDevice = () => {
    alert('Gerät verbunden! (Demo)')
    window.location.href = '/'
  }

  const cancelScan = () => {
    setScanning(false)
    setScanProgress(0)
    setDeviceFound(false)
    setDeviceInfo(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 80, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Hero */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
            <Cable className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Gerät verbinden
          </h1>
          <p className="text-xl text-gray-300">
            Stecke dein Kabel ein und lass uns dein Gerät erkennen
          </p>
        </motion.div>

        {/* Scan Interface */}
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8">
            <h2 className="text-xl font-bold mb-6 text-center">
              Kabel einstecken
            </h2>

            {!scanning && !deviceFound && (
              <div className="text-center py-12">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                  onClick={startScan}
                >
                  <Cable className="mr-2 h-5 w-5" />
                  Scan starten
                </Button>
              </div>
            )}

            {scanning && (
              <div className="py-12">
                <div className="flex justify-center mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-16 h-16 text-cyan-400" />
                  </motion.div>
                </div>
                <Progress value={scanProgress} className="h-2 mb-4" />
                <p className="text-center text-gray-400">
                  Scanne nach Geräten... {scanProgress}%
                </p>
                <div className="text-center mt-6">
                  <Button variant="outline" onClick={cancelScan}>
                    Abbrechen
                  </Button>
                </div>
              </div>
            )}

            {deviceFound && deviceInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Device Card */}
                <Card className="p-6 bg-gray-700">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                      {deviceInfo.type === 'phone' ? (
                        <Smartphone className="w-8 h-8 text-purple-400" />
                      ) : (
                        <Laptop className="w-8 h-8 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{deviceInfo.name}</h3>
                      <p className="text-gray-400">{deviceInfo.model}</p>
                    </div>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-800 rounded-lg">
                      <Cpu className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-400">CPU</div>
                      <div className="text-lg font-bold">{deviceInfo.cpu}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-800 rounded-lg">
                      <HardDrive className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-400">RAM</div>
                      <div className="text-lg font-bold">{deviceInfo.ram}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-800 rounded-lg">
                      <Battery className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-400">Battery</div>
                      <div className="text-lg font-bold">{deviceInfo.battery}%</div>
                    </div>
                  </div>

                  {/* Battery Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Batteriestatus</span>
                      <span className="text-green-400">{deviceInfo.battery}%</span>
                    </div>
                    <Progress value={deviceInfo.battery} indicatorClassName="bg-green-400" />
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    size="lg"
                    onClick={connectDevice}
                  >
                    Verbinden
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={cancelScan}
                  >
                    Abbrechen
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
