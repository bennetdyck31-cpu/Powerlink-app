# PowerLink USB Bridge - macOS/iOS

## Zweck
Erstellt automatisch eine USB-Netzwerk-Verbindung ohne Tethering/Internet.

## Wie es funktioniert

### macOS ↔ iPad/iPhone USB-Verbindung:

1. **Automatisches USB-Ethernet**
   - macOS hat bereits `usbmuxd` (USB Multiplexer Daemon)
   - Dieser erlaubt Netzwerk über USB ohne Internet
   - Wir nutzen dies für die Web-App

2. **Network Interface erstellen**
   ```bash
   # macOS erstellt automatisch bei iPad/iPhone Verbindung:
   # - Interface: bridge0 oder en4/en5
   # - IP Range: 169.254.x.x (Link-Local)
   ```

3. **Web-Server auf beiden Geräten**
   - Jedes Gerät startet lokalen Web-Server
   - Server broadcasted seine IP via mDNS
   - Auto-Discovery findet den anderen

## Installation

### Schritt 1: USB-Ethernet aktivieren (automatisch)
Wenn iPad/iPhone per USB verbunden wird:
- macOS erstellt automatisch `bridge100` Interface
- iOS erstellt automatisch USB-Ethernet Interface

### Schritt 2: Native Helper installieren
```bash
# Lade PowerLink Helper
curl -O https://powerlink.app/helper-macos.zip
unzip helper-macos.zip
sudo ./install.sh

# Helper läuft im Hintergrund und:
# 1. Erkennt USB-Verbindungen
# 2. Erstellt Link-Local Network (169.254.x.x)
# 3. Startet mDNS Broadcast
# 4. Öffnet Web-App automatisch
```

### Schritt 3: Verbinden
```bash
# 1. USB-Kabel anschließen
# 2. Auf beiden Geräten öffnet sich automatisch Safari/Chrome
# 3. Geräte finden sich über mDNS
# 4. WebRTC-Verbindung wird hergestellt
```

## Technische Details

### USB-Netzwerk ohne Internet:
```
iPad/iPhone (USB) ←→ macOS
     ↓                    ↓
169.254.10.1      169.254.10.2
     ↓                    ↓
   Safari              Chrome
     ↓                    ↓
   WebRTC Connection (Local)
```

### Native Helper Daemon:
```swift
// USBBridge.swift
import Foundation
import Network

class USBNetworkBridge {
    func detectUSBConnection() {
        // Lausche auf USB-Events
        let monitor = NWPathMonitor(requiredInterfaceType: .other)
        
        monitor.pathUpdateHandler = { path in
            if path.status == .satisfied {
                // USB-Interface gefunden
                self.setupLinkLocalNetwork()
                self.startMDNSBroadcast()
                self.openWebApp()
            }
        }
    }
    
    func setupLinkLocalNetwork() {
        // 169.254.x.x IP zuweisen
        // Keine Internet-Route nötig
    }
    
    func startMDNSBroadcast() {
        // Broadcaste: powerlink-host._tcp.local
    }
}
```

## Vorteile:
- ✅ **Kein Internet/SIM nötig**
- ✅ **Automatisch bei Kabel-Anschluss**
- ✅ **Volle USB 2.0/3.0 Geschwindigkeit**
- ✅ **Funktioniert offline**

## Einschränkungen:
- ⚠️ Braucht native Helper-App (einmalige Installation)
- ⚠️ macOS/iOS only (für Windows andere Lösung nötig)
