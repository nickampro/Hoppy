// Quick version bump utility
// Run: node bump-version.js [patch|minor|major]

const fs = require('fs');
const path = require('path');

const versionType = process.argv[2] || 'patch';
const packagePath = path.join(__dirname, 'package.json');

// Read current package.json
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const currentVersion = packageJson.version;

// Parse version
const [major, minor, patch] = currentVersion.split('.').map(Number);

// Calculate new version
let newVersion;
switch (versionType) {
    case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
    case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
    case 'patch':
    default:
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
}

console.log(`🔖 Bumping version: ${currentVersion} → ${newVersion}`);

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

// Update utils/version.ts
const versionTsPath = path.join(__dirname, 'utils/version.ts');
let versionTs = fs.readFileSync(versionTsPath, 'utf8');
versionTs = versionTs.replace(/export const APP_VERSION = '.*';/, `export const APP_VERSION = '${newVersion}';`);
fs.writeFileSync(versionTsPath, versionTs);

// Update public/version.json
const versionJsonPath = path.join(__dirname, 'public/version.json');
const versionJson = {
    version: newVersion,
    buildDate: new Date().toISOString(),
    features: [
        "Global leaderboard with MySQL backend",
        "Cross-device score sync", 
        "PWA cache management",
        "Settings with difficulty modes",
        "Pause functionality"
    ]
};
fs.writeFileSync(versionJsonPath, JSON.stringify(versionJson, null, 2) + '\n');

// Update service worker
const swPath = path.join(__dirname, 'public/sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');
swContent = swContent.replace(/const CACHE_NAME = 'hoppy-game-v.*';/, `const CACHE_NAME = 'hoppy-game-v${newVersion}';`);
fs.writeFileSync(swPath, swContent);

// Update settings default
const settingsPath = path.join(__dirname, 'types/settings.ts');
let settingsContent = fs.readFileSync(settingsPath, 'utf8');
settingsContent = settingsContent.replace(/version: '.*'/, `version: '${newVersion}'`);
fs.writeFileSync(settingsPath, settingsContent);

console.log('✅ Updated all version references!');
console.log('📋 Files updated:');
console.log('   • package.json');
console.log('   • utils/version.ts');
console.log('   • public/version.json');
console.log('   • public/sw.js');
console.log('   • types/settings.ts');
console.log('');
console.log('🚀 Ready to commit and deploy!');