#!/bin/bash

# Usage: @tool code-check <file-path>
if [ -z "$1" ]; then
    echo "Usage: code-check <file-path>"
    exit 1
fi

FILE_PATH="$1"

if [ ! -f "$FILE_PATH" ]; then
    echo "❌ File not found: $FILE_PATH"
    exit 1
fi

# Prerequisites
if ! command -v gemini &> /dev/null; then
    echo "❌ gemini CLI not found in PATH"
    exit 1
fi

SKIP_ESLINT=false
if [ ! -f "eslint.config.js" ]; then
    echo "⚠️  WARNING: .eslintrc.js not found — skipping ESLint stage"
    SKIP_ESLINT=true
fi

# --- Stage 1: Mechanical Check (ESLint) ---
echo ""
echo "=== Mechanical Check (ESLint) ==="
if [ "$SKIP_ESLINT" = true ]; then
    echo "Skipped."
else
    npx eslint "$FILE_PATH" || true
fi

# --- Stage 2: AI Judgment Check (Gemini) ---
echo ""
echo "=== AI Judgment Check (Gemini) ==="

PROMPT="Review this code for logic bugs, security issues, and naming consistency. For each finding, output: [SEVERITY] Line X — description. If no issues, say: No issues found. Do not rewrite the code."

cat "$FILE_PATH" | gemini --prompt "$PROMPT"