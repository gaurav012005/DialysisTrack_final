# 📱 PWA Setup Guide - DialysisTrack

## What is a Progressive Web App (PWA)?

A Progressive Web App is a web application that can be installed on your device and works like a native app. DialysisTrack is now a PWA, which means you can:

- ✅ **Install it on your device** - Add to home screen on mobile or desktop
- ✅ **Work offline** - Access the app even without internet (limited functionality)
- ✅ **Faster loading** - Cached resources load instantly
- ✅ **App-like experience** - Full-screen mode without browser UI
- ✅ **Automatic updates** - Always get the latest version

---

## 🚀 How to Install

### On Desktop (Chrome, Edge)

1. **Open the app** in your browser: `http://localhost:3000` (or your deployed URL)
2. **Look for the install icon** in the address bar (⊕ or install icon)
3. **Click "Install"** or use the install prompt that appears
4. **Confirm installation** - The app will open in a new window
5. **Find the app** - Check your Start Menu (Windows) or Applications (Mac)

**Alternative method:**
- Click the three dots menu (⋮) → "Install DialysisTrack"

### On Android (Chrome)

1. **Open the app** in Chrome browser
2. **Tap the menu** (three dots in top right)
3. **Select "Add to Home screen"** or "Install app"
4. **Confirm** - The app icon will appear on your home screen
5. **Launch** - Tap the icon to open the app

### On iOS (Safari)

> **Note:** iOS has limited PWA support. The app will work but some features may be restricted.

1. **Open the app** in Safari browser
2. **Tap the Share button** (square with arrow)
3. **Scroll down** and tap "Add to Home Screen"
4. **Name the app** and tap "Add"
5. **Launch** - Tap the icon on your home screen

---

## 🌐 Offline Functionality

### What Works Offline?

- ✅ **App Interface** - All UI components load from cache
- ✅ **Navigation** - Move between pages
- ✅ **Cached Data** - View previously loaded information
- ✅ **Offline Page** - Friendly message when connection is lost

### What Doesn't Work Offline?

- ❌ **API Calls** - Cannot fetch new data from server
- ❌ **Login** - Cannot authenticate without connection
- ❌ **Data Updates** - Cannot save changes to database
- ❌ **Real-time Features** - Queue updates, notifications

### Offline Indicator

When you lose connection:
- A **yellow banner** appears at the top of the screen
- Shows "You are offline" message
- Provides a **Retry button** to check connection
- Auto-dismisses when connection is restored

---

## 🔧 Technical Details

### Service Worker

The app uses a Service Worker to cache resources:

- **Static Cache** - HTML, CSS, JavaScript files
- **Image Cache** - Icons and images
- **API Cache** - Recent API responses (5 minutes)

**Cache Strategy:**
- **Static Assets** - Cache First (instant loading)
- **API Calls** - Network First (fresh data when online)
- **Offline Fallback** - Shows offline page when network fails

### Manifest

The `manifest.json` file defines:
- App name: "DialysisTrack"
- Theme color: Blue (#2563eb)
- Display mode: Standalone (full-screen)
- Icons: Multiple sizes for different devices
- Shortcuts: Quick access to Dashboard, Queue, Patients

---

## 🎨 Features

### Install Prompt

A beautiful install prompt appears in the bottom-right corner when:
- The app is installable
- You haven't installed it yet
- You haven't dismissed it in the last 7 days

**Benefits shown:**
- ✓ Works offline
- ✓ Faster loading
- ✓ App-like experience

### Automatic Updates

When a new version is available:
- Service Worker detects the update
- Console message: "New version available! Refresh to update."
- Simply refresh the page to get the latest version

---

## 🌍 Browser Compatibility

| Browser | Desktop | Mobile | Install | Offline |
|---------|---------|--------|---------|---------|
| **Chrome** | ✅ Full | ✅ Full | ✅ Yes | ✅ Yes |
| **Edge** | ✅ Full | ✅ Full | ✅ Yes | ✅ Yes |
| **Firefox** | ⚠️ Limited | ⚠️ Limited | ❌ No | ✅ Yes |
| **Safari** | ⚠️ Limited | ⚠️ Limited | ⚠️ iOS Only | ⚠️ Limited |

**Recommended:** Chrome or Edge for best PWA experience

---

## 🔐 HTTPS Requirement

> **IMPORTANT:** Service Workers require HTTPS in production!

- ✅ **Development:** Works on `localhost` without HTTPS
- ❌ **Production:** Must deploy with SSL certificate
- ✅ **Deployment:** Use platforms like Vercel, Netlify, or configure HTTPS on your server

---

## 🐛 Troubleshooting

### Install Button Doesn't Appear

**Possible reasons:**
1. App is already installed
2. Browser doesn't support PWA installation
3. Not using HTTPS (in production)
4. Service Worker failed to register

**Solutions:**
- Check browser console for errors
- Try Chrome or Edge browser
- Ensure HTTPS is enabled (production)
- Clear browser cache and reload

### Offline Mode Not Working

**Check:**
1. Service Worker registered successfully
   - Open DevTools → Application → Service Workers
   - Should show "Activated and running"

2. Cache populated
   - Open DevTools → Application → Cache Storage
   - Should see `dialysistrack-static-v1` and other caches

3. Network tab
   - Check if requests are served from Service Worker

**Fix:**
- Unregister Service Worker and refresh
- Clear all caches
- Hard reload (Ctrl+Shift+R or Cmd+Shift+R)

### App Not Updating

**Solution:**
1. Close all app windows/tabs
2. Open DevTools → Application → Service Workers
3. Click "Unregister" on old service worker
4. Refresh the page
5. New version will install

---

## 📊 Testing PWA

### Chrome DevTools

1. Open DevTools (F12)
2. Go to **Application** tab
3. Check:
   - **Manifest** - All fields populated
   - **Service Workers** - Status: Activated
   - **Cache Storage** - Caches present
   - **Offline** - Test offline mode

### Lighthouse Audit

Run PWA audit:
```bash
npx lighthouse http://localhost:3000 --view --preset=desktop --only-categories=pwa
```

**Expected Score:** 90+

**Criteria:**
- ✅ Installable
- ✅ Has service worker
- ✅ Has manifest
- ✅ Works offline
- ✅ Themed properly

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Test PWA on Chrome desktop
- [ ] Test PWA on Chrome mobile (Android)
- [ ] Test offline functionality
- [ ] Verify install prompt works
- [ ] Run Lighthouse PWA audit
- [ ] Ensure HTTPS is configured
- [ ] Test on different screen sizes
- [ ] Verify icons display correctly
- [ ] Check manifest.json is accessible
- [ ] Test service worker updates

---

## 📝 Updating the PWA

When you make changes:

1. **Update version** in `service-worker.js`:
   ```javascript
   const CACHE_VERSION = 'v2'; // Increment version
   ```

2. **Build the app**:
   ```bash
   npm run build
   ```

3. **Deploy** - Users will get update notification

4. **Users refresh** - New version loads automatically

---

## 🎯 Best Practices

### For Users

- **Install the app** for best experience
- **Keep app updated** - Refresh when prompted
- **Use Chrome/Edge** for full PWA features
- **Check offline banner** - Know when you're offline

### For Developers

- **Version your caches** - Increment version on changes
- **Test offline mode** - Ensure graceful degradation
- **Monitor console** - Check for SW errors
- **Update manifest** - Keep app info current
- **Optimize assets** - Smaller files = faster cache

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Verify HTTPS (production)
3. Clear cache and reload
4. Try different browser
5. Check network connection

---

## 🎉 Enjoy Your PWA!

DialysisTrack is now a modern Progressive Web App. Install it on your devices for the best experience!

**Key Benefits:**
- 🚀 Faster loading
- 📱 Install on any device
- 🌐 Works offline
- 🔄 Auto-updates
- 💪 Native app feel
