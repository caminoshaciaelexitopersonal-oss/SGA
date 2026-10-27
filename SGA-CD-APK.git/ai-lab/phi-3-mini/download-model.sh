#!/usr/bin/env bash
set -euo pipefail

BASE_URL="https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-onnx/resolve/main/cpu_and_mobile/cpu-int4-rtn-block-32-acc-level-4"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$SCRIPT_DIR/weights"
CHECKSUM_FILE="$SCRIPT_DIR/checksums.txt"

mkdir -p "$TARGET_DIR"

FILES=(
    "added_tokens.json"
    "config.json"
    "configuration_phi3.py"
    "genai_config.json"
    "phi3-mini-4k-instruct-cpu-int4-rtn-block-32-acc-level-4.onnx"
    "phi3-mini-4k-instruct-cpu-int4-rtn-block-32-acc-level-4.onnx.data"
    "special_tokens_map.json"
    "tokenizer.json"
    "tokenizer.model"
    "tokenizer_config.json"
)

echo "=== Descargando pesos y configuración de Phi-3 Mini (ONNX CPU INT4) ==="
echo "Directorio destino: $TARGET_DIR"

for file in "${FILES[@]}"; do
    echo "Descargando $file..."
    curl -L -s --show-error --output "$TARGET_DIR/$file" "$BASE_URL/$file"
done

echo "=== Descarga completada. Calculando hashes SHA-256 ==="
> "$CHECKSUM_FILE"

cd "$SCRIPT_DIR"
for file in "${FILES[@]}"; do
    if [ -f "weights/$file" ]; then
        sha256sum "weights/$file" >> "$CHECKSUM_FILE"
    fi
done

echo "Hashes guardados en $CHECKSUM_FILE"
