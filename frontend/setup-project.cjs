const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Setting up Dialysis Queue Frontend...');

// Create essential files if they don't exist
const files = {
  'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dialysis Queue Management System</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
  
  'src/main.jsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
  
  'src/App.jsx': `import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Dialysis<span className="text-blue-600">Queue</span>
        </h1>
        <p className="text-gray-600 mb-8">Hospital Management System</p>
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Welcome! 🎉</h2>
          <p className="text-gray-600 mb-4">Your React app is working!</p>
          <button 
            onClick={() => alert('React is configured correctly!')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Test Button
          </button>
        </div>
      </div>
    </div>
  )
}

export default App`,
  
  'src/styles/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  min-height: 100vh;
}`
};

Object.entries(files).forEach(([filePath, content]) => {
  if (!fs.existsSync(filePath)) {
    console.log(`📁 Creating ${filePath}...`);
    const dir = filePath.split('/').slice(0, -1).join('/');
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content);
  }
});

// Install dependencies if node_modules doesn't exist
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
} else {
  console.log('✅ Dependencies already installed');
}

console.log('✅ Setup complete!');
console.log('🚀 Run: npm run dev');
console.log('🌐 Your app will open at: http://localhost:3000');