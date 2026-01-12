// Simple script to generate sample wallpapers
// This creates HTML files that can be opened in a browser and saved as images
// Or you can use an online tool to convert the HTML to images

const fs = require('fs');
const path = require('path');

const wallpapersDir = path.join(__dirname, '..', 'public', 'wallpapers');

// Ensure directory exists
if (!fs.existsSync(wallpapersDir)) {
  fs.mkdirSync(wallpapersDir, { recursive: true });
}

// Create HTML files for each wallpaper that can be converted to images
const wallpapers = [
  {
    name: 'wallpaper1',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    title: 'Purple Gradient'
  },
  {
    name: 'wallpaper2',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    title: 'Pink Gradient'
  },
  {
    name: 'wallpaper3',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    title: 'Blue Gradient'
  },
  {
    name: 'wallpaper4',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    title: 'Green Gradient'
  },
  {
    name: 'wallpaper5',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    title: 'Sunset Gradient'
  }
];

// Create HTML files for manual conversion
wallpapers.forEach((wp, index) => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${wp.title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 1920px;
      height: 1080px;
      background: ${wp.gradient};
      overflow: hidden;
    }
  </style>
</head>
<body></body>
</html>`;
  
  const htmlPath = path.join(wallpapersDir, `${wp.name}.html`);
  fs.writeFileSync(htmlPath, html);
});

console.log('Created HTML wallpaper files in public/wallpapers/');
console.log('To convert to images:');
console.log('1. Open each HTML file in a browser');
console.log('2. Take a screenshot or use a tool to convert HTML to image');
console.log('3. Save as JPG files with the same names (wallpaper1.jpg, etc.)');
console.log('');
console.log('Alternatively, you can use online tools like:');
console.log('- https://htmlcsstoimage.com/');
console.log('- Or add your own wallpaper images to public/wallpapers/');



