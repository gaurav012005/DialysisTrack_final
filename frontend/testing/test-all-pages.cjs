const fs = require('fs');
const path = require('path');

console.log('📄 Checking ALL React Pages...\n');

const pages = [
  { file: 'Login.jsx', route: '/login', public: true },
  { file: 'Dashboard.jsx', route: '/dashboard', public: false },
  { file: 'Patients.jsx', route: '/patients', public: false },
  { file: 'Queue.jsx', route: '/queue', public: false },
  { file: 'Machines.jsx', route: '/machines', public: false },
  { file: 'Staff.jsx', route: '/staff', public: false },
  { file: 'Reports.jsx', route: '/reports', public: false },
  { file: 'NotFound.jsx', route: '/any-invalid-route', public: true }
];

let missingPages = [];

pages.forEach(page => {
  const filePath = path.join('src', 'pages', page.file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${page.file} - Route: ${page.route} ${page.public ? '(Public)' : '(Protected)'}`);
  } else {
    console.log(`❌ ${page.file} - MISSING!`);
    missingPages.push(page.file);
  }
});

console.log('\n📊 SUMMARY:');
console.log(`Total Pages: ${pages.length}`);
console.log(`Found: ${pages.length - missingPages.length}`);
console.log(`Missing: ${missingPages.length}`);

if (missingPages.length > 0) {
  console.log('\n🚨 Missing pages that need to be created:');
  missingPages.forEach(page => console.log(`   - ${page}`));
  
  console.log('\n💡 Quick fix - create missing pages:');
  missingPages.forEach(page => {
    const pageName = page.replace('.jsx', '');
    console.log(`   Create src/pages/${page} with basic ${pageName} component`);
  });
} else {
  console.log('\n🎉 SUCCESS: All pages are implemented!');
  console.log('\n🌐 Available Routes:');
  pages.forEach(page => {
    console.log(`   http://localhost:3000${page.route}`);
  });
}