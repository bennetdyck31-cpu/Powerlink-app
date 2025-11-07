# Automatische Verbindung bei USB-Anschluss

## 🎯 Was wurde implementiert

Die App kann jetzt **automatisch eine Verbindung herstellen**, wenn du ein Kabel an ein anderes Gerät anschließt. Du benötigst die App nur auf **einem Gerät** (dem Gerät, das Leistung beziehen will).

## ⚙️ So funktioniert es

### Variante 1: Auto-Host-Start (USB-Tethering)
Wenn USB-Tethering erkannt wird, startet das Gerät automatisch als Host.

**Aktivierung:**
1. Öffne die App in den Settings
2. Aktiviere den Schalter **"Auto-Start Host (USB)"**
3. Schließe dein Gerät per USB-Kabel an
4. Die App erkennt USB-Tethering und startet automatisch als Host
5. Auf dem zweiten Gerät: Öffne die App und sie verbindet sich automatisch

### Variante 2: Auto-Connect (Client-Modus)
Die App sucht automatisch nach verfügbaren Hosts im Netzwerk und verbindet sich.

**Aktivierung:**
1. Öffne Settings
2. Aktiviere **"Auto-Connect"** 
3. Die App scannt alle 3 Sekunden nach Hosts
4. Sobald ein Host gefunden wird, verbindet sie sich automatisch

## 🔧 Technische Details

### Auto-Discovery System
- **BroadcastChannel API**: Ermöglicht Communication zwischen Tabs/Windows auf demselben Gerät
- **localStorage**: Speichert Host-Announcements für Cross-Browser Discovery
- **Automatisches Cleanup**: Alte Hosts (> 15 Sekunden) werden automatisch entfernt

### Host-Announcement
Wenn ein Gerät als Host startet:
1. Peer-ID wird erstellt
2. Host-Info wird gebroadcastet (alle 5 Sekunden)
3. Info wird in localStorage gespeichert
4. Bei Disconnect wird Goodbye-Message gesendet

### Client-Discovery
Wenn ein Gerät im Client-Modus ist:
1. Scannt alle 3 Sekunden nach Hosts
2. Liest aus localStorage und BroadcastChannel
3. Verbindet automatisch mit dem besten Host (neuester Timestamp)
4. Hört auf neue Host-Announcements

## 🚀 Nutzung

### Schnellstart: USB-Kabel Verbindung

**Gerät 1 (Host - z.B. PC):**
```bash
# 1. Settings öffnen
# 2. "Auto-Start Host (USB)" aktivieren
# 3. Warten bis Gerät 2 per Kabel angeschlossen wird
```

**Gerät 2 (Client - z.B. Handy):**
```bash
# 1. USB-Tethering aktivieren:
#    - iPhone: Einstellungen → Persönlicher Hotspot
#    - Android: Einstellungen → Netzwerk → USB-Tethering
# 2. Settings öffnen
# 3. "Auto-Connect" aktivieren  
# 4. Kabel anschließen
# → Verbindung wird automatisch hergestellt!
```

## 📱 Unterstützte Szenarien

### ✅ Funktioniert automatisch:
- **USB-Tethering** (iPhone/Android → PC/Mac)
- **Lokales WiFi** (gleicher Router)
- **Gleiche Browser-Tabs** (BroadcastChannel)

### ⚠️ Einschränkungen:
- **Cross-Browser**: Nur via localStorage (muss im gleichen Netzwerk sein)
- **Internet-Modus**: Benötigt manuellen QR-Code-Scan (keine zentrale Signalisierung)
- **Native Apps**: Nur Web-App, native Android-App hat separates USB-System

## 🔍 Debugging

### Console-Logs prüfen:
```javascript
// Host-Side:
// ✅ Host Peer ID erstellt: abc123
// 📢 Host angekündigt: abc123

// Client-Side:
// 🔍 1 Host(s) gefunden
// 🤖 Auto-Connect: Host gefunden: abc123
// ✅ Automatisch verbunden mit: MacBook Pro
```

### Manual Testing:
```javascript
// Im Browser Console (Host):
localStorage.setItem('autoStartHost', 'true')

// Im Browser Console (Client):
localStorage.setItem('autoConnect', 'true')

// Teste Discovery System:
import { autoDiscovery } from '@/lib/auto-discovery'
await autoDiscovery.scanForHosts() // Zeigt gefundene Hosts
```

## 🛠️ Dateien

- `src/lib/auto-discovery.ts` - Auto-Discovery System
- `src/lib/webrtc.ts` - WebRTC Manager mit Host-Announcement
- `src/pages/Settings.tsx` - UI-Schalter für Auto-Start/Auto-Connect
- `src/pages/Dashboard.tsx` - Auto-Discovery Integration

## 💡 Zukünftige Verbesserungen

1. **Zentraler Signaling-Server** für echte Internet-Discovery
2. **mDNS/Bonjour** für lokales Netzwerk-Broadcasting
3. **Native App Integration** für direktes USB-Event-Handling
4. **Bluetooth** als alternative Verbindungsmethode
