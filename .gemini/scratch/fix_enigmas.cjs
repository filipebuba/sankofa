const fs = require('fs');

let content = fs.readFileSync('c:/Users/fbg67/Documents/GitHub/sankofa/data/enigmas.js', 'utf8');

let count = 0;
let newContent = content.replace(/world:\s*(\d+),([\s\S]*?)options:\s*(\[[^\]]+\]),\s*correct:\s*(\d+),/g, (match, worldStr, middleStr, optionsStr, correctStr) => {
    let world = parseInt(worldStr);
    let correct = parseInt(correctStr);
    
    // We only change if it's not world 2
    if (world === 2) {
        return match; // leave world 2 alone
    }
    
    let options;
    try {
        options = JSON.parse(optionsStr);
    } catch(e) {
        console.log("Failed to parse options:", optionsStr);
        return match;
    }
    
    let correctString = options[correct];
    
    // Shuffle
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    
    let newCorrect = options.indexOf(correctString);
    
    let newOptionsStr;
    if (optionsStr.includes('\n')) {
        newOptionsStr = '[\n      ' + options.map(o => JSON.stringify(o)).join(',\n      ') + '\n    ]';
    } else {
        newOptionsStr = '[' + options.map(o => JSON.stringify(o)).join(', ') + ']';
    }
    
    count++;
    return `world: ${world},${middleStr}options: ${newOptionsStr},\n    correct: ${newCorrect},`;
});

console.log("Modified " + count + " enigmas");
fs.writeFileSync('c:/Users/fbg67/Documents/GitHub/sankofa/data/enigmas.js', newContent);
