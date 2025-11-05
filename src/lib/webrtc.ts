import Peer, { DataConnection } from 'peerjs'

export interface DeviceInfo {
  id: string
  name: string
  type: 'phone' | 'tablet' | 'laptop' | 'desktop'
  cpu: number
  gpu: number
  ram: number
  model: string
  os: string
}

export interface RTCMessage {
  type: 'device-info' | 'performance-update' | 'ping' | 'pong'
  data: any
  timestamp: number
}

class WebRTCManager {
  private peer: Peer | null = null
  private connections: Map<string, DataConnection> = new Map()
  private localDeviceInfo: DeviceInfo | null = null
  private onDeviceConnected?: (deviceId: string, info: DeviceInfo) => void
  private onDeviceDisconnected?: (deviceId: string) => void
  private onPerformanceUpdate?: (deviceId: string, data: any) => void

  constructor() {
    this.initializeLocalDeviceInfo()
  }

  private initializeLocalDeviceInfo() {
    const userAgent = navigator.userAgent
    let deviceType: 'phone' | 'tablet' | 'laptop' | 'desktop' = 'desktop'
    let os = 'Unknown'
    let model = 'Unknown Device'

    // Detect OS
    if (/iPhone/.test(userAgent)) {
      deviceType = 'phone'
      os = 'iOS'
      model = this.getIPhoneModel(userAgent)
    } else if (/iPad/.test(userAgent)) {
      deviceType = 'tablet'
      os = 'iOS'
      model = this.getIPadModel(userAgent)
    } else if (/Android/.test(userAgent)) {
      if (/Mobile/.test(userAgent)) {
        deviceType = 'phone'
      } else {
        deviceType = 'tablet'
      }
      os = 'Android'
      model = this.getAndroidModel(userAgent)
    } else if (/Macintosh/.test(userAgent)) {
      deviceType = 'laptop'
      os = 'macOS'
      model = 'Mac'
    } else if (/Windows/.test(userAgent)) {
      deviceType = 'desktop'
      os = 'Windows'
      model = 'Windows PC'
    } else if (/Linux/.test(userAgent)) {
      deviceType = 'desktop'
      os = 'Linux'
      model = 'Linux PC'
    }

    this.localDeviceInfo = {
      id: this.generateDeviceId(),
      name: model,
      type: deviceType,
      cpu: 0,
      gpu: 0,
      ram: (navigator as any).deviceMemory || 4,
      model: model,
      os: os
    }
  }

  private getIPhoneModel(ua: string): string {
    if (/iPhone15,2/.test(ua) || /iPhone15,3/.test(ua)) return 'iPhone 15 Pro'
    if (/iPhone15,4/.test(ua) || /iPhone15,5/.test(ua)) return 'iPhone 15 Pro Max'
    if (/iPhone14,7/.test(ua)) return 'iPhone 14'
    if (/iPhone/.test(ua)) return 'iPhone'
    return 'iPhone'
  }

  private getIPadModel(ua: string): string {
    if (/iPad13,/.test(ua)) return 'iPad Pro (M2)'
    if (/iPad14,/.test(ua)) return 'iPad Pro (M4)'
    return 'iPad'
  }

  private getAndroidModel(ua: string): string {
    const match = ua.match(/Android.*?;\s*([^)]+)/)
    return match ? match[1] : 'Android Device'
  }

  private generateDeviceId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Initialisiere als Host (Gerät 1 - zeigt QR-Code an)
  async initializeAsHost(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Verwende öffentlichen PeerJS Server
        this.peer = new Peer({
          debug: 2,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        })

        this.peer.on('open', (id) => {
          console.log('✅ Host Peer ID erstellt:', id)
          this.setupHostListeners()
          resolve(id)
        })

        this.peer.on('error', (err) => {
          console.error('❌ Peer Fehler:', err)
          reject(err)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  private setupHostListeners() {
    if (!this.peer) return

    this.peer.on('connection', (conn) => {
      console.log('📱 Eingehende Verbindung von:', conn.peer)
      this.setupConnection(conn)
    })
  }

  // Verbinde als Client (Gerät 2 - scannt QR-Code)
  async connectToHost(hostPeerId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer({
          debug: 2,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        })

        this.peer.on('open', () => {
          console.log('✅ Client Peer erstellt, verbinde zu Host:', hostPeerId)
          const conn = this.peer!.connect(hostPeerId, {
            reliable: true
          })
          this.setupConnection(conn)
          resolve()
        })

        this.peer.on('error', (err) => {
          console.error('❌ Client Verbindungsfehler:', err)
          reject(err)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  private setupConnection(conn: DataConnection) {
    conn.on('open', () => {
      console.log('🔗 Verbindung hergestellt mit:', conn.peer)
      this.connections.set(conn.peer, conn)

      // Sende eigene Device-Info
      this.sendMessage(conn, {
        type: 'device-info',
        data: this.localDeviceInfo,
        timestamp: Date.now()
      })

      if (this.onDeviceConnected && this.localDeviceInfo) {
        // Temporäre Device-Info bis echte empfangen wird
        this.onDeviceConnected(conn.peer, {
          ...this.localDeviceInfo,
          id: conn.peer
        })
      }
    })

    conn.on('data', (data) => {
      this.handleMessage(conn.peer, data as RTCMessage)
    })

    conn.on('close', () => {
      console.log('❌ Verbindung geschlossen:', conn.peer)
      this.connections.delete(conn.peer)
      if (this.onDeviceDisconnected) {
        this.onDeviceDisconnected(conn.peer)
      }
    })

    conn.on('error', (err) => {
      console.error('Verbindungsfehler:', err)
    })
  }

  private handleMessage(peerId: string, message: RTCMessage) {
    console.log('📨 Nachricht empfangen:', message.type, 'von:', peerId)

    switch (message.type) {
      case 'device-info':
        if (this.onDeviceConnected) {
          this.onDeviceConnected(peerId, message.data as DeviceInfo)
        }
        break

      case 'performance-update':
        if (this.onPerformanceUpdate) {
          this.onPerformanceUpdate(peerId, message.data)
        }
        break

      case 'ping':
        // Antworte mit Pong
        const conn = this.connections.get(peerId)
        if (conn) {
          this.sendMessage(conn, {
            type: 'pong',
            data: { timestamp: message.timestamp },
            timestamp: Date.now()
          })
        }
        break

      case 'pong':
        // Berechne Latenz
        const latency = Date.now() - message.data.timestamp
        console.log(`⚡ Latenz zu ${peerId}: ${latency}ms`)
        break
    }
  }

  private sendMessage(conn: DataConnection, message: RTCMessage) {
    try {
      conn.send(message)
    } catch (error) {
      console.error('Fehler beim Senden:', error)
    }
  }

  // Broadcast Nachricht an alle verbundenen Geräte
  broadcast(message: Omit<RTCMessage, 'timestamp'>) {
    const fullMessage: RTCMessage = {
      ...message,
      timestamp: Date.now()
    }

    this.connections.forEach((conn) => {
      this.sendMessage(conn, fullMessage)
    })
  }

  // Sende Performance-Update
  sendPerformanceUpdate(cpu: number, gpu: number, ram: number) {
    this.broadcast({
      type: 'performance-update',
      data: { cpu, gpu, ram }
    })
  }

  // Event Listeners
  onConnect(callback: (deviceId: string, info: DeviceInfo) => void) {
    this.onDeviceConnected = callback
  }

  onDisconnect(callback: (deviceId: string) => void) {
    this.onDeviceDisconnected = callback
  }

  onPerformance(callback: (deviceId: string, data: any) => void) {
    this.onPerformanceUpdate = callback
  }

  // Disconnect von allen Geräten
  disconnectAll() {
    this.connections.forEach((conn) => {
      conn.close()
    })
    this.connections.clear()

    if (this.peer) {
      this.peer.destroy()
      this.peer = null
    }
  }

  // Disconnect von einem spezifischen Gerät
  disconnectDevice(deviceId: string) {
    const conn = this.connections.get(deviceId)
    if (conn) {
      conn.close()
      this.connections.delete(deviceId)
    }
  }

  getConnectedDevices(): string[] {
    return Array.from(this.connections.keys())
  }

  isConnected(): boolean {
    return this.connections.size > 0
  }

  getPeerId(): string | null {
    return this.peer?.id || null
  }
}

// Singleton Instance
export const webrtcManager = new WebRTCManager()
