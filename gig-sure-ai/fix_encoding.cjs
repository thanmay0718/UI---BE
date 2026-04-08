const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/bunny/OneDrive/Desktop/UI + BE/gig-sure-ai/src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

const replacements = {
  'âœ“': '✓',
  'â†’': '→',
  'â† ': '←',
  'ðŸ”—': '🔗',
  'ðŸŽ‰': '🎉',
  'â€¢': '•',
  'â‚¹': '₹',
  'â”€': '─',
  'â• ': '═',
  'âš¡': '⚡',
  'ðŸ›¡ï¸ ': '🛡️'
};

for (const f of files) {
  const file = path.join(dir, f);
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const [bad, good] of Object.entries(replacements)) {
    if (content.includes(bad)) {
        content = content.split(bad).join(good);
        changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', f);
  }
}
