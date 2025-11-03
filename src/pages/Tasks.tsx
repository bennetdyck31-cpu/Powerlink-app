import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Video, Image as ImageIcon, Brain, Trash2, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

type TaskType = 'video' | 'image' | 'ml'
type TaskStatus = 'processing' | 'completed' | 'queued'

interface Task {
  id: number
  title: string
  type: TaskType
  status: TaskStatus
  progress: number
  priority: 'low' | 'medium' | 'high'
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Video Rendering', type: 'video', status: 'processing', progress: 65, priority: 'high' },
    { id: 2, title: 'Image Upscaling', type: 'image', status: 'processing', progress: 42, priority: 'medium' },
    { id: 3, title: 'ML Training', type: 'ml', status: 'completed', progress: 100, priority: 'high' },
  ])
  const [filter, setFilter] = useState<'all' | TaskStatus>('all')
  const [open, setOpen] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', type: 'video', priority: 'medium' })

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev => prev.map(task => {
        if (task.status === 'processing' && task.progress < 100) {
          return { ...task, progress: Math.min(100, task.progress + 2) }
        }
        if (task.progress >= 100 && task.status === 'processing') {
          return { ...task, status: 'completed' }
        }
        return task
      }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const createTask = () => {
    const task: Task = {
      id: Date.now(),
      title: newTask.title || 'New Task',
      type: newTask.type as TaskType,
      status: 'processing',
      progress: 0,
      priority: newTask.priority as any
    }
    setTasks([...tasks, task])
    setNewTask({ title: '', type: 'video', priority: 'medium' })
    setOpen(false)
  }

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

  const typeIcons = { video: Video, image: ImageIcon, ml: Brain }
  const statusColors = {
    processing: 'default',
    completed: 'success',
    queued: 'warning'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 p-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Tasks
          </h1>

          <div className="flex justify-between items-center mb-6">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="processing">Processing</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-cyan-500 to-purple-500">
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="Task name" />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select value={newTask.type} onValueChange={v => setNewTask({...newTask, type: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="ml">ML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={newTask.priority} onValueChange={v => setNewTask({...newTask, priority: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={createTask} className="w-full">Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {filteredTasks.map(task => {
              const Icon = typeIcons[task.type]
              return (
                <motion.div key={task.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <Card className="p-5 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{task.title}</h3>
                          <Badge variant={statusColors[task.status] as any} className="mt-1">
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Progress value={task.progress} className="h-2" />
                    <div className="flex justify-between text-sm text-gray-400 mt-2">
                      <span>{task.priority} priority</span>
                      <span>{task.progress}%</span>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Tasks
