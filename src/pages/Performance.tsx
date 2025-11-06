import { motion } from 'framer-motion'
import { TrendingUp, Zap, Cpu, HardDrive, Laptop, Smartphone, Tablet, WifiOff } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useDevices } from '@/context/DeviceContext'

const Performance = () => {
  const { connectedDevices } = useDevices()
  const hasDevices = connectedDevices.length > 0

  // Stats nur anzeigen wenn Geräte verbunden sind
  const stats = hasDevices ? [
    { label: 'Speedup', value: `${connectedDevices.length}x`, icon: TrendingUp, color: 'text-purple-400', bgGradient: 'from-purple-500/20 to-pink-500/20' },
    { label: 'Connected Devices', value: `${connectedDevices.length}`, icon: Zap, color: 'text-yellow-400', bgGradient: 'from-yellow-500/20 to-orange-500/20' },
  ] : []

  const taskTypes = [
    { type: 'Video', percent: 40, color: 'bg-purple-500' },
    { type: 'ML', percent: 30, color: 'bg-pink-500' },
    { type: 'Image', percent: 20, color: 'bg-cyan-500' },
    { type: 'Other', percent: 10, color: 'bg-gray-500' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Performance
          </h1>

          {!hasDevices ? (
            // Leerer Zustand wenn keine Geräte verbunden
            <Card className="p-12">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <WifiOff className="w-10 h-10 text-gray-500" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-gray-300">Keine Geräte verbunden</h2>
                <p className="text-gray-400 mb-6">
                  Verbinde ein Gerät über den Dashboard oder Connect-Tab,<br />
                  um Performance-Statistiken anzuzeigen.
                </p>
                <a href="/" className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                  Zum Dashboard
                </a>
              </div>
            </Card>
          ) : (
            <>
              {/* Stats Grid - nur wenn Geräte verbunden */}
              <div className="grid grid-cols-2 gap-6 mb-12">
                {stats.map((stat, idx) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                    <Card className="p-6 hover:scale-105 transition-transform">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.bgGradient} flex items-center justify-center mb-4`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div className="text-2xl font-bold mb-1">{stat.value}</div>
                      <div className="text-xs text-gray-400">{stat.label}</div>
                    </Card>
                  </motion.div>
                ))}
              </div>

          {/* Load Charts - nur wenn Geräte verbunden */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {connectedDevices.map((device) => (
              <Card key={device.id} className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center">
                    {device.type === 'laptop' ? (
                      <Laptop className="w-6 h-6 text-cyan-400" />
                    ) : device.type === 'tablet' ? (
                      <Tablet className="w-6 h-6 text-blue-400" />
                    ) : (
                      <Smartphone className="w-6 h-6 text-purple-400" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold">{device.name}</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">CPU</span>
                      <span className="text-cyan-400">{Math.round(device.cpu)}%</span>
                    </div>
                    <Progress value={device.cpu} indicatorClassName="bg-cyan-400" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">GPU</span>
                      <span className="text-purple-400">{Math.round(device.gpu)}%</span>
                    </div>
                    <Progress value={device.gpu} indicatorClassName="bg-purple-400" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">RAM</span>
                      <span className="text-green-400">{Math.round(device.ram)}GB</span>
                    </div>
                    <Progress value={(device.ram / 16) * 100} indicatorClassName="bg-green-400" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

              {/* Task Type Bar */}
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6">Task Distribution</h2>
                <div className="space-y-4">
                  <div className="h-8 flex rounded-lg overflow-hidden">
                    {taskTypes.map((task) => (
                      <div key={task.type} className={`${task.color} flex items-center justify-center text-white text-sm font-semibold`} style={{ width: `${task.percent}%` }}>
                        {task.percent}%
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {taskTypes.map((task) => (
                      <div key={task.type} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${task.color}`} />
                        <span className="text-sm text-gray-400">{task.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Performance
