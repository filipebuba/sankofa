const fs = require('fs');

let content = fs.readFileSync('c:/Users/fbg67/Documents/GitHub/sankofa/data/enigmas.js', 'utf8');

let count = 0;
let newContent = content.replace(/world:\s*(\d+),([\s\S]*?)options:\s*(\[[^\]]+\]),\s*correct:\s*(\d+),/g, (match, worldStr, middleStr, optionsStr, correctStr) => {
    let world = parseInt(worldStr);
    let correct = parseInt(correctStr);
    
    // Determine the number of options based on the world
    let targetOptionsCount = 4;
    if (world === 1) targetOptionsCount = 2;
    if (world === 2 || world === 3) targetOptionsCount = 3; // Making world 2 & 3 have 3 options
    // Worlds 4, 5, 6, 7, 8 will have 4 options
    
    // We already shuffled in the previous script, but let's parse and adjust size
    let options;
    try {
        options = JSON.parse(optionsStr);
    } catch(e) {
        console.log("Failed to parse options:", optionsStr);
        return match;
    }
    
    let correctString = options[correct];
    
    if (options.length > targetOptionsCount) {
        // Keep the correct one, and take (targetOptionsCount - 1) other distractors
        let distractors = options.filter(o => o !== correctString);
        // Shuffle distractors
        for (let i = distractors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
        }
        
        let newOptions = [correctString, ...distractors.slice(0, targetOptionsCount - 1)];
        
        // Shuffle the newOptions again so correct isn't always first
        for (let i = newOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newOptions[i], newOptions[j]] = [newOptions[j], newOptions[i]];
        }
        
        options = newOptions;
        correct = options.indexOf(correctString);
    } else {
        // If it's already the right size or smaller, just shuffle to be safe
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        correct = options.indexOf(correctString);
    }
    
    let newOptionsStr;
    if (optionsStr.includes('\n')) {
        newOptionsStr = '[\n      ' + options.map(o => JSON.stringify(o)).join(',\n      ') + '\n    ]';
    } else {
        newOptionsStr = '[' + options.map(o => JSON.stringify(o)).join(', ') + ']';
    }
    
    count++;
    return `world: ${world},${middleStr}options: ${newOptionsStr},\n    correct: ${correct},`;
});

console.log("Modified " + count + " enigmas to scale difficulty.");
fs.writeFileSync('c:/Users/fbg67/Documents/GitHub/sankofa/data/enigmas.js', newContent);
