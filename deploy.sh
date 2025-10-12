#!/bin/bash

# Auto-deploy script with version bumping
# Usage: ./deploy.sh [patch|minor|major]

VERSION_TYPE=${1:-patch}  # Default to patch if no argument provided

echo "🚀 Starting auto-deploy with $VERSION_TYPE version bump..."

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📋 Current version: $CURRENT_VERSION"

# Bump version
npm version $VERSION_TYPE --no-git-tag-version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "⬆️ Bumped to version: $NEW_VERSION"

# Update version in all relevant files
echo "📝 Updating version references..."

# Update utils/version.ts
sed -i.bak "s/export const APP_VERSION = '.*';/export const APP_VERSION = '$NEW_VERSION';/" utils/version.ts

# Update public/version.json
cat > public/version.json << EOF
{
  "version": "$NEW_VERSION",
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "features": [
    "Global leaderboard with MySQL backend",
    "Cross-device score sync",
    "PWA cache management",
    "Settings with difficulty modes",
    "Pause functionality"
  ]
}
EOF

# Update service worker cache name
sed -i.bak "s/const CACHE_NAME = 'hoppy-game-v.*';/const CACHE_NAME = 'hoppy-game-v$NEW_VERSION';/" public/sw.js

# Update types/settings.ts default version
sed -i.bak "s/version: '.*'/version: '$NEW_VERSION'/" types/settings.ts

# Clean up backup files
rm -f utils/version.ts.bak public/sw.js.bak types/settings.ts.bak

echo "✅ Updated all version references to $NEW_VERSION"

# Git operations
echo "📦 Committing changes..."
git add .
git commit -m "🔖 Release v$NEW_VERSION - Auto-bumped $VERSION_TYPE version

- Updated version tracking across all files
- Refreshed service worker cache name
- Updated build timestamp"

echo "🌐 Pushing to GitHub..."
git push origin main

echo "🎉 Deploy complete! Version $NEW_VERSION is now live."
echo ""
echo "🔧 Next steps:"
echo "   • Users will get update notification automatically"
echo "   • They can click 'Update Now' to clear cache and reload"
echo "   • Service worker will use new cache: hoppy-game-v$NEW_VERSION"