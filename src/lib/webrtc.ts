import Peer, { DataConnection } from 'peerjs'
import { connectionManager, ConnectionType } from './connection-manager'

export interface DeviceInfo {
  id: string
  name: string
  type: 'phone' | 'tablet' | 'laptop' | 'desktop'
  cpu: number
  gpu: number
  ram: number
  model: string
  os: string
  connectionType?: ConnectionType
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
  private visibilityChangeHandler?: () => void
  private beforeUnloadHandler?: (e: BeforeUnloadEvent) => void

  constructor() {
    this.initializeLocalDeviceInfo()
    this.setupLifecycleHandlers()
  }

  /**
   * Verhindere automatisches Trennen bei Bildschirm-Aus/App-Wechsel
   */
  private setupLifecycleHandlers() {
    // Verhindere Trennung bei Visibility Change (Bildschirm aus, App-Wechsel)
    this.visibilityChangeHandler = () => {
      if (document.hidden) {
        console.log('📱 App in Hintergrund - Verbindung bleibt aktiv')
        // NICHT trennen! Nur loggen
      } else {
        console.log('📱 App wieder im Vordergrund')
      }
    }
    document.addEventListener('visibilitychange', this.visibilityChangeHandler)

    // Warne nur bei Browser-Close (nicht bei Tab-Wechsel)
    this.beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      if (this.connections.size > 0) {
        const message = 'Geräte sind noch verbunden. Wirklich schließen?'
        e.preventDefault()
        e.returnValue = message
        return message
      }
    }
    window.addEventListener('beforeunload', this.beforeUnloadHandler)

    // Keep-Alive bei Page Freeze (iOS/Android)
    if ('wakeLock' in navigator) {
      // Wake Lock API für moderne Browser
      console.log('✅ Wake Lock API verfügbar')
    }
  }

  private initializeLocalDeviceInfo() {
    const userAgent = navigator.userAgent
    let deviceType: 'phone' | 'tablet' | 'laptop' | 'desktop' = 'desktop'
    let os = 'Unknown'
    let model = 'Unknown Device'

    console.log('🔍 User Agent:', userAgent)

    // Detect OS - WICHTIG: iPhone vor iPad prüfen!
    if (/iPhone/.test(userAgent)) {
      deviceType = 'phone'
      os = 'iOS'
      model = this.getIPhoneModel(userAgent)
      console.log('📱 iPhone erkannt:', model)
    } else if (/iPad/.test(userAgent)) {
      // iPad kann manchmal als iPhone gemeldet werden in iOS 13+
      // Prüfe zusätzlich auf Touch-Punkte
      if (navigator.maxTouchPoints && navigator.maxTouchPoints > 2) {
        deviceType = 'tablet'
        os = 'iOS'
        model = this.getIPadModel(userAgent)
        console.log('📱 iPad erkannt:', model)
      } else {
        deviceType = 'phone'
        os = 'iOS'
        model = 'iPhone'
        console.log('📱 iPhone (via iPad UA) erkannt')
      }
    } else if (/Android/.test(userAgent)) {
      if (/Mobile/.test(userAgent)) {
        deviceType = 'phone'
      } else {
        deviceType = 'tablet'
      }
      os = 'Android'
      model = this.getAndroidModel(userAgent)
      console.log('📱 Android erkannt:', model, 'Type:', deviceType)
    } else if (/Macintosh/.test(userAgent)) {
      // Neuere iPads (iPadOS 13+) können als Mac gemeldet werden
      if (navigator.maxTouchPoints && navigator.maxTouchPoints > 2) {
        deviceType = 'tablet'
        os = 'iOS'
        model = 'iPad'
        console.log('📱 iPad (via Mac UA) erkannt')
      } else {
        deviceType = 'laptop'
        os = 'macOS'
        model = 'Mac'
        console.log('💻 Mac erkannt')
      }
    } else if (/Windows/.test(userAgent)) {
      deviceType = 'desktop'
      os = 'Windows'
      model = 'Windows PC'
      console.log('💻 Windows PC erkannt')
    } else if (/Linux/.test(userAgent)) {
      deviceType = 'desktop'
      os = 'Linux'
      model = 'Linux PC'
      console.log('💻 Linux PC erkannt')
    }

    this.localDeviceInfo = {
      id: this.generateDeviceId(),
      name: model,
      type: deviceType,
      cpu: 0,
      gpu: 0,
      ram: (navigator as any).deviceMemory || 4,
      model: model,
      os: os,
      connectionType: 'internet' // Wird später aktualisiert
    }
  }

  private getIPhoneModel(ua: string): string {
    // iPhone 15 Serie
    if (/iPhone15,2/.test(ua) || /iPhone15,3/.test(ua)) return 'iPhone 15 Pro'
    if (/iPhone15,4/.test(ua) || /iPhone15,5/.test(ua)) return 'iPhone 15 Pro Max'
    if (/iPhone14,7/.test(ua) || /iPhone14,8/.test(ua)) return 'iPhone 15'
    
    // iPhone 14 Serie
    if (/iPhone14,7/.test(ua)) return 'iPhone 14'
    if (/iPhone14,8/.test(ua)) return 'iPhone 14 Plus'
    
    // iPhone 13 Serie
    if (/iPhone14,5/.test(ua)) return 'iPhone 13'
    if (/iPhone14,4/.test(ua)) return 'iPhone 13 mini'
    if (/iPhone14,2/.test(ua)) return 'iPhone 13 Pro'
    if (/iPhone14,3/.test(ua)) return 'iPhone 13 Pro Max'
    
    // iPhone 12 Serie
    if (/iPhone13,2/.test(ua)) return 'iPhone 12'
    if (/iPhone13,1/.test(ua)) return 'iPhone 12 mini'
    if (/iPhone13,3/.test(ua)) return 'iPhone 12 Pro'
    if (/iPhone13,4/.test(ua)) return 'iPhone 12 Pro Max'
    
    // Fallback
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
    return new Promise(async (resolve, reject) => {
      try {
        // Erkenne Verbindungstyp
        await connectionManager.detectUSBTethering()
        const networkInfo = await connectionManager.getNetworkInfo()
        
        console.log('🔌 Netzwerk-Info:', networkInfo)
        console.log(`📡 Verbindungsmodus: ${networkInfo.type}`)
        if (networkInfo.localIP) {
          console.log(`🌐 Lokale IP: ${networkInfo.localIP}`)
        }

        // Hole optimale ICE-Server (leer bei USB/local WiFi)
        const iceServers = connectionManager.getICEServers()
        
        // Verwende öffentlichen PeerJS Server für Signaling
        // Aber ICE-Server werden nur bei Internet-Verbindung genutzt
        this.peer = new Peer({
          debug: 2,
          config: {
            iceServers: iceServers
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
    return new Promise(async (resolve, reject) => {
      try {
        // Erkenne Verbindungstyp
        await connectionManager.detectUSBTethering()
        const networkInfo = await connectionManager.getNetworkInfo()
        
        console.log('🔌 Client Netzwerk-Info:', networkInfo)
        console.log(`📡 Verbindungsmodus: ${networkInfo.type}`)

        // Hole optimale ICE-Server
        const iceServers = connectionManager.getICEServers()
        
        this.peer = new Peer({
          debug: 2,
          config: {
            iceServers: iceServers
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
    console.log('🔌 Trenne alle Verbindungen manuell')
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
    console.log('🔌 Trenne Gerät manuell:', deviceId)
    const conn = this.connections.get(deviceId)
    if (conn) {
      conn.close()
      this.connections.delete(deviceId)
    }
  }

  // Cleanup bei App-Zerstörung
  cleanup() {
    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler)
    }
    if (this.beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler)
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
