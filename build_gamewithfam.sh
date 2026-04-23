#!/bin/bash
set -e

# Build Server
echo "Building server..."
cd server
npm install
npm run build
cd ..

# Build Client
echo "Building client..."
cd client
npm install
# We don't necessarily need VITE_SERVER_URL if we're using proxying, 
# but let's ensure it's empty to trigger the window.location.origin fallback.
unset VITE_SERVER_URL
npm run build
cd ..

echo "Build complete! 'dist' directories are ready."
