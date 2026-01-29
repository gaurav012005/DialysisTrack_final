# Frontend Testing Scripts

This folder contains all testing scripts and HTML test pages for the DialysisTrack frontend.

## Test Files

### `test-all-pages.cjs`
Node.js script to test all frontend pages programmatically.

**Usage:**
```bash
cd frontend
node testing/test-all-pages.cjs
```

**What it tests:**
- All route pages (Dashboard, Patients, Queue, Machines, etc.)
- Component rendering
- API integration
- Navigation flow

### `test-cors.html`
HTML page to test CORS (Cross-Origin Resource Sharing) configuration between frontend and backend.

**Usage:**
1. Make sure backend is running on `http://localhost:8000`
2. Open `test-cors.html` in a browser
3. Check browser console for CORS errors

**What it tests:**
- API endpoint accessibility
- CORS headers
- Authentication token handling

### `test-navigation.html`
Standalone HTML page to test navigation and routing functionality.

**Usage:**
1. Open `test-navigation.html` directly in a browser
2. Test navigation between different pages
3. Verify route changes

**What it tests:**
- Client-side routing
- Navigation links
- Page transitions
- URL parameter handling

## Running Tests

### Test All Pages (Automated)
```bash
cd frontend
node testing/test-all-pages.cjs
```

### Test CORS (Manual)
1. Start backend: `cd backend && python manage.py runserver`
2. Start frontend: `cd frontend && npm run dev`
3. Open `frontend/testing/test-cors.html` in browser
4. Check console for results

### Test Navigation (Manual)
1. Open `frontend/testing/test-navigation.html` in browser
2. Click through navigation links
3. Verify page content loads correctly

## Integration Testing

For full integration testing with both frontend and backend:

1. **Start Backend:**
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Login with Test Credentials:**
   - Admin: `admin@test.com` / `admin123`
   - Doctor: `doctor@test.com` / `doctor123`
   - Nurse: `nurse@test.com` / `nurse123`
   - etc.

4. **Test User Workflows:**
   - Admin: User management, system configuration
   - Doctor: Patient diagnosis, queue management
   - Nurse: Queue management, patient care
   - Technician: Machine maintenance
   - Receptionist: Patient registration, appointments
   - Patient: View own appointments and records

## Notes

- Make sure both backend and frontend servers are running for full testing
- Test files are for development/debugging only
- Do not deploy test files to production
