#!/bin/sh
# Runtime environment variable injection for Vite apps

# Create runtime config that can be read by the browser
cat > /usr/share/nginx/html/config.js <<EOF
window.ENV = {
  VITE_BACKEND_URL: '${VITE_BACKEND_URL}'
};
EOF

# Start nginx
nginx -g 'daemon off;'
