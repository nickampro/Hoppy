// Simple icon generator for PWA
function createIcon(size, filename) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(0, 0, size, size);
  
  // Simple rabbit emoji/icon
  ctx.fillStyle = '#ffffff';
  ctx.font = `${size * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🐰', size / 2, size / 2);
  
  // Convert to blob and download
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

// Generate icons
createIcon(192, 'icon-192x192.png');
createIcon(512, 'icon-512x512.png');
createIcon(180, 'icon-apple-touch.png');