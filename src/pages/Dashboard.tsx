import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Laptop, 
  Smartphone, 
  Clock, 
  TrendingUp, 
  Gauge, 
  Zap, 
  Power,
  Download,
  Share2,
  Video,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const Dashboard = () => {
  const [showBenchmark, setShowBenchmark] = useState(false)
  const [benchmarkRunning, setBenchmarkRunning] = useState(false)
  const [benchmarkScore, setBenchmarkScore] = useState(0)

  const connectedDevices = [
    { id: 1, name: 'MacBook Pro', type: 'laptop', cpu: 65, gpu: 72, model: '2024' },
    { id: 2, name: 'iPhone 15 Pro', type: 'phone', cpu: 48, gpu: 52, model: 'Pro Max' }
  ]

  const stats = [
    { 
      label: 'Connected Devices', 
      value: connectedDevices.length, 
      icon: Laptop, 
      color: 'text-green-400',
      bgGradient: 'from-green-500/20 to-emerald-500/20'
    },
    { 
      label: 'Time Saved', 
      value: '45 Min', 
      icon: Clock, 
      color: 'text-blue-400',
      bgGradient: 'from-blue-500/20 to-cyan-500/20'
    },
    { 
      label: 'Speedup', 
      value: '1.7x', 
      icon: TrendingUp, 
      color: 'text-purple-400',
      bgGradient: 'from-purple-500/20 to-pink-500/20'
    },
    { 
      label: 'CPU Usage', 
      value: '72%', 
      icon: Gauge, 
      color: 'text-cyan-400',
      bgGradient: 'from-cyan-500/20 to-blue-500/20',
      progress: 72
    }
  ]

  const runBenchmark = () => {
    setBenchmarkRunning(true)
    setBenchmarkScore(0)
    
    const interval = setInterval(() => {
      setBenchmarkScore(prev => {
        if (prev >= 789) {
          clearInterval(interval)
          setBenchmarkRunning(false)
          return 789
        }
        return prev + 15
      })
    }, 50)
  }

  const dots = Array.from({ length: 120 }, (_, i) => {
    const angle = (i / 120) * Math.PI * 2
    const radius = 180
    const x = 200 + radius * Math.cos(angle)
    const y = 200 + radius * Math.sin(angle)
    
    return (
      <motion.circle
        key={i}
        cx={x}
        cy={y}
        r="3"
        fill="#3b82f6"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0.2, 0.8, 0.2],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 2,
          delay: i * 0.01,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
    )
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10">
        <motion.div 
          className="min-h-screen flex flex-col items-center justify-center px-4 py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4">
            PowerLink
          </h1>
          <p className="text-2xl text-gray-300 mb-12">
            Verbinde Geräte – 80% schneller AI
          </p>

          <Button
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 mb-20"
            onClick={() => setShowBenchmark(true)}
          >
            <Activity className="mr-2 h-5 w-5" />
            Benchmark starten
          </Button>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mb-16">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-6 hover:scale-102 hover:border-cyan-400 transition-all cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.bgGradient} flex items-center justify-center mb-4`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                  {stat.progress && (
                    <Progress value={stat.progress} className="h-3 mt-3" />
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="flex flex-col items-center mb-12"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="relative w-96 h-96 flex items-center justify-center">
              <svg width="400" height="400" className="absolute">
                <motion.g
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  style={{ transformOrigin: "200px 200px" }}
                >
                  {dots}
                </motion.g>
              </svg>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <motion.div
                  className="text-5xl font-bold text-blue-400"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Verbunden
                </motion.div>
                <p className="text-lg text-gray-400 mt-2">
                  Rechenleistung wird geteilt
                </p>
              </div>
            </div>
          </motion.div>

          <Card className="w-full max-w-4xl p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Smartphone className="mr-3 h-6 w-6 text-cyan-400" />
              Connected Devices
            </h2>
            <div className="space-y-4">
              {connectedDevices.map((device) => (
                <Card key={device.id} className="p-5 bg-gray-700 hover:bg-gray-600 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                        {device.type === 'laptop' ? (
                          <Laptop className="w-6 h-6 text-blue-400" />
                        ) : (
                          <Smartphone className="w-6 h-6 text-purple-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{device.name}</div>
                        <div className="text-sm text-gray-400">{device.model}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      <Power className="h-4 w-4 mr-2" />
                      Trennen
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">CPU</span>
                        <span className="text-cyan-400">{device.cpu}%</span>
                      </div>
                      <Progress value={device.cpu} className="h-1.5" indicatorClassName="bg-cyan-400" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">GPU</span>
                        <span className="text-purple-400">{device.gpu}%</span>
                      </div>
                      <Progress value={device.gpu} className="h-1.5" indicatorClassName="bg-purple-400" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 shadow-xl"
              onClick={() => setShowBenchmark(true)}
            >
              <Activity className="mr-2 h-5 w-5" />
              CPU & GPU Benchmark starten
            </Button>
            <p className="text-sm text-gray-400 mt-3">
              Externe Tools messen nicht die Power – unser Test tut's!
            </p>
          </div>
        </motion.div>
      </div>

      {showBenchmark && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-3xl p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Benchmark</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowBenchmark(false)
                  setBenchmarkRunning(false)
                  setBenchmarkScore(0)
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <Tabs defaultValue="cpu" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="cpu">CPU Test</TabsTrigger>
                <TabsTrigger value="gpu">GPU Test</TabsTrigger>
              </TabsList>
              
              <TabsContent value="cpu" className="space-y-6">
                {!benchmarkRunning && benchmarkScore === 0 && (
                  <Button 
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    onClick={runBenchmark}
                  >
                    <Activity className="mr-2 h-5 w-5" />
                    Test starten
                  </Button>
                )}

                {benchmarkRunning && (
                  <div className="flex flex-col items-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mb-4"
                    />
                    <p className="text-gray-400">Benchmark läuft...</p>
                  </div>
                )}

                {benchmarkScore > 0 && !benchmarkRunning && (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <div className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
                        {benchmarkScore}
                      </div>
                      <Badge variant="success" className="text-lg px-4 py-1">
                        +72% Boost
                      </Badge>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-6">
                      <div className="h-48 flex items-end gap-2">
                        {Array.from({ length: 10 }, (_, i) => (
                          <motion.div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-t"
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.min(100, (benchmarkScore / 789) * 100 * (i + 1) / 10)}%` }}
                            transition={{ delay: i * 0.05 }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Share2 className="mr-2 h-4 w-4" />
                        Teilen
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Video className="mr-2 h-4 w-4" />
                        Aufnehmen
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="gpu" className="space-y-6">
                <div className="text-center py-12 text-gray-400">
                  GPU Test - Coming Soon
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
