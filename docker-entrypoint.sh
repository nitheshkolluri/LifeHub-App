#!/bin/sh

# Path to the file
file_path="/usr/share/nginx/html/env-config.js"

# Recreate the file
echo "window.env = {" > "$file_path"

# Inject values provided at runtime (e.g. from Cloud Run)
echo "  VITE_FIREBASE_API_KEY: \"${VITE_FIREBASE_API_KEY:-}\"," >> "$file_path"
echo "  VITE_FIREBASE_AUTH_DOMAIN: \"${VITE_FIREBASE_AUTH_DOMAIN:-}\"," >> "$file_path"
echo "  VITE_FIREBASE_PROJECT_ID: \"${VITE_FIREBASE_PROJECT_ID:-}\"," >> "$file_path"
echo "  VITE_FIREBASE_STORAGE_BUCKET: \"${VITE_FIREBASE_STORAGE_BUCKET:-}\"," >> "$file_path"
echo "  VITE_FIREBASE_MESSAGING_SENDER_ID: \"${VITE_FIREBASE_MESSAGING_SENDER_ID:-}\"," >> "$file_path"
echo "  VITE_FIREBASE_APP_ID: \"${VITE_FIREBASE_APP_ID:-}\"," >> "$file_path"
echo "  VITE_STRIPE_PUBLISHABLE_KEY: \"${VITE_STRIPE_PUBLISHABLE_KEY:-}\"," >> "$file_path"
echo "  VITE_API_URL: \"${VITE_API_URL:-}\"," >> "$file_path"
echo "  VITE_STRIPE_PRICE_ID_PRO_MONTHLY: \"${VITE_STRIPE_PRICE_ID_PRO_MONTHLY:-}\"," >> "$file_path"
echo "  VITE_GEMINI_API_KEY: \"${VITE_GEMINI_API_KEY:-}\"," >> "$file_path"
echo "  VITE_STRIPE_PAYMENT_LINK: \"${VITE_STRIPE_PAYMENT_LINK:-}\"," >> "$file_path"

echo "};" >> "$file_path"

# Execute the main container command (nginx)
exec "$@"
