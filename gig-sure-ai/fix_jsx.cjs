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
  
  // Replace unbraced <- with html entity or english
  // Be safe, just replace `<- ` with `Back: ` or `&larr; `
  text = text.replace(/<\- /g, 'Back ');
  text = text.replace(/ \->/g, ' Next');
  
  fs.writeFileSync(f, text, 'utf8');
}
console.log("Done fixing JSX");
