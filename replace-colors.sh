#!/bin/bash

# Farb-Migration: Cyan/Purple → Blue/Indigo/Teal
# Neue moderne Farbpalette für PowerLink App

echo "🎨 Ändere Farbschema von Cyan/Purple zu Blue/Indigo/Teal..."

# Hauptfarben ersetzen
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -exec sed -i 's/from-cyan-/from-blue-/g' {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -exec sed -i 's/to-purple-/to-indigo-/g' {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -exec sed -i 's/cyan-/blue-/g' {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -exec sed -i 's/purple-/indigo-/g' {} +

# Spezielle Pink/Purple Kombinationen → Violet/Indigo
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -exec sed -i 's/pink-500/violet-500/g' {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -exec sed -i 's/pink-400/violet-400/g' {} +

# Grün/Cyan Kombinationen → Grün/Teal
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -exec sed -i 's/from-green-900\/30 to-blue-900\/30/from-emerald-900\/30 to-teal-900\/30/g' {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -exec sed -i 's/border-green-500/border-emerald-500/g' {} +

echo "✅ Farbschema erfolgreich aktualisiert!"
echo ""
echo "Neue Farbpalette:"
echo "  - Primär: Blue (statt Cyan)"
echo "  - Sekundär: Indigo (statt Purple)"
echo "  - Akzent: Teal/Violet"
echo "  - Erfolg: Emerald (statt Green)"
