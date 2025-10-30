import { useState, useEffect, useRef } from "react"
import { Cpu, MonitorSmartphone, Download, X, Loader2, Activity, Share2, Video, Moon, Sun, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"
import jsPDF from "jspdf"
import { format } from "date-fns"

export function Dashboard() {
  const [showBenchmark, setShowBenchmark] = useState(false)
  const [benchmarkResult, setBenchmarkResult] = useState<{ cpu?: number; gpu?: number }>({})
  const [isRunning, setIsRunning] = useState({ cpu: false, gpu: false })
  const [liveData, setLiveData] = useState<{ cpu: any[]; gpu: any[] }>({ cpu: [], gpu: [] })
  const [isRecording, setIsRecording] = useState(false)
  const [isDark, setIsDark] = useState(true)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // Mock connected devices
  const connectedDevices = [
    { name: "iPhone 15 Pro", type: "phone" },
    { name: "MacBook Air M2", type: "laptop" }
  ]

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const runBenchmark = async (type: 'cpu' | 'gpu') => {
    const key = type
    setIsRunning(prev => ({ ...prev, [key]: true }))
    setLiveData(prev => ({ ...prev, [key]: [] }))
    setBenchmarkResult(prev => ({ ...prev, [key]: undefined }))

    const connected = connectedDevices.length
    const baseScore = type === 'cpu' ? 420 + Math.random() * 80 : 280 + Math.random() * 120
    let boost = 1

    if (connected >= 2) {
      const deviceBoost = connectedDevices.map(d => {
        const power = d.type === 'laptop' || d.type === 'desktop' ? 0.4 :
                      d.type === 'phone' ? 0.25 : 0.15
        return type === 'gpu' ? power * 1.1 : power
      }).reduce((a, b) => a + b, 0)
      boost = 1 + Math.min(0.8, deviceBoost)
    }

    const steps = 30
    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 100))
      const progress = i / steps
      const current = Math.round(baseScore * boost * progress)
      setLiveData(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), { step: i, score: current }]
      }))
    }

    const finalScore = Math.round(baseScore * boost)
    setBenchmarkResult(prev => ({ ...prev, [key]: finalScore }))
    setIsRunning(prev => ({ ...prev, [key]: false }))
  }

  const exportPDF = () => {
    const pdf = new jsPDF()
    const date = format(new Date(), 'dd.MM.yyyy HH:mm')
    pdf.setFontSize(22)
    pdf.text('PowerLink Benchmark Report', 20, 30)
    pdf.setFontSize(12)
    pdf.text(`Datum: ${date}`, 20, 50)
    pdf.text(`Geräte: ${connectedDevices.map(d => d.name).join(', ')}`, 20, 60)

    let y = 80
    ;(['cpu', 'gpu'] as const).forEach(type => {
      const score = benchmarkResult[type]
      const unit = type === 'cpu' ? 'Berechnungen/µs' : 'GFLOPS'
      if (score) {
        pdf.setFontSize(16)
        pdf.text(`${type.toUpperCase()}: ${score} ${unit}`, 20, y)
        y += 20
      }
    })

    pdf.save(`PowerLink_Benchmark_${date.replace(/[:.]/g, '-')}.pdf`)
  }

  const generateShareLink = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('benchmark', '1')
    navigator.clipboard.writeText(url.toString())
    alert('Link kopiert!')
  }

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
    const recorder = new MediaRecorder(stream)
    mediaRecorderRef.current = recorder
    chunksRef.current = []

    recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'powerlink-benchmark.webm'
      a.click()
    }

    recorder.start()
    setIsRecording(true)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
            PowerLink
          </h1>
          <p className="text-gray-300 mb-12">
            Verbinde iPhone + MacBook – und mach KI <strong className="text-cyan-400">80% schneller</strong>.
          </p>

          <Button
            onClick={() => setShowBenchmark(true)}
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 shadow-2xl text-lg px-8 py-6"
          >
            <Activity className="w-6 h-6 mr-3" />
            CPU & GPU Benchmark starten
          </Button>
        </div>
      </div>

      {showBenchmark && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-2xl p-6 max-w-5xl w-full border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-400" />
                PowerLink Benchmark
              </h3>
              <div className="flex gap-2">
                <Button onClick={generateShareLink} size="sm" variant="outline">
                  <Share2 className="w-4 h-4 mr-1" /> Teilen
                </Button>
                <Button onClick={exportPDF} size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-1" /> PDF
                </Button>
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  size="sm"
                  variant={isRecording ? "destructive" : "outline"}
                >
                  <Video className="w-4 h-4 mr-1" />
                  {isRecording ? 'Stop' : 'Record'}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowBenchmark(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <Button size="sm" variant="ghost" onClick={() => setIsDark(!isDark)}>
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>

            <Tabs defaultValue="cpu" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                <TabsTrigger value="cpu">CPU</TabsTrigger>
                <TabsTrigger value="gpu">GPU</TabsTrigger>
              </TabsList>

              {(['cpu', 'gpu'] as const).map(type => (
                <TabsContent key={type} value={type} className="mt-6 space-y-6">
                  {liveData[type]?.length > 0 && (
                    <div className="h-48 bg-gray-700 rounded-lg p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={liveData[type]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="step" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                          <Line type="monotone" dataKey="score" stroke={type === 'cpu' ? '#3b82f6' : '#10b981'} strokeWidth={3} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {benchmarkResult[type] ? (
                    <div className="text-center space-y-4">
                      <motion.div
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="text-6xl font-bold"
                        style={{ color: type === 'cpu' ? '#3b82f6' : '#10b981' }}
                      >
                        {benchmarkResult[type]}
                      </motion.div>
                      <p className="text-sm text-gray-400">
                        {type === 'cpu' ? 'Berechnungen / µs' : 'GFLOPS'}
                      </p>

                      {connectedDevices.length >= 2 && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 inline-block">
                          <p className="text-green-400 font-bold text-xl">
                            +{Math.round((benchmarkResult[type]! / (type === 'cpu' ? 450 : 320) - 1) * 100)}% schneller
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Button
                        onClick={() => runBenchmark(type)}
                        size="lg"
                        disabled={isRunning[type]}
                        className="bg-gradient-to-r from-gray-600 to-gray-500"
                      >
                        {isRunning[type] ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Läuft...
                          </>
                        ) : (
                          <>
                            {type === 'cpu' ? <Cpu className="w-5 h-5 mr-2" /> : <MonitorSmartphone className="w-5 h-5 mr-2" />}
                            {type.toUpperCase()} testen
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        </div>
      )}
    </>
  )
}
