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

const repl = [
  ['â€“', '–'],
  ['â€”', '—'],
  ['â† ', '←'],
  ['â†’', '→'],
  ['â• ', '═'],
  ['â”€', '─'],
  ['âœ“', '✓'],
  ['ðŸ›¡ï¸ ', '🛡️'],
  ['ðŸ›¡ï¸', '🛡️'],
  ['âš¡', '⚡'],
  ['ðŸŽ‰', '🎉'],
  ['â€¢', '•']
];

for (const f of files) {
  let text = fs.readFileSync(f, 'utf8');
  let changed = false;
  for (const [k, v] of repl) {
    if (text.indexOf(k) !== -1) {
      text = text.split(k).join(v);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(f, text, 'utf8');
    console.log('Fixed', f);
  }
}
