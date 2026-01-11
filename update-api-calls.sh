#!/bin/bash

# Script to update all fetch calls to use getApiUrl helper

files=(
  "src/pages/Admin/Orders.jsx"
  "src/pages/Admin/Customers.jsx"
  "src/pages/Admin/MenuItems.jsx"
  "src/pages/Admin/Settings.jsx"
  "src/pages/Admin/DeliveryAgents.jsx"
)

for file in "${files[@]}"; do
  echo "Updating $file..."
  
  # Add import if not already present
  if ! grep -q "import { getApiUrl }" "$file"; then
    # Find the last import line and add after it
    sed -i "1,/^import/s/\(^import.*$\)/\1\nimport { getApiUrl } from '..\/..\/config\/api';/" "$file"
  fi
  
  # Replace fetch calls with relative paths
  sed -i "s|fetch('/api/v1/|fetch(getApiUrl('api/v1/|g" "$file"
  sed -i "s|fetch(\`/api/v1/|fetch(getApiUrl(\`api/v1/|g" "$file"
  
  # Fix closing for string literals
  sed -i "s|getApiUrl('api/v1/\([^']*\)')|getApiUrl('api/v1/\1'))|g" "$file"
  
  # Fix closing for template literals
  sed -i "s|getApiUrl(\`api/v1/\([^\`]*\)\`)|getApiUrl(\`api/v1/\1\`))|g" "$file"
done

echo "Done! All files updated."
