const fs = require('fs');
const path = require('path');
const d = __dirname;
fs.readdirSync(d).filter(f => f.endsWith('.jsx')).forEach(f => {
    let p = path.join(d, f);
    let c = fs.readFileSync(p, 'utf8');
    let m = c.replace(/<Header([\s\S]*?)\/>/g, (match, body) => {
        if (body.includes('user=')) return match;
        return `<Header user={user} ${body}/>`;
    });
    // Add user destructing if missing from component parameters array
    m = m.replace(/const\s+\w+\s*=\s*\(\s*\{([^}]*)\}\s*\)\s*=>/g, (match, p1) => {
        return p1.includes('user') || !match.includes('=>') ? match : match.replace('{', '{ user, ');
    });

    if (m !== c) {
        fs.writeFileSync(p, m);
        console.log('Updated Header in ' + f);
    }
});
