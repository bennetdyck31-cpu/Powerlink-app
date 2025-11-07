/**
 * Connection Manager für hybride Verbindungen:
 * 1. USB-Tethering (beste Performance, offline)
 * 2. Lokales WiFi (gleiche Netzwerk)
 * 3. Internet WebRTC (Fallback)
 */

export type ConnectionType = 'usb-tethering' | 'local-wifi' | 'internet'

export interface NetworkInfo {
  type: ConnectionType
  localIP?: string
  isOnline: boolean
  latency?: number
}

class ConnectionManager {
  private currentType: ConnectionType = 'internet'
  private preferredType: ConnectionType = 'usb-tethering'

  /**
   * Erkenne USB-Tethering
   * Wenn ein Gerät per USB verbunden ist und Tethering aktiv ist,
   * wird eine lokale IP (z.B. 172.20.10.x für iPhone) vergeben
   */
  async detectUSBTethering(): Promise<boolean> {
    try {
      // Prüfe ob wir eine USB-Tethering IP haben
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      
      if (connection) {
        // Effektiver Verbindungstyp
        const effectiveType = connection.effectiveType
        console.log('📡 Verbindungstyp:', effectiveType, 'Typ:', connection.type)
      }

      // Versuche lokale IP zu ermitteln
      const localIP = await this.getLocalIP()
      
      if (localIP) {
        // iPhone USB-Tethering: 172.20.10.x
        // Android USB-Tethering: 192.168.42.x oder 192.168.43.x
        if (
          localIP.startsWith('172.20.10.') ||  // iPhone
          localIP.startsWith('192.168.42.') ||  // Android
          localIP.startsWith('192.168.43.')     // Android alt
        ) {
          console.log('✅ USB-Tethering erkannt! IP:', localIP)
          this.currentType = 'usb-tethering'
          return true
        }

        // USB-Ethernet (Link-Local) ohne Tethering: 169.254.x.x
        // macOS ↔ iPad/iPhone direkte USB-Verbindung
        if (localIP.startsWith('169.254.')) {
          console.log('✅ USB-Ethernet (Link-Local) erkannt! IP:', localIP)
          this.currentType = 'usb-tethering'
          return true
        }

        // Lokales WiFi: 192.168.x.x, 10.x.x.x
        if (
          localIP.startsWith('192.168.') ||
          localIP.startsWith('10.') ||
          localIP.startsWith('172.16.')
        ) {
          console.log('✅ Lokales Netzwerk erkannt! IP:', localIP)
          this.currentType = 'local-wifi'
          return true
        }
      }

      console.log('ℹ️ Internet-Verbindung (kein USB-Tethering)')
      this.currentType = 'internet'
      return false
    } catch (error) {
      console.error('Fehler bei USB-Tethering Erkennung:', error)
      return false
    }
  }

  /**
   * Ermittle lokale IP-Adresse via WebRTC
   */
  private async getLocalIP(): Promise<string | null> {
    return new Promise((resolve) => {
      try {
        const pc = new RTCPeerConnection({
          iceServers: [] // Keine STUN-Server für lokale IP
        })

        pc.createDataChannel('')

        pc.createOffer().then(offer => pc.setLocalDescription(offer))

        pc.onicecandidate = (event) => {
          if (!event || !event.candidate) {
            pc.close()
            return
          }

          const candidate = event.candidate.candidate
          console.log('ICE Candidate:', candidate)

          // Extrahiere IP aus Candidate
          const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/
          const match = ipRegex.exec(candidate)

          if (match && match[1]) {
            const ip = match[1]
            // Ignoriere 0.0.0.0 und IPv6
            if (ip !== '0.0.0.0' && !ip.includes(':')) {
              console.log('🔍 Gefundene lokale IP:', ip)
              pc.close()
              resolve(ip)
            }
          }
        }

        // Timeout nach 2 Sekunden
        setTimeout(() => {
          pc.close()
          resolve(null)
        }, 2000)
      } catch (error) {
        console.error('Fehler bei IP-Ermittlung:', error)
        resolve(null)
      }
    })
  }

  /**
   * Prüfe ob wir im gleichen lokalen Netzwerk sind
   */
  async isLocalNetwork(): Promise<boolean> {
    const localIP = await this.getLocalIP()
    if (!localIP) return false

    // Private IP-Bereiche + Link-Local
    return (
      localIP.startsWith('192.168.') ||
      localIP.startsWith('10.') ||
      localIP.startsWith('172.16.') ||
      localIP.startsWith('172.20.') ||
      localIP.startsWith('172.30.') ||
      localIP.startsWith('169.254.')  // Link-Local (USB-Ethernet)
    )
  }

  /**
   * Hole Netzwerk-Informationen
   */
  async getNetworkInfo(): Promise<NetworkInfo> {
    await this.detectUSBTethering()
    const localIP = await this.getLocalIP()
    const isOnline = navigator.onLine

    return {
      type: this.currentType,
      localIP: localIP || undefined,
      isOnline,
      latency: 0 // Wird später gemessen
    }
  }

  /**
   * Bestimme optimale ICE-Server basierend auf Verbindungstyp
   */
  getICEServers(): RTCIceServer[] {
    // USB-Tethering oder lokales WiFi: Keine STUN-Server nötig
    if (this.currentType === 'usb-tethering' || this.currentType === 'local-wifi') {
      console.log('🔌 Lokale Verbindung → Keine STUN-Server')
      return []
    }

    // Internet: Google STUN-Server
    console.log('🌐 Internet-Verbindung → Google STUN')
    return [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  }

  /**
   * Setze bevorzugten Verbindungstyp
   */
  setPreferredType(type: ConnectionType) {
    this.preferredType = type
    console.log('⚙️ Bevorzugter Modus:', type)
  }

  /**
   * Hole aktuellen Verbindungstyp
   */
  getCurrentType(): ConnectionType {
    return this.currentType
  }

  /**
   * Hole bevorzugten Verbindungstyp
   */
  getPreferredType(): ConnectionType {
    return this.preferredType
  }

  /**
   * Prüfe ob USB-Tethering möglich/aktiv ist
   */
  async checkUSBTetheringAvailable(): Promise<boolean> {
    const localIP = await this.getLocalIP()
    if (!localIP) return false

    return (
      localIP.startsWith('172.20.10.') ||  // iPhone Tethering
      localIP.startsWith('192.168.42.') ||  // Android Tethering
      localIP.startsWith('192.168.43.') ||  // Android Tethering alt
      localIP.startsWith('169.254.')        // USB-Ethernet (Link-Local)
    )
  }
}

// Singleton
export const connectionManager = new ConnectionManager()
