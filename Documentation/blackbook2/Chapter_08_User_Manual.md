
Chapter – 8 : User Manual

---

8.1 Introduction to the User Manual

This User Manual provides step-by-step instructions for operating the core functions of the DialysisTrack system. Because DialysisTrack uses a Role-Based Access Control architecture, your experience of the system will depend entirely on your assigned role. This manual covers the essential workflows for the Receptionist, Clinical Staff (Nurses and Technicians), and the Administrator.

---

8.2 System Access and Authentication

Logging In: Open your web browser and navigate to the DialysisTrack URL provided by your facility administrator. On the login screen, enter your registered email address and your password. Click the "Login" button.

Two-Factor Authentication (Clinical and Admin Staff): If your account has Two-Factor Authentication enabled, successful password entry will direct you to an OTP verification screen. Open the authenticator app (such as Google Authenticator) on your mobile device, read the current six-digit code for DialysisTrack, enter it into the input field on the screen, and click "Verify."

Resetting a Forgotten Password: If you cannot remember your password, click the "Forgot Password?" link on the login screen. Enter your registered email address and click "Send Reset Link." Check your email inbox for a message from the system containing a secure reset link. Click the link and follow the prompts to establish a new password.

---

8.3 Receptionist Workflows

Registering a New Patient:
1. From the sidebar navigation, click on Patients.
2. Click the + New Patient button located at the top right of the screen.
3. Fill in the required personal details in the first section of the form (Name, Date of Birth, Gender, Contact details).
4. Fill in the required medical details in the second section (Diagnosis, Blood Type, Infection Status). *Note: Ensure Hepatitis B, C, and HIV statuses are accurately recorded as this affects machine assignment.*
5. Record the patient's consent status and dates.
6. Click Save Patient. The system will confirm successful registration and display the auto-generated Patient ID (e.g., P-045).

Booking an Appointment:
1. From the sidebar navigation, click on Appointments.
2. Click the + Book Appointment button.
3. In the "Select Patient" field, begin typing the patient's name or ID and select them from the dropdown list.
4. Select the desired Date for the appointment.
5. The Machine and Doctor dropdowns will automatically update. Select an available Machine and an available Doctor.
6. Select the Start Time.
7. Click Confirm Booking. If the selected slot conflicts with an existing booking, the system will alert you to choose a different time or machine.

Generating and Collecting Payment:
1. When a clinical staff member completes a session, the bill is automatically generated. Navigate to the Billing section from the sidebar.
2. Locate the patient's pending bill in the list and click Process Payment.
3. Review the itemised charges and the computed GST.
4. Select the Payment Method:
   - For Cash, verify the amount received and click "Confirm Payment."
   - For UPI, select the UPI option. A QR code will appear on screen. Ask the patient to scan the code with their mobile payment app. Once they confirm the transaction is successful on their device, click "Confirm Payment."
5. The bill status will update to "Paid" and a receipt can be printed.

Dispatching an Ambulance:
1. Navigate to Ambulance Management from the sidebar.
2. Click Dispatch Ambulance.
3. Select the target Patient and choose an Available Ambulance from the dropdown list.
4. Verify the pickup address and click Dispatch. The ambulance status will change to "On Trip" and you can track its location on the map view.

---

8.4 Clinical Staff Workflows (Nurses & Technicians)

Managing the Daily Queue:
1. Navigate to Queue from the sidebar. This screen shows all patients scheduled for the current day.
2. When a patient arrives at the facility, locate their name in the "Waiting" section and click Check-In.
3. When the assigned machine is prepared and the patient is ready, click Start Session. The patient's status will change to "In Progress."

Recording Session Vitals:
1. From the Queue screen, locate a patient whose session is "In Progress" and click Record Vitals.
2. In the Pre-Dialysis section, enter the initial Blood Pressure, Heart Rate, and Weight.
3. During the session, update the Dialysis Parameters (Blood Flow Rate, UF Volume).
4. Enter any administered medications or observed complications in the respective text areas.
5. At the end of the session, enter the Post-Dialysis vitals.
6. Click Save Records.

Completing a Session:
1. Once the dialysis session is physically concluded and the patient is disconnected, return to the Queue screen.
2. Locate the patient and click Complete Session.
3. This action automatically triggers the billing system to generate the invoice at the reception desk.

---

8.5 Administrator Workflows

Reviewing Operational Metrics:
1. Upon logging in, the Administrator lands directly on the Dashboard.
2. Review the top metric cards for an immediate summary of daily revenue, active sessions, and total patient count.
3. Check the Clinical Alerts panel for any patients requiring updated infection screening or renewed consent forms.

Generating Reports:
1. Navigate to Reports from the sidebar.
2. Select the report type (e.g., Revenue Summary, Session Count, Machine Utilisation).
3. Select the desired Date Range.
4. Click Generate Report. The data will be displayed on screen and can be downloaded as a CSV file for external accounting or management use.

Managing Staff Accounts:
1. Navigate to Staff from the sidebar.
2. To add a new employee, click + Add Staff Member.
3. Fill in their details, assign the appropriate Role (e.g., Nurse, Driver), and provide a temporary password.
4. To deactivate a staff member who has left the facility, locate their record, click Edit, and uncheck the "Active" status. This immediately revokes their access to the system.

---
