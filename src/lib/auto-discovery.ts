/**
 * Auto-Discovery System für automatische Verbindungen
 * Nutzt BroadcastChannel + localStorage für lokale Peer-Entdeckung
 */

export interface DiscoveredHost {
  peerId: string
  deviceName: string
  timestamp: number
  networkType: string
}

class AutoDiscovery {
  private channel: BroadcastChannel | null = null
  private discoveredHosts: Map<string, DiscoveredHost> = new Map()
  private onHostDiscovered?: (host: DiscoveredHost) => void
  private onHostLost?: (peerId: string) => void
  private cleanupInterval?: number
  private isHost: boolean = false
  private myPeerId: string | null = null

  constructor() {
    this.setupBroadcastChannel()
    this.startCleanupTimer()
  }

  /**
   * Setup BroadcastChannel für Inter-Tab/Inter-Device Communication
   */
  private setupBroadcastChannel() {
    try {
      // BroadcastChannel funktioniert nur innerhalb des gleichen Origins
      // Für echte Cross-Device Discovery müsste ein WebSocket-Server verwendet werden
      this.channel = new BroadcastChannel('powerlink-discovery')
      
      this.channel.onmessage = (event) => {
        const message = event.data
        
        if (message.type === 'host-announce') {
          this.handleHostAnnouncement(message.data)
        } else if (message.type === 'host-goodbye') {
          this.handleHostGoodbye(message.data.peerId)
        }
      }
      
      console.log('📡 Auto-Discovery BroadcastChannel aktiv')
    } catch (error) {
      console.warn('⚠️ BroadcastChannel nicht verfügbar:', error)
    }
  }

  /**
   * Starte als Host und broadcaste Peer-ID
   */
  announceAsHost(peerId: string, deviceName: string, networkType: string) {
    this.isHost = true
    this.myPeerId = peerId
    
    const announcement: DiscoveredHost = {
      peerId,
      deviceName,
      timestamp: Date.now(),
      networkType
    }
    
    // Broadcast via BroadcastChannel
    if (this.channel) {
      this.channel.postMessage({
        type: 'host-announce',
        data: announcement
      })
    }
    
    // Speichere in localStorage für Cross-Browser Discovery
    try {
      const hosts = this.getStoredHosts()
      hosts[peerId] = announcement
      localStorage.setItem('powerlink-hosts', JSON.stringify(hosts))
      
      console.log('📢 Host angekündigt:', peerId)
    } catch (error) {
      console.warn('⚠️ localStorage nicht verfügbar:', error)
    }
    
    // Wiederhole Announcement alle 5 Sekunden
    const intervalId = setInterval(() => {
      if (this.isHost && this.myPeerId) {
        this.announceAsHost(this.myPeerId, deviceName, networkType)
      } else {
        clearInterval(intervalId)
      }
    }, 5000)
  }

  /**
   * Stoppe Host-Announcement
   */
  stopHostAnnouncement() {
    if (!this.isHost || !this.myPeerId) return
    
    // Broadcast Goodbye
    if (this.channel) {
      this.channel.postMessage({
        type: 'host-goodbye',
        data: { peerId: this.myPeerId }
      })
    }
    
    // Entferne aus localStorage
    try {
      const hosts = this.getStoredHosts()
      delete hosts[this.myPeerId]
      localStorage.setItem('powerlink-hosts', JSON.stringify(hosts))
      
      console.log('📢 Host-Announcement gestoppt')
    } catch (error) {
      console.warn('⚠️ localStorage nicht verfügbar:', error)
    }
    
    this.isHost = false
    this.myPeerId = null
  }

  /**
   * Handle eingehende Host-Announcements
   */
  private handleHostAnnouncement(host: DiscoveredHost) {
    // Ignoriere eigene Announcements
    if (this.isHost && host.peerId === this.myPeerId) return
    
    const wasNew = !this.discoveredHosts.has(host.peerId)
    this.discoveredHosts.set(host.peerId, host)
    
    if (wasNew && this.onHostDiscovered) {
      console.log('🔍 Host entdeckt:', host.peerId, host.deviceName)
      this.onHostDiscovered(host)
    }
  }

  /**
   * Handle Host-Goodbye
   */
  private handleHostGoodbye(peerId: string) {
    if (this.discoveredHosts.has(peerId)) {
      this.discoveredHosts.delete(peerId)
      
      if (this.onHostLost) {
        console.log('👋 Host verloren:', peerId)
        this.onHostLost(peerId)
      }
    }
  }

  /**
   * Hole verfügbare Hosts aus localStorage
   */
  private getStoredHosts(): Record<string, DiscoveredHost> {
    try {
      const stored = localStorage.getItem('powerlink-hosts')
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      return {}
    }
  }

  /**
   * Scanne nach verfügbaren Hosts
   */
  async scanForHosts(): Promise<DiscoveredHost[]> {
    const hosts = this.getStoredHosts()
    const now = Date.now()
    const validHosts: DiscoveredHost[] = []
    
    // Filtere alte Hosts (älter als 15 Sekunden)
    for (const [peerId, host] of Object.entries(hosts)) {
      if (now - host.timestamp < 15000) {
        validHosts.push(host)
        this.discoveredHosts.set(peerId, host)
      }
    }
    
    console.log(`🔍 ${validHosts.length} Host(s) gefunden`)
    return validHosts
  }

  /**
   * Hole beste verfügbare Host (neuester)
   */
  async getBestHost(): Promise<DiscoveredHost | null> {
    const hosts = await this.scanForHosts()
    
    if (hosts.length === 0) return null
    
    // Sortiere nach Timestamp (neuester zuerst)
    hosts.sort((a, b) => b.timestamp - a.timestamp)
    
    return hosts[0]
  }

  /**
   * Cleanup Timer - entferne alte Hosts
   */
  private startCleanupTimer() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      const hosts = this.getStoredHosts()
      let changed = false
      
      // Entferne Hosts älter als 15 Sekunden
      for (const [peerId, host] of Object.entries(hosts)) {
        if (now - host.timestamp > 15000) {
          delete hosts[peerId]
          changed = true
          
          if (this.discoveredHosts.has(peerId)) {
            this.discoveredHosts.delete(peerId)
            if (this.onHostLost) {
              this.onHostLost(peerId)
            }
          }
        }
      }
      
      if (changed) {
        try {
          localStorage.setItem('powerlink-hosts', JSON.stringify(hosts))
        } catch (error) {
          // ignore
        }
      }
    }, 3000) as unknown as number
  }

  /**
   * Event Listener
   */
  onDiscoverHost(callback: (host: DiscoveredHost) => void) {
    this.onHostDiscovered = callback
  }

  onLoseHost(callback: (peerId: string) => void) {
    this.onHostLost = callback
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.channel) {
      this.channel.close()
    }
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    
    this.stopHostAnnouncement()
  }

  /**
   * Hole alle entdeckten Hosts
   */
  getDiscoveredHosts(): DiscoveredHost[] {
    return Array.from(this.discoveredHosts.values())
  }
}

// Singleton
export const autoDiscovery = new AutoDiscovery()
