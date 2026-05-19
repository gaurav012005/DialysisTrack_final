
Chapter – 5 : Testing Procedures

---

5.1 Overview of Testing

Software testing is the process of executing a program or system with the intent of finding errors, verifying that the system behaves according to its specified requirements, and confirming that it meets the needs of its intended users. For a system such as DialysisTrack, which directly supports patient care operations and financial record-keeping in a healthcare environment, rigorous testing is not merely a best practice — it is a necessity. An error in appointment conflict detection could result in two patients being physically present at the same machine at the same time. An error in billing computation could result in financial discrepancies. An error in authentication could expose sensitive patient medical data to unauthorised users.

The testing of DialysisTrack was structured across five distinct phases: Unit Testing, Integration Testing, System Testing, Security Testing, and User Acceptance Testing. Each phase targeted a different level of the system and addressed a different category of potential failure. Together, these phases provided a comprehensive verification of the system's correctness, reliability, and security.

---

5.2 Unit Testing

Unit testing involves testing individual, isolated functions or methods to verify that each produces the correct output for a given input, independent of the rest of the system. Unit tests for DialysisTrack were written using Python's built-in unittest module within Django's test framework. Django's test runner creates a temporary in-memory database for each test run, ensuring that tests are completely isolated from the production or development database.

The Appointment Conflict Validator was the most critical function tested at the unit level. This function is responsible for preventing machine double-booking. Test cases were designed to cover every possible timing scenario: a completely non-overlapping appointment on the same machine on the same day (should pass), an appointment where the proposed start time falls within an existing session (should fail), an appointment where the proposed end time extends into an existing session (should fail), an appointment with a start and end time identical to an existing appointment (should fail), and an appointment on a different machine with the same time (should pass). All five test cases produced the expected results.

The GST Calculation Function was tested with multiple scenarios. Given a base session cost of two thousand five hundred rupees with medicine charges of five hundred rupees and a consultation fee of five hundred rupees, the subtotal should be three thousand five hundred rupees, the GST at eighteen percent should be six hundred and thirty rupees, and the total should be four thousand one hundred and thirty rupees. The function produced the correct result to two decimal places in all tested scenarios.

The patient_id auto-generation was tested to verify sequential numbering. The first patient registered should receive ID P-001, the tenth should receive P-010, and the hundredth should receive P-100. The function produced the correct result in all cases.

The infection status property methods on the Patient model were unit tested. A patient with hepatitis_b_status set to positive was verified to return True from the is_infection_positive and requires_isolated_machine properties. A patient with all three statuses set to negative was verified to return False from is_infection_positive.

---

5.3 Integration Testing

Integration testing verifies that separate components of the system work correctly when combined. After individual modules pass unit testing, integration tests check that the data flowing between modules produces the expected results.

The Appointment Creation API Integration Test creates test records for a patient, a doctor-role user, and a machine, then sends an authenticated POST request to the appointment creation endpoint with non-conflicting timing data. The test verifies that the API returns a 201 Created response, that a new Appointment record exists in the test database with the correct field values, and that the machine is subsequently shown as unavailable for the same time slot.

The Duplicate Appointment Rejection Integration Test repeats the appointment creation with the same machine and an overlapping time window. The test verifies that the API returns a 400 Bad Request response containing a conflict error message, and that no second Appointment record has been created in the database.

The Session Completion and Auto-Billing Integration Test creates a Queue entry and marks it as In Progress, then sends a completion request. The test verifies that the queue entry status changes to Completed, that the actual_end_time is recorded, and that a corresponding Bill record is automatically present in the billing table with the correct patient reference and a status of Pending.

The Role Permission Integration Test verifies that the RBAC enforcement works correctly across the API layer. A Nurse-role JWT token was used to attempt a DELETE request on a patient record, which is restricted to Admin only. The test verifies that the API returns a 403 Forbidden response and that no deletion occurs in the database.

---

5.4 System Testing

System testing involves testing complete end-to-end workflows that span the entire application — from a user action on the frontend, through the API, through the database, and back to the frontend. These tests were performed manually against a live running development instance of the application.

Complete Patient Registration to Payment Workflow: A new patient was registered through the Receptionist interface, completing all required fields including infection status and consent information. An appointment was booked for the patient on a specific machine and date. On the day of the appointment, the patient was checked in through the queue management screen. The session was started by the technician, vital signs were entered by the nurse at regular intervals, and the session was completed. The system was verified to have automatically generated a bill for the patient. The payment was processed through the UPI QR code method — the QR code was displayed correctly on the payment screen, and upon marking the payment as received, the bill status updated to Paid with the correct timestamp recorded.

Emergency Surcharge System Test: A patient was flagged as is_emergency = True. A walk-in payment was initiated for this patient. The payment screen was verified to display the twenty percent emergency surcharge as a separate line item in the bill breakdown, computed correctly on the base session cost, before the total was presented for payment.

Ambulance Dispatch and GPS Tracking System Test: An ambulance dispatch was created for a test patient. The tracking page was opened in a separate browser window. A manual location update was posted to the ride's location update endpoint to simulate the driver submitting GPS coordinates. The ambulance marker on the Google Maps tracking view was verified to move to the updated coordinates. When the same tracking page was navigated away from and then revisited, the map was verified to render correctly without any blank display area.

Clinical Infection Safety System Test: A patient's Hepatitis B status was set to positive. The admin dashboard clinical alerts panel was verified to increment the infection-positive patient count. The patient's profile was then opened through the Clinical Data management interface, and the requires_isolated_machine indicator was confirmed to be displayed with a warning indicator.

---

5.5 Security Testing

Security testing for DialysisTrack focused on the authentication system, the role-based access control mechanism, and common web application vulnerabilities.

JWT Tampering Test: A valid access token for a Patient-role user was obtained through normal login. The token's payload was decoded from its base64 representation, the role field was modified from patient to admin, and the modified payload was re-encoded and sent in an API request that requires Admin permissions. The backend correctly rejected the tampered token with a 401 Unauthorised response, confirming that the JWT signature verification is functioning correctly.

Role Escalation Test: A valid, unmodified Nurse-role JWT token was used to send a direct HTTP DELETE request to a patient deletion endpoint that is restricted to Admin only. The backend returned a 403 Forbidden response, confirming that the permission check is enforced independently at the API level and cannot be bypassed through direct HTTP requests that bypass the frontend interface.

SQL Injection Test: Form input fields including the patient registration form's name fields, the appointment notes field, and the search box on the patient listing page were tested with SQL injection payloads. Because all database interactions in DialysisTrack go through Django's ORM, which uses parameterised queries internally, all injection payloads were stored as harmless literal strings in the database without any query execution. No SQL injection vulnerability was found in any input.

CORS Configuration Test: An HTTP request was sent from an origin that is not on the configured CORS allowed list. The server correctly rejected the request with an appropriate CORS error, confirming that cross-origin requests from unauthorised domains are blocked.

---

5.6 Test Case Specification

The following table presents the formal test case records executed during the testing phase, documenting each test case with its module, description, input, expected output, actual output, and status.

| TC No. | Module | Test Case Description | Input Data | Expected Output | Actual Output | Result |
|:---:|---|---|---|---|---|:---:|
| TC-01 | Login | Valid credentials, no 2FA | Correct email and password | JWT token issued, redirect to dashboard | JWT issued, redirect successful | PASS |
| TC-02 | Login | Invalid password | Correct email, wrong password | 401 error returned | 401 error with generic message | PASS |
| TC-03 | Login | 2FA required role | Admin correct credentials | OTP screen shown, no token yet | OTP screen displayed | PASS |
| TC-04 | Appointment | Valid new booking | Non-conflicting machine, date, time | 201 Created, appointment saved | 201, record created correctly | PASS |
| TC-05 | Appointment | Conflicting booking | Same machine, overlapping time | 400 error, conflict message | 400, conflict message returned | PASS |
| TC-06 | Session | Complete session | Queue ID, post-vitals data | Status Completed, bill auto-generated | Session completed, bill created | PASS |
| TC-07 | Billing | GST calculation | Session cost 2500, GST 18% | GST 450, Total 2950 | GST 450, Total 2950 | PASS |
| TC-08 | Billing | UPI QR code display | Pending bill | QR code image shown with correct amount | QR rendered with correct UPI link | PASS |
| TC-09 | Billing | Emergency surcharge | is_emergency patient | 20% surcharge shown in breakdown | Surcharge computed and displayed correctly | PASS |
| TC-10 | RBAC | Nurse deletes patient | Nurse JWT, DELETE request | 403 Forbidden | 403 returned | PASS |
| TC-11 | RBAC | Patient views own data | Patient JWT, own profile | Profile data returned | Correct profile returned | PASS |
| TC-12 | Fleet | Ambulance dispatch | Ambulance ID, patient ID | Ride created, ambulance marked on_trip | Ride created, status updated | PASS |
| TC-13 | Fleet | GPS location update | Ride ID, lat/lng coordinates | Location saved, map marker updated | Location saved correctly | PASS |
| TC-14 | Fleet | HTTP polling fallback | WSGI server, no WebSocket | Polling activates after timeout | Polling started after 5 seconds | PASS |
| TC-15 | Fleet | Map renders on revisit | Navigate back to tracking page | Map displays without blank box | Map rendered correctly on revisit | PASS |
| TC-16 | Clinical | Infection flag display | Patient Hep-B positive | Dashboard infection count increments | Count incremented correctly | PASS |
| TC-17 | Clinical | Screening overdue | Screening date over 90 days ago | Overdue count increments on dashboard | Count incremented | PASS |
| TC-18 | Clinical | Consent expiry flag | Consent expiry date in past | Consent issues count increments | Count incremented | PASS |
| TC-19 | Security | JWT tamper | Modified payload, original signature | 401 Unauthorised returned | 401 returned | PASS |
| TC-20 | Security | SQL injection | Injection payload in name field | Input stored as literal string | String stored, no query execution | PASS |
| TC-21 | Patient | New patient registration | Complete form data | Patient created with auto patient_id | Patient created, P-code assigned | PASS |
| TC-22 | 2FA | Valid OTP | Correct TOTP code from authenticator | JWT issued after OTP verification | JWT issued | PASS |
| TC-23 | 2FA | Expired OTP | TOTP code from previous 30-second window | 400 Invalid OTP | 400 error returned | PASS |
| TC-24 | Reports | Session summary report | Admin role, 7-day date range | Report data returned correctly | Report data accurate | PASS |
| TC-25 | Notifications | Ambulance dispatch notification | Patient linked to dispatch | Notification created for patient user | Notification created and visible | PASS |

All twenty-five formal test cases passed. The complete test coverage across unit, integration, system, and security testing confirms that DialysisTrack behaves correctly under normal operating conditions, handles error cases gracefully, and enforces its security boundaries effectively.

---
