
Front Matter

---

Title Page

PROJECT REPORT ON

DialysisTrack
*(A Comprehensive Dialysis Centre Management System)*

Submitted in partial fulfillment of the requirements for the award of the degree of

BACHELOR OF SCIENCE (COMPUTER SCIENCE)
*(or equivalent degree designation)*

Submitted By:
[Student Name]
Roll No: [Roll Number]

Under the Guidance of:
[Guide Name]

[College/University Name]
[Academic Year]

---

Certificate

This is to certify that the project entitled "DialysisTrack" is a bonafide record of the project work carried out by [Student Name] under my supervision and guidance, in partial fulfillment of the requirements for the award of the degree of Bachelor of Science in Computer Science during the academic year [Academic Year].

The work incorporated in this report is original and has not been submitted elsewhere for the award of any other degree or diploma.


________________________                                ________________________
Internal Guide                                      Head of Department
[Guide Name]                                            [HOD Name]


________________________                                ________________________
External Examiner                                   College Principal
                                                        [Principal Name]

---

Client Certificate

I Care Dialysis Centre
[Centre Address, Pune, Maharashtra]

TO WHOMSOEVER IT MAY CONCERN

This is to certify that [Student Name], a student of [College Name], has successfully completed the software development project titled "DialysisTrack" for our organisation during the period from [Start Date] to [End Date].

During this period, the student successfully analysed our manual operational workflows, gathered requirements, and developed a comprehensive, secure, and user-friendly digital management system. The system successfully implements modules for patient registration, conflict-free appointment scheduling, billing and online payments, clinical data tracking, and real-time ambulance tracking.

We found the student to be sincere, technically proficient, and highly dedicated to solving the operational challenges of our facility. The deployed software meets our requirements and has significantly improved our administrative efficiency.

We wish them success in all future endeavours.

For I Care Dialysis Centre,


________________________
Miss. Varsha Pote
Senior Technician / Client Representative

---

Acknowledgement

I would like to express my deepest gratitude to all those who have provided me with the opportunity to complete this project and have supported me throughout the process.

First and foremost, I express my sincere thanks to my project guide, [Guide Name], for their continuous guidance, technical advice, and encouragement during the development of DialysisTrack. Their insights were invaluable in structuring the system architecture and ensuring the project met academic standards.

I am deeply indebted to Miss. Varsha Pote and the entire staff of I Care Dialysis Centre. Their willingness to share their operational challenges, explain clinical procedures, and provide continuous feedback on the software's functionality was the cornerstone of this project. Without their domain expertise, this system could not have been built to address real-world needs.

I also extend my gratitude to our Head of Department, [HOD Name], and the Principal of [College Name], [Principal Name], for providing the necessary infrastructure and academic environment to undertake this endeavour.

Finally, I would like to thank my family and friends for their unwavering moral support and patience during the long hours of development and testing.

---

Synopsis

Project Title: DialysisTrack

Objective: To design and develop a comprehensive, secure, and automated management system tailored specifically for the operational workflows of a standalone dialysis centre, replacing manual paper-based processes with an integrated digital platform.

Problem Statement: I Care Dialysis Centre relied on physical registers and disjointed spreadsheets for scheduling, billing, and patient records. This led to frequent appointment double-bookings, errors in manual GST and billing computations, difficulties in accessing historical clinical data (such as vital signs and infection statuses), and a complete lack of tracking for the centre's ambulance service.

Proposed Solution: DialysisTrack solves these issues through a centralised, web-based application. It features a strict Role-Based Access Control system for seven user categories (Admin, Doctor, Nurse, Technician, Receptionist, Patient, Driver). Key modules include an intelligent scheduling system with server-side conflict detection to prevent double-booking, an automated billing module integrated with Razorpay and dynamic UPI QR code generation, a clinical module that tracks critical infection safety parameters and auto-computes dialysis adequacy metrics (Kt/V), and a WebSocket-powered live GPS tracking system for the ambulance fleet.

Technology Stack:
*   Backend: Python, Django 4.2, Django REST Framework, Django Channels (WebSockets)
*   Frontend: React.js 18, Vite, React Router, Axios
*   Database: MySQL 8.0
*   Security: JWT Authentication, TOTP Two-Factor Authentication, Bcrypt password hashing
*   External APIs: Razorpay (Payments), Google Maps (Ambulance Tracking)
*   Deployment: Docker, Nginx, ASGI/Daphne

Conclusion: The deployed system successfully digitises the complete patient journey from registration to post-treatment payment. It enforces medical safety compliance, eliminates administrative scheduling conflicts, secures sensitive patient data, and provides facility management with real-time operational visibility, significantly increasing the overall efficiency of the dialysis centre.

---
