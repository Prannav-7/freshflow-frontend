console.log('=================================');
console.log('🔍 Environment Variable Check');
console.log('=================================');
console.log('');
console.log('Current API URL:', import.meta.env.VITE_API_URL);
console.log('');
console.log('Expected:', 'https://fresh-flow-fa56.onrender.com');
console.log('');

if (import.meta.env.VITE_API_URL === 'https://fresh-flow-fa56.onrender.com') {
    console.log('✅ Configuration is CORRECT!');
    console.log('Your app will connect to the Render backend.');
} else if (import.meta.env.VITE_API_URL === 'http://localhost:5000') {
    console.log('⚠️  Configuration is set to LOCALHOST!');
    console.log('Your app will try to connect to local backend.');
    console.log('');
    console.log('To fix:');
    console.log('1. Update frontend/.env to use Render URL');
    console.log('2. Restart the dev server');
} else if (!import.meta.env.VITE_API_URL) {
    console.log('❌ VITE_API_URL is NOT SET!');
    console.log('');
    console.log('To fix:');
    console.log('1. Create frontend/.env file');
    console.log('2. Add: VITE_API_URL=https://fresh-flow-fa56.onrender.com');
    console.log('3. Restart the dev server');
} else {
    console.log('⚠️  Unexpected value:', import.meta.env.VITE_API_URL);
}

console.log('');
console.log('=================================');
