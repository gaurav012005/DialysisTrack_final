<div align="center">

<br/><br/><br/>

# TILAK MAHARASHTRA VIDYAPEETH UNIVERSITY

<br/>

## A Project Report On

<br/>

# **DialysisTrack**
## Comprehensive Dialysis Centre Management System

<br/><br/>

### Submitted in partial fulfilment of the requirements for the award of the degree of

## Bachelor of Computer Applications (BCA)

<br/>

### Submitted By

| Sr. No. | Name | PRN |
|:-------:|------|:---:|
| 1 | Gaurav Mahadik| 04423002593 |
| 2 | Sunny Satpute |  04423002700 |

<br/>

### Under the Guidance of

**Prof. [Guide Name]**

<br/>

**Department of Computer Applications**

**Tilak Maharashtra Vidyapeeth, Pune**

**Academic Year: 2025–2026**

</div>

---
<div style="page-break-after: always;"></div>

<div align="center">

# CERTIFICATE

</div>

This is to certify that the project entitled **"DialysisTrack — Comprehensive Dialysis Centre Management System"** has been successfully completed by:

| Sr. No. | Student Name | PRN |
|:-------:|-------------|:---:|
| 1 | Gaurav Mahadik| 04423002593 |
| 2 | Sunny Satpute |  04423002700 |

in partial fulfilment of the requirements for the award of the degree of **Bachelor of Computer Applications (BCA)** from **Tilak Maharashtra Vidyapeeth University** during the academic year **2025–2026**.

The work embodied in this report is a genuine piece of work carried out under my guidance. It has not been submitted to any other university or institution for the award of any degree or diploma.

<br/><br/>

| | |
|:---|---:|
| **Internal Guide** | **External Examiner** |
| | |
| ............................. | ............................. |
| Prof. [Guide Name] | |
| Date: .................. | Date: .................. |

<br/><br/>

<div align="center">

**Head of Department**

.............................

Prof. [HOD Name]

Department of Computer Applications

</div>

---
<div style="page-break-after: always;"></div>

<div align="center">

# ACKNOWLEDGEMENT

</div>

We would like to express our sincere gratitude to all the people who helped us bring this project to completion.

We are deeply grateful to our project guide, **Prof. [Guide Name]**, whose supervision and constructive guidance throughout the project helped us navigate through the technical and academic challenges we faced at every stage.

Our thanks go to **Prof. [HOD Name]**, Head of the Department of Computer Applications, for making sure we had the lab resources, internet access and infrastructure needed to carry out this work.

We sincerely thank the **Principal, [College Name]**, for fostering a supportive academic environment and encouraging students to take on real-world development projects.

We would also like to thank our classmates and friends who volunteered as test users, pointed out bugs, and gave us honest feedback during development. Their input helped us improve the usability of the system significantly.

A special mention goes to the open-source communities behind Django, React, MySQL, and Docker. Without these well-documented frameworks and tools, building a system of this scope within an academic timeline would not have been possible.

Lastly, we thank our families for their patience and support, especially during the long coding sessions and late-night debugging.

<br/><br/>

**Gaurav Vishwanath Mahadik**

**Sunny Sharad Satpute**

Place: Pune

Date: April 2026

---
<div style="page-break-after: always;"></div>

<div align="center">

# DECLARATION

</div>

We hereby declare that the project titled **"DialysisTrack — Comprehensive Dialysis Centre Management System"** submitted by us to **Tilak Maharashtra Vidyapeeth University** in partial fulfilment of the requirement for the award of the degree of **Bachelor of Computer Applications (BCA)** is a record of genuine work carried out by us under the guidance of **Prof. [Guide Name]**.

We further declare that:

1. This project has not been submitted to any other university or institution for the award of any degree or diploma.

2. All data and information in this report has been collected from authentic sources, with references cited wherever applicable.

3. We have followed all ethical norms and university guidelines while developing this project.

4. Any third-party code, library or framework used has been acknowledged with proper attribution in the Bibliography section.

<br/><br/><br/>

| | |
|:---|---:|
| Gaurav Mahadik | Sunny Satpute |
| PRN: 04423002593  | PRN:  04423002700 |
| Signature: .............. | Signature: .............. |

<br/>

Place: Pune

Date: April 2026

---
<div style="page-break-after: always;"></div>

<div align="center">

# ABSTRACT

</div>

Managing a dialysis centre involves coordinating patients, machines, staff schedules, medical records, and billing — all under strict time constraints. Most centres in India still rely on paper registers, spreadsheets, or disconnected software tools that create data silos and slow down decision-making.

DialysisTrack was developed to address these challenges. It is a web-based management system that brings all the day-to-day operations of a dialysis centre into one unified platform. The system handles patient registration and medical records, appointment scheduling across three shifts, a priority-based treatment queue, real-time dialysis session tracking with vital signs documentation, machine inventory and maintenance scheduling, staff scheduling with attendance and leave management, billing with 18% GST auto-calculation and UPI QR code payments, ambulance fleet tracking with live GPS, and downloadable reports in CSV, Excel and PDF formats.

The backend is built with Django REST Framework (Python) serving a RESTful JSON API, and the frontend is a React 18 single-page application. Data is stored in MySQL. Real-time GPS tracking for ambulances uses WebSocket communication via Django Channels. The system implements JWT-based login, role-based access control for seven user types (Admin, Doctor, Nurse, Technician, Receptionist, Patient, Driver), and mandatory two-factor authentication for all staff. It is packaged as a Docker container and deployed behind Nginx as a reverse proxy. The frontend is also configured as a Progressive Web App (PWA) so it can be installed on any device.

**Keywords:** Dialysis Management, Hospital Information System, Django REST Framework, React, JWT, RBAC, WebSocket, PWA, Docker.

---
<div style="page-break-after: always;"></div>

<div align="center">

# TABLE OF CONTENTS

</div>

| Sr. No. | Title | Page |
|:--------|:------|-----:|
| | Certificate | i |
| | Acknowledgement | ii |
| | Declaration | iii |
| | Abstract | iv |
| | Table of Contents | v–vi |
| **1** | **Introduction** | **1** |
| 1.1 | Project Overview | 1 |
| 1.1.1 | What Makes This Different from a Generic HMS | 2 |
| 1.2 | Background and Motivation | 4 |
| 1.2.1 | Understanding Chronic Kidney Disease and Dialysis | 4 |
| 1.2.2 | The Scale of the Problem in India | 5 |
| 1.2.3 | What We Observed at Real Centres | 6 |
| 1.3 | Problem Statement | 7 |
| 1.4 | Objectives | 9 |
| 1.5 | Scope of the Project | 11 |
| 1.5.1 | What is Included | 11 |
| 1.5.2 | What is Not Included (and Why) | 12 |
| 1.5.3 | Project Timeline | 13 |
| **2** | **Proposed System** | **14** |
| 2.1 | Existing System vs Proposed System | 14 |
| 2.1.1 | What Exists Today | 14 |
| 2.1.2 | Problems Identified in Current Systems | 15 |
| 2.1.3 | How DialysisTrack Solves These | 16 |
| 2.1.4 | Cost Comparison | 17 |
| 2.2 | Hardware and Software Specifications | 18 |
| 2.3 | Feasibility Study | 20 |
| 2.3.1 | Technical Feasibility | 20 |
| 2.3.2 | Economic Feasibility | 21 |
| 2.3.3 | Operational Feasibility | 22 |
| 2.3.4 | Schedule Feasibility | 23 |
| 2.4 | Technology Stack | 24 |
| 2.4.1 | Backend — Django REST Framework | 24 |
| 2.4.2 | Frontend — React 18 with Vite | 25 |
| 2.4.3 | Database — MySQL 8.0 | 26 |
| 2.4.4 | Deployment — Docker and Nginx | 27 |
| 2.5 | User Roles and Access Control | 28 |
| 2.5.1 | RBAC Design | 28 |
| 2.5.2 | Permission Matrix | 29 |
| 2.5.3 | Two-Factor Authentication Requirements | 30 |
| **3** | **System Analysis and Design** | **31** |
| 3.1 | Nomenclature — Diagram Symbols and Notation | 31 |
| 3.2 | Data Flow Diagram | 33 |
| 3.3 | Use Case Diagram | 35 |
| 3.4 | Class Diagram | 38 |
| 3.5 | Sequence Diagram | 40 |
| 3.6 | Activity Diagram | 42 |
| 3.7 | Statechart Diagram | 44 |
| 3.8 | Collaboration Diagram | 46 |
| 3.9 | Component Diagram | 47 |
| 3.10 | Deployment Diagram | 48 |
| **4** | **Database Design** | **50** |
| 4.1 | Database Schema Overview | 50 |
| 4.1.1 | Database Engine | 51 |
| 4.1.2 | Normalisation | 51 |
| 4.2 | Table Design (18 Tables) | 52 |
| 4.3 | Relationships and Constraints | 58 |
| 4.3.1 | Foreign Key Summary | 58 |
| 4.3.2 | Key Design Decisions Explained | 60 |
| **5** | **Implementation** | **61** |
| 5.1 | Backend Implementation | 61 |
| 5.1.1 | Project Structure | 61 |
| 5.1.2 | How Django REST Framework Works | 62 |
| 5.1.3 | Custom User Model | 62 |
| 5.1.4 | Role-Based Permission Class | 63 |
| 5.1.5 | Patient Auto-ID Generation | 64 |
| 5.1.6 | Bill Auto-Calculation | 64 |
| 5.1.7 | API Endpoint Summary | 65 |
| 5.1.8 | JWT Authentication Configuration | 66 |
| 5.1.9 | WebSocket Consumer for GPS | 67 |
| 5.2 | Frontend Implementation | 68 |
| 5.2.1 | Frontend Project Structure | 68 |
| 5.2.2 | Authentication Context | 68 |
| 5.2.3 | Role-Based Route Guards | 69 |
| 5.2.4 | Reusable Components | 70 |
| 5.2.5 | Dark Mode Implementation | 70 |
| 5.3 | Authentication and Security | 71 |
| 5.3.1 | Layer 1 — JWT Authentication | 71 |
| 5.3.2 | Layer 2 — Role-Based Access Control | 72 |
| 5.3.3 | Layer 3 — Two-Factor Authentication | 72 |
| 5.3.4 | Additional Security Measures | 73 |
| 5.4 | Real-Time Features | 74 |
| 5.5 | Progressive Web App | 75 |
| **6** | **Screen Designs** | **76** |
| 6.1 | Login and Authentication Screens | 76 |
| 6.2 | Dashboard Screens | 78 |
| 6.3 | Module Screens | 80 |
| 6.4 | Common UI Patterns | 85 |
| **7** | **Testing** | **86** |
| 7.1 | Testing Strategy | 86 |
| 7.2 | Test Cases and Results | 87 |
| 7.3 | Role Permission Testing | 90 |
| 7.4 | Test Results Summary | 91 |
| **8** | **Deployment** | **92** |
| 8.1 | Docker Setup | 92 |
| 8.2 | Nginx Configuration | 93 |
| 8.3 | Production Deployment Steps | 94 |
| 8.4 | Backup Strategy | 94 |
| **9** | **User Manual** | **95** |
| 9.1 | Setting Up for Development | 95 |
| 9.2 | Staff First Login and 2FA Setup | 96 |
| 9.3 | Common Task Guide | 97 |
| **10** | **Future Scope** | **98** |
| 10.1 | Dialysis Machine Integration | 98 |
| 10.2 | Native Mobile Applications | 98 |
| 10.3 | Telemedicine Module | 99 |
| 10.4 | Multi-Centre Support | 99 |
| 10.5 | Lab Integration | 99 |
| 10.6 | AI-Powered Scheduling | 100 |
| 10.7 | Multi-Language Support | 100 |
| 10.8 | Pharmacy Module | 100 |
| 10.9 | HL7/FHIR Compliance | 101 |
| 10.10 | Automated UPI Payment Verification | 101 |
| **11** | **Conclusion** | **102** |
| 11.1 | What We Built | 102 |
| 11.2 | What Went Well | 102 |
| 11.3 | Challenges We Faced | 103 |
| 11.4 | What Could Be Improved | 104 |
| 11.5 | Final Thoughts | 104 |
| **12** | **Bibliography** | **105** |

