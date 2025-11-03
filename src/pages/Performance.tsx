import { motion } from 'framer-motion'
import { Clock, TrendingUp, Award, Zap, Cpu, HardDrive, Laptop, Smartphone } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const Performance = () => {
  const stats = [
    { label: 'Time Saved', value: '45 Min', icon: Clock, color: 'text-blue-400', bgGradient: 'from-blue-500/20 to-cyan-500/20' },
    { label: 'Speedup', value: '1.7x', icon: TrendingUp, color: 'text-purple-400', bgGradient: 'from-purple-500/20 to-pink-500/20' },
    { label: 'Completed Tasks', value: '12', icon: Award, color: 'text-green-400', bgGradient: 'from-green-500/20 to-emerald-500/20' },
    { label: 'Cluster Power', value: '8 Cores', icon: Zap, color: 'text-yellow-400', bgGradient: 'from-yellow-500/20 to-orange-500/20' },
  ]

  const devices = [
    { name: 'MacBook Pro', type: 'laptop', cpu: 65, gpu: 70, ram: 58 },
    { name: 'iPhone 15 Pro', type: 'phone', cpu: 48, gpu: 52, ram: 42 },
  ]

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

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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

          {/* Load Charts */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {devices.map((device) => (
              <Card key={device.name} className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center">
                    {device.type === 'laptop' ? <Laptop className="w-6 h-6 text-cyan-400" /> : <Smartphone className="w-6 h-6 text-purple-400" />}
                  </div>
                  <h3 className="text-xl font-bold">{device.name}</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">CPU</span>
                      <span className="text-cyan-400">{device.cpu}%</span>
                    </div>
                    <Progress value={device.cpu} indicatorClassName="bg-cyan-400" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">GPU</span>
                      <span className="text-purple-400">{device.gpu}%</span>
                    </div>
                    <Progress value={device.gpu} indicatorClassName="bg-purple-400" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">RAM</span>
                      <span className="text-green-400">{device.ram}%</span>
                    </div>
                    <Progress value={device.ram} indicatorClassName="bg-green-400" />
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
        </motion.div>
      </div>
    </div>
  )
}

export default Performance
