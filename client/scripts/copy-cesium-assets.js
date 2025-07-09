const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`Warning: Source directory does not exist: ${src}`);
    return;
  }
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function findAndCopyAssets() {
  const publicCesiumDir = path.join(__dirname, '..', 'public', 'cesium');
  
  // Possible paths for Cesium assets
  const possiblePaths = {
    engine: {
      base: path.join(__dirname, '..', 'node_modules', '@cesium', 'engine'),
      patterns: [
        'Source/Assets',
        'Source/ThirdParty/Workers',
        'Source/Workers',
        'Source/Widgets',
        'Build/Workers',
        'Build/Assets',
        'Build/Cesium/Workers',
        'Build/Cesium/Assets',
        'Build/Cesium/ThirdParty',
      ]
    },
    widgets: {
      base: path.join(__dirname, '..', 'node_modules', '@cesium', 'widgets'),
      patterns: [
        'Source/Widgets',
        'Build/Cesium/Widgets',
      ]
    }
  };

  // Create public/cesium directory if it doesn't exist
  if (!fs.existsSync(publicCesiumDir)) {
    fs.mkdirSync(publicCesiumDir, { recursive: true });
  }

  // Copy engine assets
  for (const pattern of possiblePaths.engine.patterns) {
    const srcPath = path.join(possiblePaths.engine.base, pattern);
    const destPath = path.join(publicCesiumDir, path.basename(pattern));
    if (fs.existsSync(srcPath)) {
      console.log(`Copying ${srcPath} to ${destPath}`);
      copyDir(srcPath, destPath);
    }
  }

  // Copy widget assets
  for (const pattern of possiblePaths.widgets.patterns) {
    const srcPath = path.join(possiblePaths.widgets.base, pattern);
    const destPath = path.join(publicCesiumDir, path.basename(pattern));
    if (fs.existsSync(srcPath)) {
      console.log(`Copying ${srcPath} to ${destPath}`);
      copyDir(srcPath, destPath);
    }
  }

  // Copy specific files
  const filesToCopy = [
    {
      src: path.join(possiblePaths.engine.base, 'Source', 'Assets', 'approximateTerrainHeights.json'),
      dest: path.join(publicCesiumDir, 'approximateTerrainHeights.json')
    },
    {
      src: path.join(possiblePaths.engine.base, 'Source', 'Assets', 'IAU2006_XYS', 'IAU2006_XYS_0.json'),
      dest: path.join(publicCesiumDir, 'IAU2006_XYS_0.json')
    }
  ];

  for (const file of filesToCopy) {
    if (fs.existsSync(file.src)) {
      console.log(`Copying ${file.src} to ${file.dest}`);
      fs.copyFileSync(file.src, file.dest);
    }
  }
}

try {
  findAndCopyAssets();
  console.log('Cesium assets copied successfully');
} catch (error) {
  console.error('Error copying Cesium assets:', error);
  process.exit(1);
} 