#!/bin/bash

# Deploy script for FuelTracker
# Usage: ./deploy.sh <version> <message>
# Example: ./deploy.sh "1.7" "Fix mobile issues and add new features"

set -e

VERSION=$1
MESSAGE=$2

# Check parameters
if [ -z "$VERSION" ] || [ -z "$MESSAGE" ]; then
    echo "Usage: ./deploy.sh <version> <message>"
    echo "Example: ./deploy.sh \"1.7\" \"Fix mobile issues and add new features\""
    exit 1
fi

echo "========================================"
echo "FuelTracker Deploy Script"
echo "========================================"
echo ""

# Check if version.ts exists
VERSION_FILE="src/lib/version.ts"
if [ ! -f "$VERSION_FILE" ]; then
    echo "Error: $VERSION_FILE not found!"
    exit 1
fi

# Update version in version.ts
echo "Updating version to $VERSION..."
NEXT_VERSION=$(echo "$VERSION + 0.1" | bc)
NEXT_VERSION_STR=$(printf "%.1f" "$NEXT_VERSION")

cat > "$VERSION_FILE" <<EOF
export const APP_VERSION = "$VERSION";
export const APP_NAME = "FuelTracker";
export const NEXT_VERSION = "$NEXT_VERSION_STR";
EOF

echo "✓ Version updated to $VERSION (next: $NEXT_VERSION_STR)"
echo ""

# Run build
echo "Running build..."
pnpm run build
if [ $? -ne 0 ]; then
    echo "✗ Build failed!"
    exit 1
fi
echo "✓ Build successful!"
echo ""

# Git add all changes
echo "Staging changes..."
git add .
if [ $? -ne 0 ]; then
    echo "✗ Git add failed!"
    exit 1
fi
echo "✓ Changes staged"
echo ""

# Git commit
echo "Committing changes..."
COMMIT_MESSAGE="Version $VERSION : $MESSAGE"
git commit -m "$COMMIT_MESSAGE"
if [ $? -ne 0 ]; then
    echo "✗ Git commit failed!"
    exit 1
fi
echo "✓ Committed: $COMMIT_MESSAGE"
echo ""

# Git push
echo "Pushing to remote..."
git push
if [ $? -ne 0 ]; then
    echo "✗ Git push failed!"
    exit 1
fi
echo "✓ Pushed successfully!"
echo ""

echo "========================================"
echo "Deploy completed successfully!"
echo "Version: $VERSION"
echo "========================================"
