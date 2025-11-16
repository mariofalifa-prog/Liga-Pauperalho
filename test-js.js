// Simple Node.js test to verify JavaScript modules load correctly
const fs = require('fs');
const path = require('path');

console.log('Testing JavaScript files for syntax errors...\n');

const jsFiles = [
    'js/utils.js',
    'js/data.js',
    'js/auth.js',
    'js/league.js',
    'js/rankings.js',
    'js/games.js',
    'js/admin.js',
    'js/app.js'
];

let allPassed = true;

jsFiles.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');

        // Basic syntax check using eval (in try-catch)
        try {
            // Remove require/module.exports statements for browser environment simulation
            const browserCode = content
                .replace(/require\([^)]+\)/g, '{}')
                .replace(/module\.exports[^;]+;?/g, '')
                .replace(/if\s*\(typeof module[^}]+}/g, '');

            // Basic syntax validation
            new Function(browserCode);
            console.log(`✓ ${file} - Syntax OK`);
        } catch (syntaxError) {
            console.log(`✗ ${file} - Syntax Error: ${syntaxError.message}`);
            allPassed = false;
        }

    } catch (readError) {
        console.log(`✗ ${file} - Read Error: ${readError.message}`);
        allPassed = false;
    }
});

console.log('\n' + '='.repeat(50));
if (allPassed) {
    console.log('✅ All JavaScript files passed syntax validation!');
    console.log('The admin functionality should work without errors.');
} else {
    console.log('❌ Some files have syntax errors that need to be fixed.');
}

// Check for specific methods that were missing
console.log('\n' + '='.repeat(50));
console.log('Checking for critical methods...');

try {
    const appContent = fs.readFileSync('js/app.js', 'utf8');
    const utilsContent = fs.readFileSync('js/utils.js', 'utf8');

    const criticalMethods = [
        { file: 'app.js', method: 'showModal' },
        { file: 'app.js', method: 'closeModal' },
        { file: 'app.js', method: 'getAvatarUrl' },
        { file: 'utils.js', method: 'formatDateTime' }
    ];

    let methodsFound = 0;
    criticalMethods.forEach(({ file, method }) => {
        const content = file === 'app.js' ? appContent : utilsContent;
        if (content.includes(method)) {
            console.log(`✓ ${method} found in ${file}`);
            methodsFound++;
        } else {
            console.log(`✗ ${method} missing from ${file}`);
        }
    });

    if (methodsFound === criticalMethods.length) {
        console.log('\n✅ All critical methods are present!');
        console.log('The admin panel should work without JavaScript errors.');
    } else {
        console.log('\n❌ Some critical methods are still missing.');
    }

} catch (error) {
    console.log(`Error checking methods: ${error.message}`);
}