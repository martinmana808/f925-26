#!/bin/bash

# Print a header
echo "=== Updating Works Gallery ==="
echo

# Step 1: Generate CSV
echo "Step 1: Generating CSV..."
python3 "$(dirname "$0")/generate_works_csv2.py"
echo

# Step 2: Generate low-res images
echo "Step 2: Generating low-res images..."
node "$(dirname "$0")/generate-lowres.cjs"
echo

echo "=== Update Complete ===" 
