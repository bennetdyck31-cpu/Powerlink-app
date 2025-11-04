# PowerLink USB Detector - Android Native App

Native Android-App zur USB-C Geräteerkennung für PowerLink.

## 📋 Voraussetzungen

- Android Studio Hedgehog (2023.1.1) oder neuer
- Android SDK 24+ (Android 7.0 Nougat)
- Kotlin 1.9.10
- Gradle 8.2

## 🚀 Installation & Build

### 1. Projekt in Android Studio öffnen

```bash
cd native-apps/android
# Öffne diesen Ordner in Android Studio
```

### 2. Gradle Sync

Android Studio wird automatisch die Dependencies synchronisieren. Falls nicht:
- File → Sync Project with Gradle Files

### 3. App auf Gerät installieren

**Variante A: Über Android Studio**
1. USB-Debugging auf Ihrem Android-Gerät aktivieren
2. Gerät per USB verbinden
3. In Android Studio: Run → Run 'app' (oder Shift+F10)

**Variante B: Über Kommandozeile**
```bash
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

## 📱 Unterstützte Geräte

- **Minimum**: Android 7.0 (API 24)
- **Target**: Android 14 (API 34)
- **USB-Typ**: USB-C mit OTG-Support erforderlich

## ✨ Features

- ✅ Automatische USB-C Geräteerkennung
- ✅ Echtzeit-Verbindungsstatus
- ✅ Vendor/Product ID Erkennung
- ✅ Apple, Samsung, Google Geräte-Identifikation
- ✅ Verbindungsprotokoll
- ✅ Material Design 3 UI

## 🔧 Berechtigungen

Die App benötigt folgende Berechtigungen (werden automatisch angefragt):

```xml
<uses-feature android:name="android.hardware.usb.host" />
<uses-permission android:name="android.permission.USB_PERMISSION" />
```

## 📦 App-Struktur

```
app/src/main/
├── java/com/powerlink/usbdetector/
│   └── MainActivity.kt          # Hauptaktivität mit USB-Logik
├── res/
│   ├── xml/
│   │   └── device_filter.xml    # USB-Gerätefilter
│   └── ...
└── AndroidManifest.xml          # App-Konfiguration
```

## 🏗️ Build-Varianten

### Debug Build (Entwicklung)
```bash
./gradlew assembleDebug
```

### Release Build (Play Store)
```bash
./gradlew assembleRelease
```

**Wichtig**: Für Release-Builds benötigen Sie einen Signing Key:

1. Keystore erstellen:
```bash
keytool -genkey -v -keystore powerlink-release.keystore -alias powerlink -keyalg RSA -keysize 2048 -validity 10000
```

2. `keystore.properties` erstellen:
```properties
storePassword=IhrPassword
keyPassword=IhrPassword
keyAlias=powerlink
storeFile=powerlink-release.keystore
```

3. In `app/build.gradle.kts` signing config hinzufügen

## 📤 Play Store Deployment

### 1. App Bundle erstellen
```bash
./gradlew bundleRelease
```

### 2. AAB hochladen
- Öffnen Sie die [Google Play Console](https://play.google.com/console)
- Gehen Sie zu Ihrer App → Production → Create new release
- Laden Sie `app/build/outputs/bundle/release/app-release.aab` hoch

### 3. Store Listing vorbereiten

**Benötigte Assets:**
- App Icon (512x512 PNG)
- Feature Graphic (1024x500 PNG)
- Screenshots (min. 2, empfohlen 4-8)
- Kurzbeschreibung (max. 80 Zeichen)
- Vollständige Beschreibung (max. 4000 Zeichen)

**Kategorien:**
- Kategorie: Tools oder Productivity
- Altersfreigabe: Ab 3 Jahren

## 🔍 Testing

### Unit Tests ausführen
```bash
./gradlew test
```

### Instrumented Tests
```bash
./gradlew connectedAndroidTest
```

## 🐛 Troubleshooting

### Problem: "USB permission denied"
**Lösung**: App schließen, USB-Gerät trennen, neu verbinden, Berechtigung erneut erteilen

### Problem: "No USB devices found"
**Lösung**: 
- Überprüfen Sie, ob Ihr Gerät USB-OTG unterstützt
- Verwenden Sie ein USB-C zu USB-C Kabel (nicht USB-A zu USB-C)

### Problem: Gradle sync failed
**Lösung**:
```bash
./gradlew clean
rm -rf .gradle
# Android Studio neu starten
```

## 📄 Lizenz

Siehe `LICENSE` im Root-Verzeichnis

## 👨‍💻 Entwickler

PowerLink Team - [GitHub](https://github.com/bennetdyck31-cpu/Powerlink-app)
