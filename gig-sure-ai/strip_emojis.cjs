const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (fullPath.endsWith('.jsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('c:/Users/bunny/OneDrive/Desktop/UI + BE/gig-sure-ai/src/pages');

for (const f of files) {
  let text = fs.readFileSync(f, 'utf8');
  
  // Custom manual replacements for known corruptions or emojis we want out
  text = text.replace(/ðŸŒ§ï¸ /g, 'Rain');
  text = text.replace(/ðŸŒ«ï¸ /g, 'Fog');
  text = text.replace(/ðŸ“µ/g, 'Line-chart');
  text = text.replace(/ðŸš¦/g, 'Traffic');
  text = text.replace(/ðŸ“‹/g, 'Clipboard');
  text = text.replace(/ðŸ¤–/g, 'AI Note:');
  text = text.replace(/ðŸŽ‰/g, ''); 
  text = text.replace(/â† /g, '<-');
  text = text.replace(/â†’/g, '->');
  text = text.replace(/ðŸ›¡ï¸/g, ''); // the remaining shield
  
  // also strip any non-ascii emojis
  text = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, ''); 
  // also strip strange windows 1252 to utf8 mojibake
  text = text.replace(/ðŸ[\x80-\xBF]{2}/g, '');
  text = text.replace(/â†[\x80-\xBF]/g, '<-');
  
  fs.writeFileSync(f, text, 'utf8');
}
console.log("Done stripping emojis");
