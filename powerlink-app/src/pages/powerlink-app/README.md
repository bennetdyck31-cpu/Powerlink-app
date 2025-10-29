# Powerlink App

Dies ist die Powerlink App, eine React-Anwendung, die ein Dashboard anzeigt. 

## Projektstruktur

- **src/**: Enthält den Quellcode der Anwendung.
  - **main.tsx**: Einstiegspunkt der Anwendung, der die Hauptkomponente rendert.
  - **App.tsx**: Importiert die Dashboard-Komponente und definiert die Hauptanwendung.
  - **index.css**: Enthält die Tailwind CSS-Direktiven und grundlegende Stile.
  - **pages/**: Enthält die Seitenkomponenten, einschließlich Dashboard.
    - **Dashboard.tsx**: Implementierung der Dashboard-Seite.
  
- **public/**: Enthält öffentliche Ressourcen.
  - **vite.svg**: SVG-Bild, das in der Anwendung verwendet wird.

- **index.html**: Haupt-HTML-Datei der Anwendung.

- **package.json**: Konfigurationsdatei für npm mit Abhängigkeiten und Skripten.

- **vite.config.ts**: Konfiguration für Vite, das Build-Tool und Entwicklungsserver.

- **tailwind.config.js**: Konfiguration für Tailwind CSS.

- **postcss.config.js**: Konfiguration für PostCSS.

## Installation

1. Klone das Repository:
   ```
   git clone <repository-url>
   ```

2. Navigiere in das Projektverzeichnis:
   ```
   cd powerlink-app
   ```

3. Installiere die Abhängigkeiten:
   ```
   npm install
   ```

## Entwicklung

Starte den Entwicklungsserver:
```
npm run dev
```

## Build

Um die Anwendung für die Produktion zu bauen, führe aus:
```
npm run build
```

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.