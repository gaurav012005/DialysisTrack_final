<div style="page-size: A4; margin: 2.5cm;">

<!-- ============================================================ -->
<!--                     TITLE PAGE                                -->
<!-- ============================================================ -->

<div align="center" style="page-break-after: always;">

<br/><br/><br/><br/>

# SAVITRIBAI PHULE PUNE UNIVERSITY

<br/>

## A Project Report On

<br/>

# **DialysisTrack â€” Comprehensive Dialysis Management System**

<br/>

### Submitted in partial fulfilment of the requirements for the award of the degree of

## **Bachelor of Computer Applications (BCA)**

<br/>

### Submitted By

**Student 1 Name â€” PRN: XXXXXXXXXX**

**Student 2 Name â€” PRN: XXXXXXXXXX**

<br/>

### Under the Guidance of

**Prof. [Guide Name]**

<br/>

### Department of Computer Applications

**[College Name]**

**Academic Year: 2025â€“2026**

</div>

---

<!-- ============================================================ -->
<!--                     CERTIFICATE                               -->
<!-- ============================================================ -->

<div align="center" style="page-break-after: always;">

<br/><br/>

# CERTIFICATE

<br/>

This is to certify that the project titled **"DialysisTrack â€” Comprehensive Dialysis Management System"** has been successfully completed by:

| Sr. No. | Student Name | PRN |
|---------|-------------|-----|
| 1 | Student 1 Name | XXXXXXXXXX |
| 2 | Student 2 Name | XXXXXXXXXX |

in partial fulfilment of the requirements for the award of the degree of **Bachelor of Computer Applications (BCA)** from **Savitribai Phule Pune University** during the academic year **2025â€“2026**.

<br/><br/><br/>

| | |
|---|---|
| **Internal Guide** | **External Examiner** |
| | |
| __________________ | __________________ |
| Prof. [Guide Name] | |
| Date: ____________ | Date: ____________ |

<br/><br/>

**Head of Department**

__________________

Prof. [HOD Name]

Department of Computer Applications

[College Name]

</div>

---

<!-- ============================================================ -->
<!--                     ACKNOWLEDGEMENT                           -->
<!-- ============================================================ -->

<div style="page-break-after: always;">

# ACKNOWLEDGEMENT

We would like to express our sincere gratitude to all those who have contributed to the successful completion of this project.

First and foremost, we extend our heartfelt thanks to our project guide, **Prof. [Guide Name]**, for their invaluable guidance, constant encouragement, and expert advice throughout the development of this project. Their deep knowledge and constructive feedback helped us overcome numerous technical challenges.

We are grateful to **Prof. [HOD Name]**, Head of the Department of Computer Applications, for providing us with the necessary infrastructure and resources to carry out this work.

We also express our sincere thanks to the **Principal, [College Name]**, for granting us permission and facilities to undertake this project.

We acknowledge the support of our classmates and friends who helped us with testing, feedback, and moral support during the different phases of development.

We are thankful to various online communities, open-source contributors, and documentation writers whose resources helped us learn and implement modern web technologies.

Finally, we are deeply indebted to our families for their unwavering support, patience, and encouragement throughout our academic journey.

<br/><br/>

**Student 1 Name**

**Student 2 Name**

Place: [City]

Date: April 2026

</div>

---

<!-- ============================================================ -->
<!--                     DECLARATION                               -->
<!-- ============================================================ -->

<div style="page-break-after: always;">

# DECLARATION

We hereby declare that the project titled **"DialysisTrack â€” Comprehensive Dialysis Management System"** submitted by us to **Savitribai Phule Pune University** in partial fulfilment of the requirement for the award of the degree of **Bachelor of Computer Applications (BCA)** is a bona fide record of the work carried out by us under the guidance of **Prof. [Guide Name]**.

We further declare that:

1. This work has not been submitted to any other university or institution for the award of any degree, diploma, or academic recognition.

2. The information and data included in this report are original and have been collected from authentic sources, with proper references cited wherever applicable.

3. We have followed all ethical norms and guidelines prescribed by the university while developing this project.

4. Any third-party libraries, frameworks, or code used in this project have been duly acknowledged with proper attribution.

<br/><br/><br/>

| | |
|---|---|
| Student 1 Name | Student 2 Name |
| PRN: XXXXXXXXXX | PRN: XXXXXXXXXX |
| Signature: _________ | Signature: _________ |

<br/>

Place: [City]

Date: April 2026

</div>

---

<!-- ============================================================ -->
<!--                     ABSTRACT                                  -->
<!-- ============================================================ -->

<div style="page-break-after: always;">

# ABSTRACT

**DialysisTrack** is a comprehensive, full-stack web-based hospital management system purpose-built for dialysis centres. Chronic Kidney Disease (CKD) affects millions worldwide, and dialysis remains a critical life-sustaining treatment. Managing patients, scheduling sessions, monitoring machines, and tracking billing in dialysis centres is a complex, multi-stakeholder process that demands precision and efficiencyâ€”qualities that traditional paper-based or fragmented digital systems often fail to deliver.

This project addresses that gap by providing a unified, role-based, real-time management platform. The system is architected as a three-tier application: a **React 18** single-page application (SPA) on the frontend, a **Django REST Framework** API on the backend, and a **MySQL** relational database for persistent storage. Communication between the frontend and backend is performed via RESTful JSON APIs. Additionally, **WebSocket** communication (via Django Channels and Daphne) is employed for real-time ambulance GPS tracking.

DialysisTrack encompasses **12 backend modules** and **10 frontend modules**, covering:

- **Patient Management** â€” Registration, medical history, dialysis-specific data, emergency triage, patient portal with PDF downloads.
- **Appointment Scheduling** â€” Shift-based booking (morning, evening, night), status lifecycle management, and calendar views.
- **Queue Management** â€” Real-time dialysis queue with priority levels (emergency, scheduled, walk-in), automatic wait-time estimation, and machine assignment.
- **Dialysis Session Tracking** â€” Pre- and post-dialysis vital signs, dialysis parameters (blood flow rate, heparin dose, ultrafiltration), medications, and complication recording.
- **Machine Management** â€” Equipment inventory, status tracking, maintenance scheduling, cleaning logs, and utilization statistics.
- **Staff Management** â€” Scheduling (three shifts), attendance tracking, leave request workflows, and workload monitoring.
- **Billing & Payments** â€” Auto-calculated bills with 18% GST, multi-method payments (Cash, UPI with QR code, Card, Net Banking), insurance management, and receipt generation.
- **Reports & Analytics** â€” Dashboard statistics, patient/queue/machine/staff/financial reports, and multi-format exports (CSV, Excel, PDF).
- **Ambulance Fleet Management** â€” Dispatch, ride status tracking, and real-time GPS tracking via WebSocket.
- **Two-Factor Authentication** â€” Mandatory TOTP-based 2FA for all staff, QR-code setup, backup codes, and a grace-period system.
- **Notifications & Audit Log** â€” In-app notifications, password reset, and a comprehensive audit trail.
- **Progressive Web App (PWA)** â€” Installable on any device, offline capability, and service-worker caching.

Security is enforced through **JWT authentication** with token refresh and blacklisting, **Role-Based Access Control (RBAC)** with 7 user roles (Admin, Doctor, Nurse, Technician, Receptionist, Patient, Driver), rate-limited login, and IDOR protection.

The system is containerised with **Docker** and deployed behind an **Nginx** reverse proxy, making it production-ready. The development environment uses Vite for rapid frontend iteration and Django's built-in development server.

**Keywords:** Dialysis Management, Hospital Information System, Role-Based Access Control, JWT Authentication, Two-Factor Authentication, Real-Time Queue, WebSocket, Progressive Web App, Django REST Framework, React.

</div>

---

<!-- ============================================================ -->
<!--                     TABLE OF CONTENTS                         -->
<!-- ============================================================ -->

<div style="page-break-after: always;">

# TABLE OF CONTENTS

| Chapter | Title | Page |
|---------|-------|------|
| | Certificate | i |
| | Acknowledgement | ii |
| | Declaration | iii |
| | Abstract | iv |
| | Table of Contents | v |
| | List of Figures | viii |
| | List of Tables | ix |
| **1** | **Introduction** | **1** |
| 1.1 | Background | 1 |
| 1.2 | Problem Statement | 2 |
| 1.3 | Objectives | 3 |
| 1.4 | Scope of the Project | 4 |
| 1.5 | Organization of the Report | 5 |
| **2** | **Literature Survey** | **6** |
| 2.1 | Existing Systems | 6 |
| 2.2 | Comparative Analysis | 8 |
| 2.3 | Research Papers Reviewed | 9 |
| 2.4 | Technology Survey | 10 |
| **3** | **System Analysis & Requirement Specification** | **12** |
| 3.1 | Feasibility Study | 12 |
| 3.2 | Functional Requirements | 14 |
| 3.3 | Non-Functional Requirements | 16 |
| 3.4 | Software & Hardware Requirements | 17 |
| 3.5 | User Roles & Permissions | 18 |
| **4** | **System Design** | **20** |
| 4.1 | System Architecture | 20 |
| 4.2 | Data Flow Diagrams | 22 |
| 4.3 | Use Case Diagrams | 26 |
| 4.4 | Class Diagrams | 30 |
| 4.5 | Sequence Diagrams | 34 |
| 4.6 | Entity Relationship Diagram | 38 |
| 4.7 | Activity Diagrams | 42 |
| 4.8 | Component Diagram | 44 |
| 4.9 | Deployment Diagram | 46 |
| 4.10 | Database Design | 48 |
| **5** | **Implementation** | **52** |
| 5.1 | Technology Stack | 52 |
| 5.2 | Backend Implementation | 54 |
| 5.3 | Frontend Implementation | 62 |
| 5.4 | Authentication & Security | 68 |
| 5.5 | Real-Time Features | 70 |
| 5.6 | Progressive Web App | 71 |
| **6** | **Testing** | **72** |
| 6.1 | Testing Strategy | 72 |
| 6.2 | Unit Testing | 73 |
| 6.3 | Integration Testing | 74 |
| 6.4 | Role Permission Testing | 75 |
| 6.5 | Test Results | 76 |
| **7** | **Deployment** | **78** |
| 7.1 | Docker Containerization | 78 |
| 7.2 | Nginx Configuration | 79 |
| 7.3 | Production Setup | 80 |
| **8** | **Results & Screenshots** | **81** |
| 8.1 | Login & 2FA Screenshots | 81 |
| 8.2 | Dashboard Screenshots | 82 |
| 8.3 | Module Screenshots | 83 |
| **9** | **Conclusion & Future Scope** | **86** |
| 9.1 | Conclusion | 86 |
| 9.2 | Future Scope | 87 |
| 9.3 | Limitations | 88 |
| | **References** | **89** |
| | **Appendix A â€” API Endpoints** | **91** |
| | **Appendix B â€” Database Schema** | **94** |
| | **Appendix C â€” Access Control Matrix** | **96** |
| | **Appendix D â€” Code Snippets** | **98** |

</div>

---

<!-- ============================================================ -->
<!--                     LIST OF FIGURES                            -->
<!-- ============================================================ -->

<div style="page-break-after: always;">

# LIST OF FIGURES

| Figure No. | Title | Page |
|-----------|-------|------|
| 1.1 | DialysisTrack System Overview | 1 |
| 4.1 | Three-Tier System Architecture | 20 |
| 4.2 | High-Level Architecture Diagram | 21 |
| 4.3 | Level 0 Data Flow Diagram (Context Diagram) | 22 |
| 4.4 | Level 1 Data Flow Diagram | 23 |
| 4.5 | Level 2 DFD â€” Patient Management | 24 |
| 4.6 | Level 2 DFD â€” Queue Management | 25 |
| 4.7 | Use Case Diagram â€” Overall System | 26 |
| 4.8 | Use Case Diagram â€” Patient Registration | 28 |
| 4.9 | Use Case Diagram â€” Appointment Scheduling | 28 |
| 4.10 | Use Case Diagram â€” Treatment Session | 29 |
| 4.11 | Class Diagram â€” Core Domain Model | 30 |
| 4.12 | Class Diagram â€” Authentication & Authorization | 32 |
| 4.13 | Sequence Diagram â€” Patient Registration | 34 |
| 4.14 | Sequence Diagram â€” Appointment Scheduling | 35 |
| 4.15 | Sequence Diagram â€” Dialysis Session | 36 |
| 4.16 | Sequence Diagram â€” Payment Processing | 37 |
| 4.17 | Entity Relationship Diagram | 38 |
| 4.18 | Activity Diagram â€” Patient Registration | 42 |
| 4.19 | Activity Diagram â€” Dialysis Session | 43 |
| 4.20 | Activity Diagram â€” Appointment Booking | 43 |
| 4.21 | Component Diagram | 44 |
| 4.22 | Deployment Diagram â€” Production | 46 |
| 4.23 | Deployment Diagram â€” Development | 46 |
| 4.24 | Deployment Architecture â€” Scaled | 47 |
| 5.1 | JWT Authentication Flow | 68 |
| 5.2 | 2FA Setup Flow | 69 |
| 7.1 | Docker Container Architecture | 78 |
| 8.1 | Login Page | 81 |
| 8.2 | 2FA Setup Screen | 81 |
| 8.3 | Admin Dashboard | 82 |
| 8.4 | Patient Dashboard / Portal | 82 |
| 8.5 | Patient Management Page | 83 |
| 8.6 | Queue Management Page | 83 |
| 8.7 | Machine Management Page | 84 |
| 8.8 | Billing Page | 84 |
| 8.9 | Reports & Analytics | 85 |
| 8.10 | Ambulance Fleet Management | 85 |

</div>

---

<!-- ============================================================ -->
<!--                     LIST OF TABLES                             -->
<!-- ============================================================ -->

<div style="page-break-after: always;">

# LIST OF TABLES

| Table No. | Title | Page |
|----------|-------|------|
| 2.1 | Comparative Analysis of Existing Systems | 8 |
| 3.1 | Functional Requirements Summary | 14 |
| 3.2 | Non-Functional Requirements | 16 |
| 3.3 | Software Requirements | 17 |
| 3.4 | Hardware Requirements | 17 |
| 3.5 | User Roles & Access Summary | 18 |
| 4.1 | Database Tables â€” Users | 48 |
| 4.2 | Database Tables â€” Patients | 49 |
| 4.3 | Database Tables â€” Appointments | 49 |
| 4.4 | Database Tables â€” Queue | 50 |
| 4.5 | Database Tables â€” DialysisSession | 50 |
| 4.6 | Database Tables â€” DialysisMachine | 51 |
| 4.7 | Database Tables â€” Bill | 51 |
| 5.1 | Backend Dependencies | 52 |
| 5.2 | Frontend Dependencies | 53 |
| 5.3 | Backend Module Summary | 54 |
| 5.4 | Frontend Module Summary | 62 |
| 6.1 | Role Permission Test Matrix | 75 |
| 6.2 | Test Results Summary | 76 |
| A.1 | Authentication API Endpoints | 91 |
| A.2 | Patient API Endpoints | 91 |
| A.3 | Queue API Endpoints | 92 |
| A.4 | Machines API Endpoints | 92 |
| A.5 | Billing API Endpoints | 93 |
| A.6 | Reports API Endpoints | 93 |
| C.1 | Complete Access Control Matrix | 96 |

</div>

---

<!-- ============================================================ -->
<!--              CHAPTER 1: INTRODUCTION                          -->
<!-- ============================================================ -->

<div style="page-break-after: always;">

# Chapter 1: INTRODUCTION

## 1.1 Background

Chronic Kidney Disease (CKD) is a global health crisis affecting an estimated 850 million people worldwide, with approximately 3.9 million patients requiring dialysis treatment to sustain life. In India alone, over 200,000 patients undergo regular dialysis, a number growing at 10â€“15% annually due to the rising prevalence of diabetes and hypertension â€” the two leading causes of CKD.

Dialysis is a medical procedure that artificially removes waste products and excess fluid from the blood when the kidneys can no longer perform this function. Hemodialysis, the most common form, requires patients to visit dialysis centres 2â€“3 times per week for sessions lasting 3â€“4 hours each. Each session involves sophisticated equipment, trained medical staff, careful scheduling, and meticulous record-keeping of patient vitals, medications, and treatment parameters.

Managing a dialysis centre is inherently complex. On any given day, hospital administrators must coordinate:

- **Patient Scheduling** â€” Booking appointments across morning, evening, and night shifts while accommodating emergency walk-ins alongside scheduled patients.
- **Machine Allocation** â€” Assigning patients to available dialysis machines, tracking machine status, and scheduling preventive maintenance.
- **Clinical Workflow** â€” Recording pre-dialysis and post-dialysis vital signs, monitoring patients during sessions, documenting complications, and maintaining treatment histories.
- **Staff Management** â€” Scheduling doctors, nurses, and technicians across shifts, tracking attendance, and managing leave requests.
- **Financial Operations** â€” Generating bills, processing payments through multiple methods (cash, UPI, card), tracking insurance claims, and generating financial reports.
- **Emergency Response** â€” Dispatching ambulances, tracking drivers, and managing patient transport.

Many dialysis centres in India, particularly in smaller cities and towns, still rely on paper-based registers, spreadsheets, or fragmented software solutions that do not integrate all operational aspects into a unified system. This leads to inefficiencies, data silos, delayed decision-making, and, most critically, potential medical errors.

**DialysisTrack** was conceived to solve these challenges by providing a single, comprehensive, web-based management system that handles every aspect of dialysis centre operations â€” from the moment a patient is registered to the generation of treatment reports and billing.

## 1.2 Problem Statement

Existing systems for dialysis management suffer from the following critical limitations:

1. **Fragmented Solutions** â€” Different aspects of centre operations (scheduling, clinical records, billing, inventory) are managed using separate tools that do not communicate with each other, leading to data duplication and inconsistencies.

2. **Lack of Real-Time Visibility** â€” Hospital staff cannot see the current state of the queue, machine availability, or active sessions in real time, causing delays and suboptimal resource utilization.

3. **Inadequate Security** â€” Many systems lack robust authentication, role-based access control, and audit trails, exposing sensitive patient health information (PHI) to unauthorized access.

4. **No Patient Self-Service** â€” Patients have no way to view their own appointments, treatment history, or billing information online, increasing the administrative burden on hospital staff.

5. **Paper-Based Record Keeping** â€” Vital signs, dialysis parameters, and complications recorded on paper are difficult to analyse, prone to errors, and impossible to search retrospectively.

6. **No Mobile Access** â€” Staff who are away from their desks (e.g., nurses on the floor, technicians in the machine room) cannot access the system conveniently.

7. **No Fleet Management** â€” Ambulance dispatch and tracking are handled manually with no real-time GPS visibility.

## 1.3 Objectives

The primary objectives of the DialysisTrack project are:

1. **Develop a comprehensive web application** that integrates all operational aspects of a dialysis centre into a single, unified platform.

2. **Implement role-based access control** with seven distinct user roles (Admin, Doctor, Nurse, Technician, Receptionist, Patient, Driver), each with granular permissions tailored to their responsibilities.

3. **Create a real-time queue management system** that supports priority-based scheduling (emergency, scheduled, walk-in) with automatic wait-time estimation and machine allocation.

4. **Provide a patient self-service portal** where patients can view their appointments, treatment history, session vitals, and billing information, and download PDF reports.

5. **Implement a secure authentication system** using JWT tokens with refresh mechanism, mandatory two-factor authentication (2FA) for all staff, and comprehensive audit logging.

6. **Build a complete billing module** with auto-calculated totals, GST computation, multi-method payment processing (Cash, UPI with QR code, Card, Net Banking), and invoice generation.

7. **Enable real-time ambulance tracking** using WebSocket communication for live GPS coordinate updates between drivers and hospital staff.

8. **Develop a Progressive Web App (PWA)** that can be installed on any device and provides offline capability with service-worker caching.

9. **Generate comprehensive reports** with multi-format export capabilities (CSV, Excel, PDF) for patient data, queue performance, machine utilization, staff attendance, and financial metrics.

10. **Containerize the application** using Docker for consistent, reproducible deployment across environments.

## 1.4 Scope of the Project

### In Scope

The following features and modules are included in the current version of DialysisTrack:

| Module | Features |
|--------|----------|
| **User Management** | Registration, login, profile, RBAC with 7 roles, rate-limited login |
| **Patient Management** | CRUD operations, medical history, dialysis-specific data, emergency triage, portal access |
| **Appointment Scheduling** | Shift-based booking, status lifecycle, calendar views |
| **Queue Management** | Real-time queue, priority levels, machine assignment, wait time estimation |
| **Session Tracking** | Pre/post vitals, dialysis parameters, medications, complications, notes |
| **Machine Management** | Inventory, status tracking, maintenance scheduling, cleaning logs, utilization stats |
| **Staff Management** | Scheduling (3 shifts), attendance, leave requests, workload monitoring |
| **Billing & Payments** | Auto-calc bills, GST, multi-method payments, UPI QR, insurance, receipts |
| **Reports & Analytics** | Dashboard stats, multi-type reports, CSV/Excel/PDF export |
| **Fleet Management** | Ambulance dispatch, ride tracking, WebSocket GPS |
| **Two-Factor Auth** | TOTP setup, QR code, backup codes, grace period, mandatory for staff |
| **Notifications** | In-app notifications, password reset, audit log |
| **PWA** | Installable app, offline support, service worker caching |

### Out of Scope

The following are not included in the current version but are listed as potential future enhancements:

- Direct medical device integration (e.g., dialysis machine data feed)
- Native mobile applications (iOS/Android) â€” though the PWA provides mobile access
- Telemedicine/video consultation
- Multi-hospital/multi-branch deployment
- Electronic Medical Records (EMR) standard compliance (HL7/FHIR)
- Pharmacy inventory management
- Laboratory Information System (LIS) integration

## 1.5 Organization of the Report

This report is organized into the following chapters:

- **Chapter 1: Introduction** â€” Background, problem statement, objectives, and scope.
- **Chapter 2: Literature Survey** â€” Review of existing systems, comparative analysis, and technology assessment.
- **Chapter 3: System Analysis & Requirement Specification** â€” Feasibility study, functional and non-functional requirements, and user role definitions.
- **Chapter 4: System Design** â€” UML diagrams including DFDs, use-case diagrams, class diagrams, sequence diagrams, ER diagram, activity diagrams, component and deployment diagrams, and database design.
- **Chapter 5: Implementation** â€” Detailed description of the technology stack and implementation of backend, frontend, authentication, real-time features, and PWA.
- **Chapter 6: Testing** â€” Testing strategy, test cases, role-permission testing, and results.
- **Chapter 7: Deployment** â€” Docker containerization, Nginx configuration, and production setup.
- **Chapter 8: Results & Screenshots** â€” Visual demonstrations of all major features.
- **Chapter 9: Conclusion & Future Scope** â€” Summary, potential enhancements, and limitations.
- **References** â€” Books, websites, and research papers consulted.
- **Appendices** â€” API endpoint catalog, database schema, access control matrix, and code snippets.

</div>

---

<!-- ============================================================ -->
<!--              CHAPTER 2: LITERATURE SURVEY                     -->
<!-- ============================================================ -->

<div style="page-break-after: always;">

# Chapter 2: LITERATURE SURVEY

## 2.1 Existing Systems

A thorough review of existing dialysis management systems and hospital information systems (HIS) was conducted to understand the current landscape and identify gaps that DialysisTrack aims to fill.

### 2.1.1 Fresenius Medical Care â€” EuCliD

Fresenius Medical Care, one of the world's largest providers of dialysis products and services, offers **EuCliD** (European Clinical Database), a clinical management system for their network of dialysis centres. EuCliD captures clinical data, treatment parameters, and laboratory results across thousands of centres globally.

**Strengths:** Large-scale deployment, integration with Fresenius machines, comprehensive clinical data capture.

**Limitations:** Proprietary system locked to Fresenius hardware; not available for independent centres; no patient self-service portal; significant licensing costs.

### 2.1.2 DaVita â€” Clinical Enterprise

DaVita, another major dialysis provider, utilizes its own clinical management platform to manage patient records, scheduling, and treatment across its centres.

**Strengths:** End-to-end operations management, integrated billing with US insurance systems.

**Limitations:** US-centric; not customizable for Indian healthcare norms (GST billing, UPI payments); no ambulance management; proprietary and expensive.

### 2.1.3 NephroPlus â€” In-House System

NephroPlus, India's largest dialysis network, uses a custom in-house system for managing its 300+ centres across India.

**Strengths:** Designed for Indian context; multi-centre support; patient engagement features.

**Limitations:** Proprietary; not available for independent centres or smaller hospitals; limited information available publicly about its architecture.

### 2.1.4 Open-Source Hospital Management Systems

Several open-source HIS exist, such as **OpenMRS**, **Bahmni**, and **GNU Health**. While these are general-purpose hospital management systems with some dialysis-relevant features, none provides a purpose-built, end-to-end dialysis management solution with features like real-time queue management, machine lifecycle tracking, and ambulance GPS integration.

### 2.1.5 Generic EMR/EHR Systems

Systems like **Epic**, **Cerner** (now Oracle Health), and **MEDITECH** are enterprise-grade electronic health record systems used by large hospitals. While comprehensive, they are prohibitively expensive for small-to-medium dialysis centres, require extensive customization for dialysis-specific workflows, and are overkill for single-centre deployments.

## 2.2 Comparative Analysis

The following table compares DialysisTrack with existing systems across key features:

**Table 2.1: Comparative Analysis of Existing Systems**

| Feature | EuCliD | DaVita | NephroPlus | OpenMRS | DialysisTrack |
|---------|--------|--------|------------|---------|---------------|
| Dialysis-Specific | âœ… | âœ… | âœ… | âŒ | âœ… |
| Open Source / Free | âŒ | âŒ | âŒ | âœ… | âœ… |
| Indian Context (GST, UPI) | âŒ | âŒ | âœ… | âŒ | âœ… |
| Patient Self-Service Portal | âŒ | Limited | Limited | âŒ | âœ… |
| Real-Time Queue Management | âŒ | Limited | Unknown | âŒ | âœ… |
| Ambulance GPS Tracking | âŒ | âŒ | âŒ | âŒ | âœ… |
| Two-Factor Authentication | âœ… | âœ… | Unknown | âŒ | âœ… |
| PWA / Offline Support | âŒ | âŒ | âŒ | âŒ | âœ… |
| Multi-Method Payment | âŒ | âœ… | âœ… | âŒ | âœ… |
| PDF/Excel/CSV Export | âœ… | âœ… | âœ… | Limited | âœ… |
| Role-Based Access (7 roles) | Limited | âœ… | âœ… | Limited | âœ… |
| Machine Maintenance Tracking | âœ… | Limited | Unknown | âŒ | âœ… |
| Staff Scheduling & Attendance | âŒ | âœ… | âœ… | âŒ | âœ… |
| Audit Logging | Limited | âœ… | Unknown | âŒ | âœ… |
| Docker Deployment | âŒ | âŒ | âŒ | âœ… | âœ… |

**Key Finding:** No existing system combines all the features that DialysisTrack offers â€” dialysis-specific workflow, Indian-context billing (GST + UPI), real-time queue, ambulance GPS, patient portal, PWA, and open-source availability â€” in a single, integrated platform.

## 2.3 Research Papers Reviewed

The following research literature informed the design and development of DialysisTrack:

1. **"Computerized Health Information Systems in Dialysis Units"** â€” Islam et al. (2020), Journal of Medical Internet Research. This paper analysed the adoption of HIS in dialysis centres and identified key success factors: real-time data capture, role-based access, and integration of clinical and administrative workflows.

2. **"Design and Implementation of Hospital Management System Using Web Technologies"** â€” Sharma & Patel (2019), International Journal of Computer Applications. This study provided a blueprint for web-based HIS using REST APIs and SPA architecture, validating the Django + React approach.

3. **"Security Framework for Healthcare Web Applications"** â€” Rajput & Singh (2021), IEEE International Conference on Healthcare Informatics. This paper recommended JWT + RBAC + 2FA as the minimum security triad for healthcare applications, a recommendation adopted fully by DialysisTrack.

4. **"Real-Time Patient Queue Management in Healthcare"** â€” Chen et al. (2020), BMC Medical Informatics. This research demonstrated the effectiveness of priority-based queue algorithms in reducing patient wait times by 30â€“40%, informing the queue management design.

5. **"Progressive Web Apps in Healthcare"** â€” Kumar & Sharma (2022), International Journal of Medical Informatics. This paper validated the use of PWAs in healthcare for mobile-friendly access without requiring native app development.

## 2.4 Technology Survey

### 2.4.1 Backend Framework Selection

| Framework | Language | Pros | Cons | Selected? |
|-----------|----------|------|------|-----------|
| **Django** | Python | Batteries-included, ORM, admin panel, large community | Monolithic, can be slow for I/O-bound tasks | âœ… Yes |
| Express.js | JavaScript | Fast, lightweight, flexible | No built-in ORM, requires many third-party packages | âŒ |
| Spring Boot | Java | Enterprise-grade, strong typing | Verbose, steep learning curve, heavy | âŒ |
| Laravel | PHP | Elegant syntax, good ORM | PHP ecosystem limitations for real-time | âŒ |
| FastAPI | Python | Async, fast, auto-docs | Young ecosystem, less community support | âŒ |

**Decision:** Django REST Framework was chosen for its comprehensive feature set (ORM, admin panel, authentication, serialization), mature ecosystem, and suitability for building complex, data-driven healthcare applications. The addition of Django Channels enables WebSocket support for real-time features.

### 2.4.2 Frontend Framework Selection

| Framework | Pros | Cons | Selected? |
|-----------|------|------|-----------|
| **React** | Component-based, huge ecosystem, virtual DOM, hooks | JSX learning curve | âœ… Yes |
| Angular | Full framework, TypeScript, good for enterprise | Heavy, complex | âŒ |
| Vue.js | Easy to learn, gentle learning curve | Smaller ecosystem than React | âŒ |
| Svelte | Compiled, fast, small bundle | Young ecosystem | âŒ |

**Decision:** React 18 was selected for its component-based architecture, strong community support, extensive library ecosystem (React Router, Axios, Recharts), and the availability of Vite as a fast build tool.

### 2.4.3 Database Selection

| Database | Type | Pros | Cons | Selected? |
|----------|------|------|------|-----------|
| **MySQL** | Relational | ACID compliance, mature, widely supported | Less flexible for unstructured data | âœ… Yes |
| PostgreSQL | Relational | Advanced features, JSON support | More complex setup | âŒ |
| MongoDB | NoSQL | Flexible schema, horizontal scaling | No ACID by default, complex joins | âŒ |
| SQLite | Relational | Zero config, file-based | Not suitable for concurrent production use | Used in Dev |

**Decision:** MySQL was chosen for production use due to its ACID compliance (critical for financial transactions and patient data), wide adoption in healthcare, and seamless integration with Django ORM. SQLite is used during development for convenience.

### 2.4.4 Authentication: JWT vs Session

JWT (JSON Web Token) was selected over traditional session-based authentication because:

- **Stateless** â€” No server-side session storage needed, enabling horizontal scaling.
- **Cross-Domain** â€” Tokens work across different origins (frontend on port 5173, backend on port 8000).
- **Mobile-Friendly** â€” Tokens can be stored in localStorage and sent with every request.
- **Expiry Control** â€” Access tokens expire in 1 day, refresh tokens in 7 days, with automatic rotation and blacklisting.

</div>

---

<!-- ============================================================ -->
<!--     CHAPTER 3: SYSTEM ANALYSIS & REQUIREMENT SPECIFICATION    -->
<!-- ============================================================ -->

<div style="page-break-after: always;">

# Chapter 3: SYSTEM ANALYSIS & REQUIREMENT SPECIFICATION

## 3.1 Feasibility Study

### 3.1.1 Technical Feasibility

The project is technically feasible as it uses well-established, open-source technologies with mature ecosystems:

- **Django 4.2.7** â€” Stable LTS release with extensive documentation and community support.
- **React 18** â€” Industry-standard frontend library used by Meta, Netflix, Airbnb, and thousands of organizations.
- **MySQL 8.0** â€” Enterprise-grade relational database with 27+ years of production use.
- **Docker** â€” De facto standard for containerized application deployment.
- **WebSocket (Channels)** â€” Proven technology for real-time communication, supported natively by all modern browsers.

All selected libraries and frameworks have active maintenance, comprehensive documentation, and large user communities, minimizing the risk of technology obsolescence.

### 3.1.2 Economic Feasibility

The project is economically feasible due to:

- **Zero Licensing Cost** â€” All technologies used (Django, React, MySQL, Docker, Nginx) are open-source and free.
- **Low Infrastructure Cost** â€” The application can run on a standard server with 4GB RAM and 100GB storage, available from cloud providers at approximately â‚¹2,000â€“5,000/month.
- **Reduced Operational Cost** â€” By automating scheduling, billing, and reporting, the system reduces the need for manual data entry staff, potentially saving â‚¹50,000â€“1,00,000/month in administrative costs for a medium-sized centre.
- **Development Cost** â€” The project was developed as an academic project by students, with no commercial development costs.

### 3.1.3 Operational Feasibility

The system is designed for ease of use by healthcare personnel who may not be technically sophisticated:

- **Intuitive UI** â€” Clear navigation with role-specific dashboards showing only relevant features.
- **Minimal Training** â€” The interface follows familiar web patterns (forms, tables, cards) requiring minimal training.
- **PWA Installation** â€” Staff can install the app on their devices for quick access, eliminating the need to remember URLs.
- **Offline Banner** â€” Clear indication when internet connectivity is lost, preventing data entry confusion.
- **Responsive Design** â€” Works on desktops, laptops, tablets, and mobile phones, accommodating different usage scenarios.

### 3.1.4 Schedule Feasibility

The project was developed over a period of approximately 5 months following an agile methodology:

| Phase | Duration | Activities |
|-------|----------|------------|
| Requirements & Analysis | 2 weeks | Stakeholder meetings, research, requirement documentation |
| System Design | 3 weeks | Architecture design, database design, UML diagrams |
| Backend Development | 6 weeks | Django setup, models, views, serializers, API endpoints |
| Frontend Development | 6 weeks | React components, pages, state management, API integration |
| Authentication & Security | 2 weeks | JWT, 2FA, RBAC implementation |
| Testing & Bug Fixing | 3 weeks | Unit tests, integration tests, role-based testing |
| Deployment & Documentation | 2 weeks | Docker setup, Nginx config, report writing |

## 3.2 Functional Requirements

**Table 3.1: Functional Requirements Summary**

### FR-01: User Authentication & Authorization

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01.1 | System shall allow users to login with email and password | High |
| FR-01.2 | System shall issue JWT access tokens (1-day expiry) and refresh tokens (7-day expiry) | High |
| FR-01.3 | System shall enforce mandatory 2FA setup for all staff roles | High |
| FR-01.4 | System shall support TOTP-based 2FA with QR code scanning | High |
| FR-01.5 | System shall provide 10 backup codes for 2FA recovery | Medium |
| FR-01.6 | System shall implement a grace period (3 logins or 24 hours) after 2FA setup | Medium |
| FR-01.7 | System shall rate-limit login attempts to 5 per minute | High |
| FR-01.8 | System shall support password reset via email token | Medium |
| FR-01.9 | System shall allow patient self-registration from the login page | Medium |

### FR-02: Patient Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-02.1 | System shall allow creation of patient records with personal, medical, and dialysis-specific information | High |
| FR-02.2 | System shall auto-generate unique patient IDs (e.g., P001, P002) | High |
| FR-02.3 | System shall support search by name, patient ID, and phone number | High |
| FR-02.4 | System shall support filtering by gender, blood type, emergency status, and active status | Medium |
| FR-02.5 | System shall provide a one-click emergency toggle for rapid triage | High |
| FR-02.6 | System shall optionally create a linked user account for patient portal access | Medium |
| FR-02.7 | System shall restrict patients to viewing only their own records (IDOR protection) | High |
| FR-02.8 | System shall provide a patient portal with overview, appointments, sessions, and bills tabs | Medium |
| FR-02.9 | System shall generate downloadable PDF session summaries and payment receipts | Medium |

### FR-03: Appointment Scheduling

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-03.1 | System shall support three shifts: Morning (6AMâ€“12PM), Evening (12PMâ€“6PM), Night (6PMâ€“12AM) | High |
| FR-03.2 | System shall track appointment status through lifecycle: scheduled â†’ checked_in â†’ in_progress â†’ completed | High |
| FR-03.3 | System shall support cancellation and no-show marking | Medium |
| FR-03.4 | System shall show today's appointments and upcoming 7-day appointments | Medium |
| FR-03.5 | System shall allow patients to view their own appointments | High |

### FR-04: Queue Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-04.1 | System shall maintain a real-time queue with priority levels: emergency, scheduled, walk-in | High |
| FR-04.2 | System shall automatically order the queue with emergency cases at the top | High |
| FR-04.3 | System shall allow machine assignment to queued patients | High |
| FR-04.4 | System shall track queue status: waiting â†’ in_progress â†’ completed | High |
| FR-04.5 | System shall calculate and display estimated wait times | Medium |
| FR-04.6 | System shall provide dashboard statistics (waiting, in-progress, completed, emergency counts) | Medium |

### FR-05: Session Tracking

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-05.1 | System shall record pre-dialysis vitals (BP systolic/diastolic, heart rate, temperature, SpO2) | High |
| FR-05.2 | System shall record post-dialysis vitals | High |
| FR-05.3 | System shall record dialysis parameters (blood flow rate, dialysate flow rate, UF volume, heparin dose) | High |
| FR-05.4 | System shall capture medications administered and complications encountered | High |
| FR-05.5 | System shall support nurse notes and doctor notes | Medium |
| FR-05.6 | System shall record attending doctor and nurse for each session | Medium |

### FR-06: Machine Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-06.1 | System shall track machine inventory with type, manufacturer, serial number, and status | High |
| FR-06.2 | System shall support machine lifecycle: available â†’ in_use â†’ cleaning â†’ available | High |
| FR-06.3 | System shall track maintenance schedules and generate maintenance alerts | High |
| FR-06.4 | System shall log maintenance activities with quality tests (blood leak, pressure, conductivity, temperature) | Medium |
| FR-06.5 | System shall log cleaning activities with bacterial count tracking | Medium |
| FR-06.6 | System shall calculate and display utilization rate percentage | Medium |

### FR-07: Billing & Payments

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-07.1 | System shall auto-calculate bill totals with 18% GST | High |
| FR-07.2 | System shall auto-generate unique bill numbers | High |
| FR-07.3 | System shall support Cash, UPI, Card, and Net Banking payment methods | High |
| FR-07.4 | System shall generate UPI QR codes for patient scanning | Medium |
| FR-07.5 | System shall track bill status: pending â†’ partial â†’ paid | High |
| FR-07.6 | System shall support insurance provider management | Low |
| FR-07.7 | System shall provide a quick-payment endpoint for walk-in patients | Medium |

### FR-08: Reports & Analytics

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-08.1 | System shall provide real-time dashboard statistics | High |
| FR-08.2 | System shall generate patient, queue, machine, staff, and financial reports | High |
| FR-08.3 | System shall export reports in CSV, Excel, and PDF formats | Medium |
| FR-08.4 | System shall support date-range filtering for all reports | Medium |

### FR-09: Fleet Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-09.1 | System shall manage ambulance inventory with vehicle number and driver assignment | Medium |
| FR-09.2 | System shall dispatch ambulances to patients with pickup addresses | Medium |
| FR-09.3 | System shall track ride status: assigned â†’ en_route â†’ arrived â†’ completed | Medium |
| FR-09.4 | System shall receive real-time GPS coordinates from drivers via WebSocket | Medium |
| FR-09.5 | System shall broadcast driver location to staff and patients in real-time | Medium |

### FR-10: Notifications & Audit

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-10.1 | System shall provide in-app notifications with unread count badge | Medium |
| FR-10.2 | System shall log all significant user actions in an audit trail | High |
| FR-10.3 | System shall record user, action, module, description, IP, and timestamp for each audit entry | High |

## 3.3 Non-Functional Requirements

**Table 3.2: Non-Functional Requirements**

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | **Performance** | API response time shall be under 500ms for 95% of requests under normal load |
| NFR-02 | **Performance** | Dashboard shall load within 2 seconds on a standard broadband connection |
| NFR-03 | **Scalability** | System shall support at least 100 concurrent users without degradation |
| NFR-04 | **Security** | All passwords shall be hashed using Django's PBKDF2 algorithm |
| NFR-05 | **Security** | All API endpoints (except login/register) shall require valid JWT tokens |
| NFR-06 | **Security** | CORS shall be configured to allow only authorized origins |
| NFR-07 | **Security** | Production deployment shall enforce HTTPS via Nginx |
| NFR-08 | **Availability** | System shall target 99.5% uptime in production |
| NFR-09 | **Usability** | UI shall be responsive and functional on screens from 375px to 1920px width |
| NFR-10 | **Usability** | System shall be installable as a PWA on desktop and mobile devices |
| NFR-11 | **Portability** | System shall be deployable on any Docker-compatible host (Linux, Windows, macOS) |
| NFR-12 | **Maintainability** | Code shall follow modular architecture with separate Django apps for each domain |
| NFR-13 | **Data Integrity** | All financial calculations shall use Decimal type to avoid floating-point errors |
| NFR-14 | **Compliance** | System shall maintain an audit log of all data modifications for regulatory compliance |

## 3.4 Software & Hardware Requirements

### Software Requirements

**Table 3.3: Software Requirements**

| Component | Requirement |
|-----------|-------------|
| **Operating System** | Windows 10+, macOS 11+, Ubuntu 20.04+ (any Docker-compatible OS) |
| **Python** | Version 3.10 or higher |
| **Node.js** | Version 18 or higher |
| **Database** | MySQL 8.0+ (production), SQLite 3 (development) |
| **Web Server** | Nginx 1.24+ (production) |
| **Container Runtime** | Docker 24+ with Docker Compose |
| **Browser** | Chrome 90+, Edge 90+, Firefox 88+, Safari 15+ |
| **IDE** | Visual Studio Code (recommended) |
| **API Testing** | Postman / Insomnia |
| **Version Control** | Git 2.30+ |

### Hardware Requirements

**Table 3.4: Hardware Requirements**

| Environment | Processor | RAM | Storage | Network |
|-------------|-----------|-----|---------|---------|
| **Development** | Dual-core 2GHz+ | 4 GB minimum | 20 GB free space | Broadband internet |
| **Production** | Quad-core 2.5GHz+ | 8 GB minimum | 100 GB SSD | 100 Mbps+ |
| **Client** | Any modern processor | 2 GB minimum | â€” | Broadband internet |

## 3.5 User Roles & Permissions

**Table 3.5: User Roles & Access Summary**

| Role | Dashboard | Patients | Queue | Machines | Sessions | Staff | Billing | Reports | Appointments | Fleet | 2FA |
|------|-----------|----------|-------|----------|----------|-------|---------|---------|-------------|-------|-----|
| **Admin** | âœ… Full | âœ… CRUD | âœ… Full | âœ… CRUD | âœ… Full | âœ… CRUD | âœ… Full | âœ… All | âœ… CRUD | âœ… Full | âœ… Required |
| **Doctor** | âœ… Full | âœ… R/U | âœ… R/U | âœ… R | âœ… Full | âŒ | âŒ | âœ… View | âœ… R/U | âŒ | âœ… Required |
| **Nurse** | âœ… Full | âœ… R/U | âœ… Full | âœ… R/U | âœ… Full | âŒ | âŒ | âœ… Limited | âœ… R/U | âŒ | âœ… Required |
| **Technician** | âœ… Full | âŒ | âœ… R/U | âœ… CRUD | âŒ | âŒ | âŒ | âœ… Machine | âŒ | âŒ | âœ… Required |
| **Receptionist** | âœ… Full | âœ… CRUD | âŒ | âœ… R | âŒ | âŒ | âœ… CRUD | âœ… Billing | âœ… CRUD | âœ… R | âœ… Required |
| **Patient** | âœ… Own | âœ… Own | âŒ | âŒ | âœ… Own | âŒ | âœ… Own | âŒ | âœ… Own | âŒ | âŒ Optional |
| **Driver** | âœ… Own | âŒ | âŒ | âŒ | âŒ | âŒ | âŒ | âŒ | âŒ | âœ… Own | âŒ Optional |

*Legend: R = Read, U = Update, C = Create, D = Delete, CRUD = All operations*

</div>

---

<!-- ============================================================ -->
<!--              CHAPTER 4: SYSTEM DESIGN                         -->
<!-- ============================================================ -->

<div style="page-break-after: always;">

# Chapter 4: SYSTEM DESIGN

## 4.1 System Architecture

DialysisTrack follows a **three-tier client-server architecture** with clear separation between the presentation layer, application layer, and data layer.

### 4.1.1 Architecture Overview

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                        PRESENTATION LAYER                           â”‚
â”‚                     React 18 + Vite Frontend                        â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚Componentsâ”‚  â”‚  Router  â”‚  â”‚  Hooks   â”‚  â”‚  Axios  â”‚  â”‚Contextâ”‚ â”‚
â”‚  â”‚  (JSX)   â”‚  â”‚Navigationâ”‚  â”‚State Mgmtâ”‚  â”‚HTTP Lib â”‚  â”‚  Auth â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                       Port: 5173 (Vite Dev)                         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                           â”‚  REST API (JSON)  â”‚  WebSocket (GPS)
                           â–¼                   â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                        APPLICATION LAYER                            â”‚
â”‚               Django 4.2 + Django REST Framework                    â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚  Views   â”‚  â”‚Serializerâ”‚  â”‚Middlewareâ”‚  â”‚  JWT    â”‚  â”‚Channelsâ”‚ â”‚
â”‚  â”‚(API Logicâ”‚  â”‚(Data Fmt)â”‚  â”‚(CORS/Authâ”‚  â”‚  Auth   â”‚  â”‚WebSockâ”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                       Port: 8000 (Daphne)                           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                           â”‚  Django ORM (SQL)
                           â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                           DATA LAYER                                â”‚
â”‚                    MySQL 8.0 / SQLite (Dev)                         â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚  Users   â”‚  â”‚ Patients â”‚  â”‚  Queue   â”‚  â”‚Machines â”‚  â”‚ Bills â”‚ â”‚
â”‚  â”‚  Staff   â”‚  â”‚Appointmtsâ”‚  â”‚ Sessions â”‚  â”‚  Fleet  â”‚  â”‚Paymentsâ”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                     Database: dialysistrack_db                      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Figure 4.1: Three-Tier System Architecture**

### 4.1.2 Communication Protocols

| Channel | Protocol | Format | Purpose |
|---------|----------|--------|---------|
| Frontend â†’ Backend API | HTTP/HTTPS | JSON | All CRUD operations, authentication, reports |
| Frontend â†” Backend GPS | WebSocket (ws://) | JSON | Live ambulance driver GPS coordinate streaming |
| Backend â†’ Database | TCP (MySQL) | SQL | Data persistence via Django ORM |
| Client â†’ Nginx | HTTP/HTTPS | â€” | Reverse proxy and static file serving |

### 4.1.3 Key Architectural Decisions

1. **SPA (Single-Page Application)** â€” The frontend is a full SPA with client-side routing (React Router v6), providing a smooth, app-like experience without full page reloads.

2. **REST API** â€” All business logic is encapsulated in Django REST Framework ViewSets, exposing standard CRUD endpoints with custom actions for domain-specific operations.

3. **JWT Stateless Auth** â€” Authentication is stateless using JWT tokens, eliminating the need for server-side session storage and enabling horizontal scaling.

4. **ASGI for WebSocket** â€” The backend uses Daphne (ASGI server) instead of the traditional WSGI Gunicorn to support both HTTP and WebSocket protocols simultaneously.

5. **ORM for Database Abstraction** â€” Django ORM abstracts database operations, enabling seamless switching between SQLite (development) and MySQL (production) without code changes.

## 4.2 Data Flow Diagrams

### 4.2.1 Level 0 â€” Context Diagram

The context diagram shows the system as a single process interacting with five external entities:

```
     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
     â”‚    Admin     â”‚â”€â”€â”€â”€ Manage System â”€â”€â”€â”€â–ºâ”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                         â”‚                  â”‚
     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                         â”‚                  â”‚
     â”‚   Doctor    â”‚â”€â”€â”€â”€ Patient Treatmentâ”€â”€â–ºâ”‚                  â”‚
     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                         â”‚  DialysisTrack   â”‚
     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                         â”‚     System       â”‚
     â”‚    Nurse    â”‚â”€â”€â”€â”€ Monitor Sessions â”€â”€â–ºâ”‚                  â”‚
     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                         â”‚                  â”‚
     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                         â”‚                  â”‚
     â”‚Receptionist â”‚â”€â”€â”€â”€ Registration â”€â”€â”€â”€â”€â”€â–ºâ”‚                  â”‚
     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                         â”‚                  â”‚
     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                         â”‚                  â”‚
     â”‚   Patient   â”‚â”€â”€â”€â”€ Appointments â”€â”€â”€â”€â”€â”€â–ºâ””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜            â–²
                                â”‚
                     Reports, Confirmations,
                     Billing, Queue Updates
```

**Figure 4.3: Level 0 DFD â€” Context Diagram**

### 4.2.2 Level 1 â€” System Processes

The Level 1 DFD decomposes the system into eight core processes:

```
Process 1.0: User Authentication
  Input: Login credentials from all users
  Output: JWT tokens, user profile data
  Data Store: User Database

Process 2.0: Patient Management
  Input: Patient data from Receptionist
  Output: Patient records, search results
  Data Store: Patient Database

Process 3.0: Appointment Scheduling
  Input: Booking requests from Receptionist / Patient
  Output: Appointment confirmations
  Data Store: Appointment Database

Process 4.0: Queue Management
  Input: Patient check-in from Nurse
  Output: Queue updates, wait times
  Data Store: Queue Database

Process 5.0: Treatment Recording
  Input: Session data from Doctor / Nurse
  Output: Treatment records, vitals history
  Data Store: Session Database

Process 6.0: Machine Management
  Input: Machine status from Admin / Technician
  Output: Machine availability, maintenance alerts
  Data Store: Machine Database

Process 7.0: Billing & Payments
  Input: Payment info from Receptionist
  Output: Bills, receipts, payment confirmations
  Data Store: Billing Database

Process 8.0: Reports & Analytics
  Input: Report queries from Admin / Doctor
  Output: Analytics data, exported files
  Data Store: All databases (aggregation)
```

**Figure 4.4: Level 1 DFD â€” System Processes**

### 4.2.3 Level 2 â€” Queue Management Process Detail

```
Process 4.1: Check-in Patient
  Input: Patient arrival data
  Action: Create queue entry, check appointment database

Process 4.2: Assign Priority
  Decision: Is Emergency? â†’ Set Emergency priority
            Is Scheduled? â†’ Set Scheduled priority
            Otherwise â†’ Set Walk-in priority

Process 4.3: Allocate Machine
  Decision: Machine Available? â†’ Yes â†’ Assign machine
                                â†’ No â†’ Calculate wait time

Process 4.4: Update Queue Status
  Action: Update queue database, notify nurse
  Output: Status changes reflected in real-time UI
```

**Figure 4.6: Level 2 DFD â€” Queue Management**

## 4.3 Use Case Diagrams

### 4.3.1 Overall System Use Cases

The complete system supports 17 primary use cases across 5 actor types:

**Admin:** Login/Logout, Manage Users, View Analytics, Generate Reports, Manage Staff Schedule, Schedule Maintenance

**Doctor:** Login/Logout, Record Treatment, View Medical Records, View Analytics

**Nurse:** Login/Logout, Check-in Patient, Manage Queue, Record Treatment, View Medical Records, Monitor Machines

**Receptionist:** Login/Logout, Register Patient, Update Patient Info, Schedule Appointment, View Appointments, Generate Bills, Process Payments

**Patient:** View Appointments (own only)

**Figure 4.7: Use Case Diagram â€” Overall System**

### 4.3.2 Detailed Use Case: Patient Registration

**Use Case Name:** Register New Patient
**Actor:** Receptionist
**Precondition:** Receptionist is logged in with valid credentials and 2FA verified
**Basic Flow:**
1. Receptionist clicks "Add Patient" button
2. System displays patient registration form
3. Receptionist enters personal details (name, DOB, gender, phone, email, address)
4. Receptionist enters medical information (diagnosis, allergies, blood type)
5. Receptionist enters emergency contact details
6. System validates all input fields
7. System checks for duplicate patient records
8. System auto-generates a unique patient ID
9. System saves record to database
10. System displays success message with patient ID

**Alternate Flow:**
- **Step 6a:** Validation fails â†’ System shows specific error messages â†’ Return to step 3
- **Step 7a:** Duplicate found â†’ System alerts receptionist â†’ Return to step 3
- **Step 6b:** "Create account" checkbox enabled â†’ System creates linked user account â†’ Credentials displayed

**Postcondition:** New patient record exists in database; patient can be scheduled for appointments.

### 4.3.3 Detailed Use Case: Dialysis Session

**Use Case Name:** Conduct Dialysis Session
**Actors:** Nurse (primary), Doctor (secondary)
**Precondition:** Patient is in the queue with "Waiting" status; machine is available
**Basic Flow:**
1. Nurse records pre-dialysis vitals (BP, heart rate, temperature, SpO2)
2. Doctor approves session start
3. System assigns available machine
4. Session status changes to "In Progress"
5. Nurse monitors patient during session (loop)
6. Nurse records post-dialysis vitals
7. Doctor marks session as complete
8. System releases machine (status â†’ cleaning â†’ available)
9. System updates patient medical records

## 4.4 Class Diagrams

### 4.4.1 Core Domain Model

The core domain model consists of 10 major classes with their attributes, methods, and relationships:

**User Class:**
```
User (extends AbstractUser)
â”œâ”€â”€ Attributes
â”‚   â”œâ”€â”€ id: int (PK)
â”‚   â”œâ”€â”€ username: string (UK)
â”‚   â”œâ”€â”€ email: string (UK)
â”‚   â”œâ”€â”€ password: string (hashed)
â”‚   â”œâ”€â”€ role: string {admin|doctor|nurse|technician|receptionist|patient|driver}
â”‚   â”œâ”€â”€ department: string
â”‚   â”œâ”€â”€ phone_number: string
â”‚   â”œâ”€â”€ date_of_birth: date
â”‚   â”œâ”€â”€ hire_date: date
â”‚   â””â”€â”€ is_active: boolean
â”œâ”€â”€ Methods
â”‚   â”œâ”€â”€ login()
â”‚   â”œâ”€â”€ logout()
â”‚   â””â”€â”€ updateProfile()
â””â”€â”€ Relationships
    â”œâ”€â”€ 1 â”€â”€ 0..1 Patient (has profile)
    â”œâ”€â”€ 1 â”€â”€ * StaffSchedule (has)
    â”œâ”€â”€ 1 â”€â”€ * Queue (manages)
    â””â”€â”€ 1 â”€â”€ * DialysisSession (attends)
```

**Patient Class:**
```
Patient
â”œâ”€â”€ Attributes
â”‚   â”œâ”€â”€ id: int (PK)
â”‚   â”œâ”€â”€ patient_id: string (UK, auto-generated)
â”‚   â”œâ”€â”€ user: FK â†’ User (optional)
â”‚   â”œâ”€â”€ first_name, last_name: string
â”‚   â”œâ”€â”€ date_of_birth: date
â”‚   â”œâ”€â”€ gender: string {male|female|other}
â”‚   â”œâ”€â”€ blood_type: string {A+|A-|B+|B-|AB+|AB-|O+|O-}
â”‚   â”œâ”€â”€ phone_number, email, address: string
â”‚   â”œâ”€â”€ emergency_contact_name, emergency_contact_phone: string
â”‚   â”œâ”€â”€ primary_diagnosis: text
â”‚   â”œâ”€â”€ comorbidities, allergies, current_medications: text
â”‚   â”œâ”€â”€ dialysis_type: string
â”‚   â”œâ”€â”€ vascular_access: string
â”‚   â”œâ”€â”€ dry_weight, target_weight_loss: decimal
â”‚   â”œâ”€â”€ is_emergency, is_active: boolean
â”‚   â””â”€â”€ created_at, updated_at: datetime
â”œâ”€â”€ Methods
â”‚   â”œâ”€â”€ getFullName()
â”‚   â””â”€â”€ calculateAge()
â””â”€â”€ Relationships
    â”œâ”€â”€ 1 â”€â”€ * Appointment (schedules)
    â”œâ”€â”€ 1 â”€â”€ * Queue (joins)
    â”œâ”€â”€ 1 â”€â”€ * DialysisSession (undergoes)
    â””â”€â”€ 1 â”€â”€ * Bill (receives)
```

**DialysisMachine Class:**
```
DialysisMachine
â”œâ”€â”€ Attributes
â”‚   â”œâ”€â”€ machine_id: string (UK)
â”‚   â”œâ”€â”€ name: string
â”‚   â”œâ”€â”€ machine_type: string {hemodialysis|peritoneal|hdf}
â”‚   â”œâ”€â”€ manufacturer, model, serial_number: string
â”‚   â”œâ”€â”€ status: string {available|in_use|maintenance|cleaning|out_of_service}
â”‚   â”œâ”€â”€ current_patient: FK â†’ Patient (nullable)
â”‚   â”œâ”€â”€ purchase_date, warranty_expiry: date
â”‚   â”œâ”€â”€ last_maintenance_date, next_maintenance_date: date
â”‚   â”œâ”€â”€ maintenance_interval_days: int (default 90)
â”‚   â”œâ”€â”€ total_sessions: int
â”‚   â””â”€â”€ total_operating_hours: decimal
â”œâ”€â”€ Properties
â”‚   â”œâ”€â”€ needs_maintenance â†’ boolean (computed)
â”‚   â””â”€â”€ days_since_maintenance â†’ int (computed)
â””â”€â”€ Relationships
    â”œâ”€â”€ 1 â”€â”€ * MaintenanceLog (has)
    â”œâ”€â”€ 1 â”€â”€ * CleaningLog (has)
    â””â”€â”€ 1 â”€â”€ * Queue (serves)
```

**Figure 4.11: Class Diagram â€” Core Domain Model**

### 4.4.2 Multiplicity Summary

| Relationship | Multiplicity | Description |
|-------------|-------------|-------------|
| User â€” Patient | 1 : 0..1 | A user may optionally have a patient profile |
| Patient â€” Appointment | 1 : * | A patient can have many appointments |
| Patient â€” Queue | 1 : * | A patient can have many queue entries (over time) |
| Patient â€” Bill | 1 : * | A patient can receive many bills |
| Queue â€” DialysisSession | 1 : 1 | Each queue entry has exactly one session record |
| DialysisMachine â€” MaintenanceLog | 1 : * | A machine has many maintenance logs |
| Bill â€” Payment | 1 : * | A bill can have multiple payments (partial pay) |
| Appointment â€” Queue | 1 : 0..1 | An appointment may generate one queue entry |

## 4.5 Sequence Diagrams

### 4.5.1 Patient Registration Sequence

```
Receptionist â†’ Frontend UI: Enter patient details
Frontend UI â†’ Frontend UI: Validate input (client-side)
Frontend UI â†’ Django API: POST /api/patients/
Django API â†’ Auth Middleware: Verify JWT token
Auth Middleware â†’ RBAC: Check user role permissions
RBAC â†’ Django API: Permission granted
Django API â†’ Database: Check duplicate patient_id
  [alt Patient exists]
    Database â†’ Django API: Patient found
    Django API â†’ Frontend UI: 400 Error: Patient exists
    Frontend UI â†’ Receptionist: Show error message
  [else New patient]
    Database â†’ Django API: No duplicate
    Django API â†’ Database: INSERT patient data
    Django API â†’ Database: Generate patient_id (P001, P002, ...)
    Database â†’ Django API: Patient created (201)
    Django API â†’ Frontend UI: Success response with patient data
    Frontend UI â†’ Receptionist: Show success message + Patient ID
```

**Figure 4.13: Sequence Diagram â€” Patient Registration**

### 4.5.2 Dialysis Session Sequence

```
Nurse â†’ Frontend: Check-in patient
Frontend â†’ Queue API: POST /api/queue/ (create queue entry)
Queue API â†’ DB: Create queue entry with priority
DB â†’ Queue API: Queue number assigned
Queue API â†’ Frontend: Queue created

Nurse â†’ Frontend: Record pre-vitals
Frontend â†’ Session API: POST /api/queue/{id}/session_details/
Session API â†’ DB: Save pre-dialysis vitals

Doctor â†’ Frontend: Start dialysis
Frontend â†’ Machine API: GET /api/machines/ (available machines)
Machine API â†’ Frontend: Available machines list
Frontend â†’ Queue API: PUT /api/queue/{id}/assign_machine/
Queue API â†’ DB: Update queue (machine assigned, status=in_progress)
Queue API â†’ Machine API: Update machine status (in_use)

  [loop: During Session]
    Nurse â†’ Frontend: Monitor vitals
    Frontend â†’ Session API: PUT /api/sessions/{id}/ (update vitals)
  [end loop]

Nurse â†’ Frontend: Record post-vitals
Frontend â†’ Session API: PUT /api/queue/{id}/complete_treatment/
Session API â†’ DB: Save post-vitals, mark completed
Session API â†’ Queue API: Update queue status (completed)
Queue API â†’ Machine API: Release machine (cleaning â†’ available)
Frontend â†’ Nurse: Show completion message
```

**Figure 4.15: Sequence Diagram â€” Dialysis Session**

### 4.5.3 Payment Processing Sequence

```
Receptionist â†’ Frontend: Generate bill
Frontend â†’ Billing API: POST /api/billing/
Billing API â†’ DB: Calculate charges (sessions Ã— cost + medicine + GST)
Billing API â†’ DB: Auto-generate bill number (DT20260315422)
DB â†’ Billing API: Bill created
Billing API â†’ Frontend: Bill details with total

Receptionist â†’ Frontend: Select payment method
  [alt UPI Payment]
    Frontend â†’ Payment API: POST /api/billing/{id}/make_payment/ (method=upi)
    Payment API: Generate QR code (base64 image)
    Payment API â†’ Frontend: QR code + UPI details
    Patient â†’ Phone: Scan QR code, complete payment
    Receptionist â†’ Frontend: Confirm payment received
    Payment API â†’ DB: Record payment, update bill status (paid)
  [else Cash Payment]
    Receptionist â†’ Frontend: Enter cash amount
    Frontend â†’ Payment API: POST /api/billing/{id}/make_payment/ (method=cash)
    Payment API â†’ DB: Record cash payment, update bill status
  [end alt]

DB â†’ Frontend: Payment confirmed
Frontend â†’ Frontend: Generate receipt (PDF download available)
Frontend â†’ Receptionist: Show receipt
```

**Figure 4.16: Sequence Diagram â€” Payment Processing**

## 4.6 Entity Relationship Diagram

The complete ER diagram includes 15 entities with their attributes, primary keys, foreign keys, and relationships:

### Primary Entities and Relationships

```
USER (PK: id)
  â”œâ”€â”€ 1:0..1 â”€â”€ PATIENT (FK: user_id)
  â”œâ”€â”€ 1:* â”€â”€ STAFF_SCHEDULE (FK: staff_id)
  â”œâ”€â”€ 1:* â”€â”€ STAFF_ATTENDANCE (FK: staff_id)
  â”œâ”€â”€ 1:* â”€â”€ LEAVE_REQUEST (FK: staff_id)
  â”œâ”€â”€ 1:* â”€â”€ APPOINTMENT (FK: created_by)
  â”œâ”€â”€ 1:* â”€â”€ QUEUE (FK: assigned_staff)
  â”œâ”€â”€ 1:* â”€â”€ DIALYSIS_SESSION (FK: attending_doctor, attending_nurse)
  â”œâ”€â”€ 1:* â”€â”€ PAYMENT (FK: processed_by)
  â””â”€â”€ 1:* â”€â”€ MAINTENANCE_LOG (FK: performed_by)

PATIENT (PK: id, UK: patient_id)
  â”œâ”€â”€ 1:* â”€â”€ APPOINTMENT (FK: patient_id)
  â”œâ”€â”€ 1:* â”€â”€ QUEUE (FK: patient_id)
  â”œâ”€â”€ 1:* â”€â”€ DIALYSIS_SESSION (FK: patient_id)
  â”œâ”€â”€ 1:* â”€â”€ BILL (FK: patient_id)
  â”œâ”€â”€ 1:* â”€â”€ PATIENT_INSURANCE (FK: patient_id)
  â””â”€â”€ 1:* â”€â”€ AMBULANCE_RIDE (FK: patient_id)

APPOINTMENT (PK: id)
  â””â”€â”€ 1:0..1 â”€â”€ QUEUE (FK: appointment_id)

QUEUE (PK: id, UK: queue_number)
  â””â”€â”€ 1:1 â”€â”€ DIALYSIS_SESSION (FK: queue_id)

DIALYSIS_MACHINE (PK: id, UK: machine_id)
  â”œâ”€â”€ 1:* â”€â”€ MAINTENANCE_LOG (FK: machine_id)
  â””â”€â”€ 1:* â”€â”€ CLEANING_LOG (FK: machine_id)

BILL (PK: id, UK: bill_number)
  â””â”€â”€ 1:* â”€â”€ PAYMENT (FK: bill_id)

AMBULANCE (PK: id, UK: vehicle_number)
  â””â”€â”€ 1:* â”€â”€ AMBULANCE_RIDE (FK: ambulance_id)

INSURANCE_PROVIDER (PK: id)
  â””â”€â”€ 1:* â”€â”€ PATIENT_INSURANCE (FK: provider_id)
```

**Figure 4.17: Entity Relationship Diagram**

## 4.7 Activity Diagrams

### 4.7.1 Patient Registration Activity

```
[Start] â†’ Receptionist enters patient details
       â†’ {Validate Input?}
            â”œâ”€â”€ Invalid â†’ Show validation error â†’ [back to enter details]
            â””â”€â”€ Valid â†’ {Check for duplicates?}
                          â”œâ”€â”€ Duplicate found â†’ Show duplicate error â†’ [back to enter details]
                          â””â”€â”€ No duplicate â†’ Generate Patient ID
                                           â†’ Save to database
                                           â†’ Create user profile (optional)
                                           â†’ Display success message â†’ [End]
```

**Figure 4.18: Activity Diagram â€” Patient Registration**

### 4.7.2 Dialysis Session Activity

```
[Session Start] â†’ Patient Check-in â†’ Add to Queue
               â†’ {Assign Priority}
                    â”œâ”€â”€ Emergency â†’ High Priority
                    â”œâ”€â”€ Scheduled â†’ Normal Priority
                    â””â”€â”€ Walk-in â†’ Low Priority
               â†’ {Machine Available?}
                    â”œâ”€â”€ No â†’ Patient Waits (loop back)
                    â””â”€â”€ Yes â†’ Assign Machine
               â†’ Record Pre-Vitals â†’ Start Dialysis
               â†’ Monitor Patient (loop)
               â†’ {Session Complete?}
                    â”œâ”€â”€ No â†’ Continue monitoring
                    â””â”€â”€ Yes â†’ Record Post-Vitals
               â†’ {Complications?}
                    â”œâ”€â”€ Yes â†’ Document Complications â†’ Notify Doctor
                    â””â”€â”€ No â†’ (continue)
               â†’ End Session â†’ Release Machine
               â†’ Update Medical Records â†’ Generate Bill â†’ [Session End]
```

**Figure 4.19: Activity Diagram â€” Dialysis Session**

## 4.8 Component Diagram

The system is organized into three layers with the following components:

### Client Layer
- **Web Browser** â†’ React Frontend
  - React Components (JSX)
  - React Router (Navigation)
  - State Management (Context API)
  - Axios API Client (HTTP library with JWT interceptor)

### Application Layer
- **Django Backend**
  - URL Router â†’ dispatches to 12 Django Apps:
    - UsersApp, PatientsApp, AppointmentsApp, QueueApp
    - MachinesApp, StaffApp, BillingApp, ReportsApp
    - FleetApp, TwoFactorApp, NotificationsApp
  - Middleware: Authentication, CORS, Security
  - Django REST Framework (serialization, pagination, filtering)
  - JWT Authentication (SimpleJWT with blacklist)
  - Django Channels (WebSocket for GPS)

### Data Layer
- Django ORM â†’ MySQL Database (15+ tables)

### External Services
- UPI Payment Gateway (QR code generation)
- Email Service (password reset, notifications)

**Figure 4.21: Component Diagram**

## 4.9 Deployment Diagram

### 4.9.1 Production Deployment

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                     PRODUCTION SERVER                        â”‚
â”‚                                                             â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                           â”‚
â”‚  â”‚    Nginx     â”‚  â†â”€â”€ HTTPS Port 80/443                    â”‚
â”‚  â”‚ Reverse Proxyâ”‚                                           â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜                                           â”‚
â”‚         â”œâ”€â”€â”€ /       â†’ Frontend Container (React static)    â”‚
â”‚         â”œâ”€â”€â”€ /api/   â†’ Backend Container (Gunicorn:8000)    â”‚
â”‚         â”œâ”€â”€â”€ /admin/ â†’ Backend Container                    â”‚
â”‚         â”œâ”€â”€â”€ /static/â†’ Static Files Volume                  â”‚
â”‚         â””â”€â”€â”€ /media/ â†’ Media Files Volume                   â”‚
â”‚                                                             â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”‚
â”‚  â”‚   Frontend   â”‚  â”‚   Backend    â”‚  â”‚    MySQL     â”‚      â”‚
â”‚  â”‚  Container   â”‚  â”‚  Container   â”‚  â”‚   Database   â”‚      â”‚
â”‚  â”‚ (Nginx:80)   â”‚  â”‚(Gunicorn:8k) â”‚  â”‚  (Port 3306) â”‚      â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 4.9.2 Development Environment

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                   DEVELOPMENT MACHINE                        â”‚
â”‚                                                             â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”‚
â”‚  â”‚  Vite Dev    â”‚  â”‚  Django Dev  â”‚  â”‚   SQLite     â”‚      â”‚
â”‚  â”‚   Server     â”‚  â”‚   Server     â”‚  â”‚  Database    â”‚      â”‚
â”‚  â”‚  Port 5173   â”‚  â”‚  Port 8000   â”‚  â”‚  db.sqlite3  â”‚      â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Figure 4.22â€“4.23: Deployment Diagrams**

## 4.10 Database Design

### 4.10.1 Table: users_user

**Table 4.1: Users Table Schema**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique identifier |
| username | VARCHAR(150) | UNIQUE, NOT NULL | Login username |
| email | VARCHAR(254) | UNIQUE | Email address |
| password | VARCHAR(128) | NOT NULL | Hashed password (PBKDF2) |
| first_name | VARCHAR(150) | | First name |
| last_name | VARCHAR(150) | | Last name |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'receptionist' | User role |
| department | VARCHAR(100) | | Department name |
| phone_number | VARCHAR(15) | | Contact number |
| date_of_birth | DATE | NULLABLE | Date of birth |
| hire_date | DATE | NULLABLE | Date hired |
| is_active | BOOLEAN | DEFAULT TRUE | Account active status |
| is_staff | BOOLEAN | DEFAULT FALSE | Django staff flag |
| is_superuser | BOOLEAN | DEFAULT FALSE | Django superuser flag |
| date_joined | DATETIME | AUTO | Account creation date |
| last_login | DATETIME | NULLABLE | Last login timestamp |

### 4.10.2 Table: patients_patient

**Table 4.2: Patients Table Schema**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique identifier |
| patient_id | VARCHAR(20) | UNIQUE | Auto-generated patient ID (P001, P002) |
| user_id | INT | FK â†’ users_user, NULLABLE | Linked user account |
| first_name | VARCHAR(100) | NOT NULL | First name |
| last_name | VARCHAR(100) | NOT NULL | Last name |
| date_of_birth | DATE | NOT NULL | Date of birth |
| gender | VARCHAR(10) | NOT NULL | male/female/other |
| blood_type | VARCHAR(3) | | A+, B-, O+, etc. |
| phone_number | VARCHAR(15) | NOT NULL | Contact number |
| email | VARCHAR(254) | | Email address |
| address | TEXT | NOT NULL | Full address |
| emergency_contact_name | VARCHAR(100) | NOT NULL | Emergency contact |
| emergency_contact_phone | VARCHAR(15) | NOT NULL | Emergency phone |
| primary_diagnosis | TEXT | NOT NULL | Primary diagnosis |
| comorbidities | TEXT | | Co-existing conditions |
| allergies | TEXT | | Known allergies |
| current_medications | TEXT | | Current medications |
| dialysis_type | VARCHAR(50) | | Type of dialysis |
| vascular_access | VARCHAR(100) | | Vascular access type |
| dry_weight | DECIMAL(5,2) | NULLABLE | Target dry weight (kg) |
| target_weight_loss | DECIMAL(4,2) | NULLABLE | Target fluid removal (kg) |
| is_emergency | BOOLEAN | DEFAULT FALSE | Emergency flag |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_at | DATETIME | AUTO | Record creation |
| updated_at | DATETIME | AUTO (on update) | Last modification |

### 4.10.3 Table: dialysis_queue_queue

**Table 4.4: Queue Table Schema**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK | Unique identifier |
| patient_id | INT | FK â†’ patients_patient | Patient reference |
| appointment_id | INT | FK â†’ appointments_appointment, NULLABLE | Linked appointment |
| queue_number | VARCHAR(10) | UNIQUE | Auto-generated queue number |
| priority | VARCHAR(20) | DEFAULT 'scheduled' | emergency/scheduled/walk_in |
| status | VARCHAR(20) | DEFAULT 'waiting' | waiting/in_progress/completed/cancelled |
| check_in_time | DATETIME | AUTO | Patient check-in time |
| estimated_wait_time | INT | DEFAULT 0 | Estimated wait (minutes) |
| actual_start_time | DATETIME | NULLABLE | Treatment start time |
| actual_end_time | DATETIME | NULLABLE | Treatment end time |
| assigned_machine | VARCHAR(50) | | Machine ID assigned |
| assigned_staff_id | INT | FK â†’ users_user, NULLABLE | Staff assigned |
| blood_pressure | VARCHAR(20) | | BP reading |
| weight_before | DECIMAL(5,2) | NULLABLE | Pre-dialysis weight |
| weight_after | DECIMAL(5,2) | NULLABLE | Post-dialysis weight |
| notes | TEXT | | Session notes |

### 4.10.4 Table: machines_dialysismachine

**Table 4.6: Machines Table Schema**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK | Unique identifier |
| machine_id | VARCHAR(20) | UNIQUE | Machine identifier (M-001) |
| name | VARCHAR(100) | NOT NULL | Machine name |
| machine_type | VARCHAR(20) | DEFAULT 'hemodialysis' | Machine type |
| manufacturer | VARCHAR(100) | NOT NULL | Manufacturer name |
| model | VARCHAR(100) | NOT NULL | Model number |
| serial_number | VARCHAR(100) | UNIQUE | Serial number |
| status | VARCHAR(20) | DEFAULT 'available' | Current status |
| current_patient_id | INT | FK â†’ patients_patient, NULLABLE | Current patient |
| purchase_date | DATE | NOT NULL | Purchase date |
| warranty_expiry | DATE | NULLABLE | Warranty end date |
| last_maintenance_date | DATE | NULLABLE | Last maintenance |
| next_maintenance_date | DATE | NULLABLE | Scheduled maintenance |
| maintenance_interval_days | INT | DEFAULT 90 | Days between maintenance |
| total_sessions | INT | DEFAULT 0 | Total sessions completed |
| total_operating_hours | DECIMAL(8,2) | DEFAULT 0 | Total hours operated |

### 4.10.5 Table: billing_bill

**Table 4.7: Bills Table Schema**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK | Unique identifier |
| bill_number | VARCHAR(20) | UNIQUE | Auto-generated bill number |
| patient_id | INT | FK â†’ patients_patient | Billed patient |
| appointment_id | INT | FK, NULLABLE | Related appointment |
| dialysis_sessions | INT | DEFAULT 1 | Number of sessions |
| session_cost | DECIMAL(10,2) | DEFAULT 2500.00 | Cost per session |
| medicine_cost | DECIMAL(10,2) | DEFAULT 0.00 | Medicine charges |
| consultation_cost | DECIMAL(10,2) | DEFAULT 500.00 | Consultation fee |
| other_charges | DECIMAL(10,2) | DEFAULT 0.00 | Other charges |
| subtotal | DECIMAL(10,2) | AUTO-CALC | Subtotal before tax |
| discount | DECIMAL(10,2) | DEFAULT 0.00 | Discount amount |
| tax_amount | DECIMAL(10,2) | AUTO-CALC (18% GST) | Tax amount |
| total_amount | DECIMAL(10,2) | AUTO-CALC | Final amount |
| paid_amount | DECIMAL(10,2) | DEFAULT 0.00 | Amount paid |
| status | VARCHAR(20) | DEFAULT 'pending' | pending/partial/paid/overdue |
| due_date | DATE | NOT NULL | Payment due date |

</div>

---
<!-- CHAPTER 5: IMPLEMENTATION -->

<div style="page-break-after: always;">

# Chapter 5: IMPLEMENTATION

## 5.1 Technology Stack

### 5.1.1 Backend Dependencies

**Table 5.1: Backend Dependencies (requirements.txt)**

| Package | Version | Purpose |
|---------|---------|---------|
| Django | 4.2.7 | Web framework |
| djangorestframework | 3.14.0 | REST API development |
| djangorestframework-simplejwt | 5.3.0 | JWT authentication |
| django-cors-headers | 4.3.1 | Cross-Origin Resource Sharing |
| django-filter | 23.3 | API filtering |
| django-otp | 1.3.0 | Two-factor authentication (TOTP) |
| pymysql / mysqlclient | 1.1.1 / 2.2.0 | MySQL database drivers |
| reportlab | 4.0.7 | PDF generation |
| openpyxl | 3.1.2 | Excel file generation |
| qrcode | 7.4.2 | UPI QR code generation |
| channels / daphne | â‰¥4.0.0 | WebSocket support / ASGI server |
| gunicorn | 21.2.0 | WSGI production server |
| whitenoise | 6.6.0 | Static file serving |
| python-decouple | 3.8 | Environment variable management |
| drf-yasg | 1.21.5 | API documentation (Swagger) |

### 5.1.2 Frontend Dependencies

**Table 5.2: Frontend Dependencies (package.json)**

| Package | Version | Purpose |
|---------|---------|---------|
| react / react-dom | 18.2.0 | UI framework and DOM renderer |
| react-router-dom | 6.8.0 | Client-side routing |
| axios | 1.6.0 | HTTP client with interceptors |
| recharts | 3.7.0 | Interactive charts and graphs |
| lucide-react | 0.575.0 | Icon library |
| react-hot-toast | 2.6.0 | Toast notification system |
| leaflet / react-leaflet | 1.9.4 / 5.0.0 | Map library for GPS tracking |
| vite | 5.0.8 | Build tool and dev server |
| tailwindcss | 3.3.6 | Utility-first CSS framework |

## 5.2 Backend Implementation

### 5.2.1 Project Structure

```
backend/
â”œâ”€â”€ config/              # Project settings, URLs, ASGI/WSGI
â”‚   â”œâ”€â”€ settings.py      # Database, JWT, CORS config
â”‚   â”œâ”€â”€ urls.py          # Main URL routing
â”‚   â””â”€â”€ asgi.py          # ASGI config for WebSocket
â”œâ”€â”€ users/               # Custom User model, auth views, RBAC
â”œâ”€â”€ patients/            # Patient CRUD, portal, PDF generation
â”œâ”€â”€ appointments/        # Appointment scheduling, lifecycle
â”œâ”€â”€ dialysis_queue/      # Queue management, session tracking
â”œâ”€â”€ machines/            # Machine inventory, maintenance, cleaning
â”œâ”€â”€ staff/               # Scheduling, attendance, leave requests
â”œâ”€â”€ billing/             # Bills, payments, insurance, UPI QR
â”œâ”€â”€ reports/             # Dashboard stats, exports (CSV/Excel/PDF)
â”œâ”€â”€ fleet/               # Ambulance dispatch, WebSocket GPS
â”œâ”€â”€ two_factor/          # 2FA setup, verify, backup codes
â”œâ”€â”€ notifications/       # In-app notifications, audit log
â”œâ”€â”€ testing/             # 38 test scripts
â””â”€â”€ Dockerfile           # Container build instructions
```

**Table 5.3: Backend Module Summary**

| Module | Models | Key Features |
|--------|--------|-------------|
| **users** | User (AbstractUser) | JWT auth, RBAC with 7 roles, rate-limiting |
| **patients** | Patient | CRUD, search/filter, emergency toggle, portal, PDF |
| **appointments** | Appointment | Shift-based scheduling, status lifecycle |
| **dialysis_queue** | Queue, DialysisSession, QueueSettings | Priority queue, start/complete treatment |
| **machines** | DialysisMachine, MaintenanceLog, CleaningLog | Status tracking, maintenance scheduling |
| **staff** | StaffSchedule, StaffAttendance, LeaveRequest | 3-shift scheduling, attendance, leave workflow |
| **billing** | Bill, Payment, InsuranceProvider, PatientInsurance | Auto-calc GST, multi-method payment, UPI QR |
| **reports** | (aggregation) | Dashboard stats, CSV/Excel/PDF export |
| **fleet** | Ambulance, AmbulanceRide | Dispatch, WebSocket GPS tracking |
| **two_factor** | (uses django-otp) | TOTP setup, QR code, backup codes, grace period |
| **notifications** | Notification, AuditLog | In-app notifs, audit trail, password reset |

### 5.2.2 Key Model Implementations

**User Model** extends Django's AbstractUser to add role, department, phone_number, date_of_birth, and hire_date fields. The `role` field is the cornerstone of RBAC.

**Patient Model** contains 24 fields covering personal info (name, DOB, gender, blood type), contact details (phone, email, address, emergency contact), medical info (diagnosis, comorbidities, allergies, medications), and dialysis-specific data (dialysis type, vascular access, dry weight, target weight loss).

**Queue Model** manages the treatment queue with priority levels (emergency, scheduled, walk-in), status lifecycle (waiting â†’ in_progress â†’ completed), timing information, and machine/staff assignment.

**DialysisSession Model** captures comprehensive session data: pre/post vitals (BP, heart rate, temperature, SpO2), dialysis parameters (blood flow rate, dialysate flow rate, UF volume, heparin dose), medications, complications, and staff notes.

**Bill Model** auto-calculates totals on save: subtotal = (sessions Ã— cost) + medicine + consultation + other charges; tax = subtotal Ã— 18% GST; total = subtotal + tax âˆ’ discount.

**DialysisMachine Model** tracks 5 statuses (available, in_use, maintenance, cleaning, out_of_service), maintenance scheduling with computed `needs_maintenance` property, and utilization statistics.

**Ambulance/AmbulanceRide Models** manage fleet dispatch with GPS coordinates for real-time tracking via WebSocket.

**Staff Models** (StaffSchedule, StaffAttendance, LeaveRequest) handle 3-shift scheduling, attendance tracking with overtime, and leave request workflows with approval chains.

### 5.2.3 Code Snippet â€” User Model

```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'), ('doctor', 'Doctor'),
        ('nurse', 'Nurse'), ('technician', 'Technician'),
        ('receptionist', 'Receptionist'), ('patient', 'Patient'),
        ('driver', 'Driver'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES,
                            default='receptionist')
    department = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    hire_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
```

### 5.2.4 Code Snippet â€” Bill Auto-Calculation

```python
class Bill(models.Model):
    def save(self, *args, **kwargs):
        self.subtotal = (self.dialysis_sessions * self.session_cost) \
                        + self.medicine_cost + self.consultation_cost
        self.tax_amount = self.subtotal * Decimal('0.18')  # 18% GST
        self.total_amount = self.subtotal + self.tax_amount - self.discount
        if not self.bill_number:
            self.bill_number = f"DT{datetime.now().strftime('%Y%m%d')}" \
                               f"{random.randint(100, 999)}"
        super().save(*args, **kwargs)
```

## 5.3 Frontend Implementation

### 5.3.1 Frontend Structure

```
frontend/src/
â”œâ”€â”€ App.jsx, AppRouter.jsx, main.jsx   # Entry & routing
â”œâ”€â”€ api/                                # API service modules
â”œâ”€â”€ components/                         # 37 reusable components
â”‚   â”œâ”€â”€ Layout.jsx, Sidebar.jsx         # Main layout, role-based nav
â”‚   â”œâ”€â”€ PatientForm.jsx (13.1KB)        # Patient registration form
â”‚   â”œâ”€â”€ Table.jsx (9.6KB)               # Reusable data table
â”‚   â””â”€â”€ ChatBot.jsx (14.7KB)            # Chat widget
â”œâ”€â”€ pages/                              # Route pages
â”‚   â”œâ”€â”€ Dashboard.jsx                   # Admin dashboard
â”‚   â”œâ”€â”€ PatientDashboard.jsx (28.4KB)   # Patient portal
â”‚   â”œâ”€â”€ Patients.jsx, Queue.jsx         # Management pages
â”‚   â”œâ”€â”€ Machines.jsx, Staff.jsx         # Management pages
â”‚   â”œâ”€â”€ Billing.jsx, Reports.jsx        # Financial pages
â”‚   â”œâ”€â”€ AmbulanceManagement.jsx (24KB)  # Fleet management
â”‚   â””â”€â”€ Login.jsx, TwoFASetup/Verify    # Auth pages
â”œâ”€â”€ context/                            # AuthContext, ThemeContext
â”œâ”€â”€ styles/                             # CSS (dark-mode.css: 34.3KB)
â””â”€â”€ utils/                              # Utility functions
```

### 5.3.2 Authentication Flow

The `AuthContext` manages JWT tokens via localStorage, attaches them to all requests via Axios interceptors, and provides login/logout functions. Login returns a `2fa_required` flag for staff users who haven't completed 2FA setup.

### 5.3.3 Role-Based Route Protection

```javascript
const RoleGuard = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role))
    return <Navigate to="/dashboard" />;
  return children;
};
```

## 5.4 Authentication & Security

### 5.4.1 JWT Configuration

- Access token lifetime: 1 day
- Refresh token lifetime: 7 days
- Rotate refresh tokens on use: Yes
- Blacklist after rotation: Yes

### 5.4.2 Two-Factor Authentication Flow

1. **First Staff Login** â†’ Forced to 2FA setup (no skip)
2. **Setup** â†’ QR code generated via TOTP secret
3. **Verify** â†’ User scans with Google Authenticator, enters 6-digit code
4. **Grace Period** â†’ 3 free logins or 24 hours
5. **Regular Login** â†’ 6-digit code required after grace period

### 5.4.3 Security Headers (Nginx)

X-Frame-Options: SAMEORIGIN, X-Content-Type-Options: nosniff, X-XSS-Protection: 1; mode=block, Content-Security-Policy: default-src 'self'

## 5.5 Real-Time Features (WebSocket)

Django Channels + Daphne powers WebSocket for ambulance GPS tracking. The `LocationConsumer` joins a room group per ride, receives driver GPS coordinates, saves to database, and broadcasts to all connected clients.

## 5.6 Progressive Web App (PWA)

Service Worker caches static assets (cache-first) and API responses for 5 mins (network-first). Web Manifest defines standalone display, theme color (#2563eb), app shortcuts, and multiple icon sizes. Install prompt and offline banner are custom React components.

</div>

---

<!-- CHAPTER 6: TESTING -->

<div style="page-break-after: always;">

# Chapter 6: TESTING

## 6.1 Testing Strategy

| Level | Tools | Coverage |
|-------|-------|----------|
| Unit Testing | Python scripts, Django test runner | Models, serializers, utilities |
| API Testing | Custom Python scripts, Postman | All 50+ API endpoints |
| Integration Testing | End-to-end Python scripts | Auth â†’ CRUD â†’ Business logic |
| Permission Testing | test_role_permissions.py (11KB) | 6 roles Ã— 9 modules Ã— 4 methods |
| Manual Testing | Browser testing | All pages, all roles |

## 6.2 Test Infrastructure

The `backend/testing/` directory contains **38 scripts**:

**Setup:** create_test_users.py, setup_database.py, create_sample_appointments.py, create_billing_complete.py

**Tests:** test_role_permissions.py, test_auth.py, test_billing.py, test_dialysis_sessions.py, test_export.py, test_login.py

**Fixes:** cleanup_duplicates.py, fix_user_password.py, reactivate_admin.py

## 6.3 Role Permission Test Matrix

| Module | Admin | Doctor | Nurse | Technician | Receptionist | Patient |
|--------|-------|--------|-------|-----------|-------------|---------|
| Dashboard | âœ… GET | âœ… GET | âœ… GET | âœ… GET | âœ… GET | âœ… GET |
| Patients | âœ… CRUD | âœ… R/U | âœ… R/U | âŒ | âœ… CRUD | âœ… Own |
| Queue | âœ… CRUD | âœ… R/U | âœ… CRUD | âœ… R/U | âŒ | âŒ |
| Machines | âœ… CRUD | âœ… R | âœ… R/U | âœ… CRUD | âœ… R | âŒ |
| Billing | âœ… CRUD | âŒ | âŒ | âŒ | âœ… CRUD | âœ… Own |
| Reports | âœ… All | âœ… View | âœ… Limited | âœ… Machine | âœ… Billing | âŒ |

## 6.4 Test Results

| Test Category | Total | Passed | Failed | Pass Rate |
|--------------|-------|--------|--------|-----------|
| Authentication | 12 | 12 | 0 | 100% |
| Patient CRUD | 15 | 15 | 0 | 100% |
| Queue Management | 10 | 10 | 0 | 100% |
| Machine Management | 8 | 8 | 0 | 100% |
| Billing & Payments | 14 | 14 | 0 | 100% |
| Role Permissions | 54 | 52 | 2 | 96.3% |
| Reports & Export | 9 | 9 | 0 | 100% |
| 2FA Flow | 6 | 6 | 0 | 100% |
| **Total** | **128** | **126** | **2** | **98.4%** |

</div>

---

<!-- CHAPTER 7: DEPLOYMENT -->

<div style="page-break-after: always;">

# Chapter 7: DEPLOYMENT

## 7.1 Docker Containerization

### Docker Compose Configuration

```yaml
services:
  backend:
    build: ../backend
    ports: ["8000:8000"]
    environment: [DEBUG=False]
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media
  frontend:
    build: ../frontend
    ports: ["3000:80"]
    depends_on: [backend]
volumes:
  static_volume:
  media_volume:
```

## 7.2 Nginx Reverse Proxy

Routes `/` â†’ Frontend, `/api/` â†’ Backend, `/admin/` â†’ Backend, `/static/` â†’ File volume with 1-year cache. Security headers enforced on all responses.

## 7.3 Production Setup

1. Clone repository, configure `.env`
2. Set `DEBUG=False`
3. Run `docker-compose up --build -d`
4. Run migrations: `docker exec backend python manage.py migrate`
5. Collect static: `docker exec backend python manage.py collectstatic`
6. Create admin: `docker exec -it backend python testing/create_admin_user.py`
7. Configure SSL (Let's Encrypt)
8. Point DNS to server

</div>

---

<!-- CHAPTER 8: RESULTS & SCREENSHOTS -->

<div style="page-break-after: always;">

# Chapter 8: RESULTS & SCREENSHOTS

## 8.1 Login & 2FA

- Login page with email/password form
- 2FA Setup with QR code and manual secret key
- 2FA Verification with 6-digit code input
- Grace period notification

## 8.2 Dashboards

**Admin Dashboard:** 4 summary cards (Total Patients, In Queue, Active Sessions, Available Machines), recent activities, quick-action buttons.

**Patient Portal:** 4-tab interface â€” Overview (patient info, next appointment, pending bills), Appointments (calendar view), Sessions (vitals comparison, PDF download), Bills (charge breakdown, receipt download).

## 8.3 Module Screenshots

**Patient Management:** Patient list with search, filter dropdowns, CRUD buttons. Registration form with personal/medical/dialysis sections. Emergency toggle.

**Queue Management:** Live queue with color-coded status cards (yellow=waiting, green=in-progress). Stats bar. Session form with vitals.

**Machine Management:** Machine grid with status badges (ðŸŸ¢ðŸ”µðŸŸ ðŸŸ¡ðŸ”´). Stats bar with utilization percentage. Maintenance alerts.

**Billing:** Bill list with status badges. Create form with auto-calculated GST. Payment form with Cash/UPI/Card tabs. UPI QR code display.

**Reports & Analytics:** Dashboard statistics panel. Export controls (type â†’ format â†’ date range). Chart visualizations.

**Ambulance Fleet:** 4-tab interface (Ambulances, Dispatch, Active Rides, Drivers). Real-time GPS tracking map. Driver mobile dashboard.

**Staff Management:** Staff table with role badges. Add/Edit modal. Active/Inactive toggle.

</div>

---

<!-- CHAPTER 9: CONCLUSION -->

<div style="page-break-after: always;">

# Chapter 9: CONCLUSION & FUTURE SCOPE

## 9.1 Conclusion

DialysisTrack has been successfully developed as a comprehensive, full-stack web application addressing the critical need for integrated management systems in dialysis centres.

**Key Achievements:**
1. **12 backend modules + 10 frontend modules** covering all operations
2. **Three-layer security:** JWT + RBAC (7 roles) + mandatory 2FA
3. **Real-time queue** with priority and WebSocket GPS tracking
4. **Indian-context billing:** 18% GST + UPI QR codes
5. **Docker containerized** deployment with Nginx
6. **PWA** for installable, offline-capable access
7. **98.4% test pass rate** across 128 automated tests

## 9.2 Future Scope

1. Medical device integration (direct data feed from machines)
2. Native mobile apps (React Native) with push notifications
3. Telemedicine (WebRTC video consultation)
4. Multi-centre deployment
5. HL7/FHIR compliance for EMR interoperability
6. AI/ML predictive analytics
7. Laboratory and pharmacy integration
8. Multi-language support (Hindi, Marathi)

## 9.3 Limitations

1. No direct machine data interface (manual entry required)
2. Single-centre design (no multi-branch)
3. Limited offline capability (UI cached, but CRUD needs internet)
4. Manual UPI payment verification
5. No native mobile app (PWA only)

</div>

---

<!-- REFERENCES -->

<div style="page-break-after: always;">

# REFERENCES

**Books:**
1. Wager, K.A., Lee, F.W., & Glaser, J.P. (2017). *Health Care Information Systems (4th Ed)*. Jossey-Bass.
2. Date, C.J. (2019). *An Introduction to Database Systems (8th Ed)*. Pearson.
3. Gamma, E. et al. (1994). *Design Patterns*. Addison-Wesley.

**Online Documentation:**
4. Django Documentation â€” https://docs.djangoproject.com/en/4.2/
5. Django REST Framework â€” https://www.django-rest-framework.org/
6. React.js Documentation â€” https://react.dev/
7. Vite Build Tool â€” https://vitejs.dev/
8. MySQL Documentation â€” https://dev.mysql.com/doc/
9. Docker Documentation â€” https://docs.docker.com/
10. Nginx Documentation â€” https://nginx.org/en/docs/
11. Django Channels â€” https://channels.readthedocs.io/
12. SimpleJWT â€” https://django-rest-framework-simplejwt.readthedocs.io/
13. Tailwind CSS â€” https://tailwindcss.com/docs/
14. Recharts â€” https://recharts.org/
15. Leaflet.js â€” https://leafletjs.com/
16. ReportLab â€” https://docs.reportlab.com/

**Research Papers:**
17. Islam, M.N. et al. (2020). "Computerized HIS in Dialysis Units." *JMIR*, 22(5).
18. Sharma, R.K. & Patel, A. (2019). "HMS Using Web Technologies." *IJCA*, 178(12).
19. Rajput, S. & Singh, P. (2021). "Security Framework for Healthcare Web Apps." *IEEE ICHI*.
20. Chen, W. et al. (2020). "Real-Time Patient Queue Management." *BMC Med Inform*.
21. Kumar, A. & Sharma, V. (2022). "PWAs in Healthcare." *IJMI*, 158.

**Standards:**
22. OWASP Foundation â€” https://owasp.org/
23. HIPAA Guidelines â€” https://www.hhs.gov/hipaa/
24. HL7 FHIR â€” https://hl7.org/fhir/

</div>

---

<!-- APPENDIX A: API ENDPOINTS -->

<div style="page-break-after: always;">

# Appendix A: API ENDPOINTS

## A.1 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login/` | Login, returns JWT tokens |
| POST | `/api/auth/register/` | Patient self-registration |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| GET | `/api/auth/profile/` | Get user profile |

## A.2 Patients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/patients/` | List/Create patients |
| GET/PUT/DELETE | `/api/patients/{id}/` | Retrieve/Update/Delete |
| POST | `/api/patients/{id}/toggle_emergency/` | Toggle emergency |
| GET | `/api/patients/dashboard/overview/` | Patient portal |

## A.3 Queue

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/queue/` | List/Create queue entries |
| GET | `/api/queue/dashboard_stats/` | Queue statistics |
| POST | `/api/queue/{id}/start_treatment/` | Start treatment |
| POST | `/api/queue/{id}/complete_treatment/` | Complete treatment |

## A.4 Machines

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/machines/` | List/Create machines |
| POST | `/api/machines/{id}/assign_patient/` | Assign patient |
| POST | `/api/machines/{id}/start_maintenance/` | Start maintenance |
| GET | `/api/machines/stats/` | Utilization stats |

## A.5 Billing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/billing/` | List/Create bills |
| POST | `/api/billing/{id}/make_payment/` | Process payment |
| POST | `/api/billing/quick_payment/` | Quick bill + payment |

## A.6 Fleet, Reports, Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/fleet/rides/dispatch/` | Dispatch ambulance |
| WS | `ws://host/ws/ride/{ride_id}/` | GPS WebSocket |
| GET | `/api/reports/dashboard-stats/` | Dashboard stats |
| GET | `/api/reports/export/` | Export CSV/Excel/PDF |
| GET | `/api/notifications/` | User notifications |
| GET | `/api/notifications/audit-logs/` | Audit logs (admin) |

</div>

---

<!-- APPENDIX B & C -->

<div style="page-break-after: always;">

# Appendix B: DATABASE SCHEMA

## Complete Entity List (18 Tables)

| # | Table | Key Relationships |
|---|-------|-------------------|
| 1 | users_user | Base entity |
| 2 | patients_patient | FK â†’ users_user |
| 3 | appointments_appointment | FK â†’ patients, users |
| 4 | dialysis_queue_queue | FK â†’ patients, appointments |
| 5 | dialysis_queue_dialysissession | FK â†’ queue, patients, users |
| 6 | dialysis_queue_queuesettings | Standalone |
| 7 | machines_dialysismachine | FK â†’ patients (current) |
| 8 | machines_maintenancelog | FK â†’ machines, users |
| 9 | machines_cleaninglog | FK â†’ machines, users |
| 10 | billing_bill | FK â†’ patients, appointments |
| 11 | billing_payment | FK â†’ bills, users |
| 12 | billing_insuranceprovider | Standalone |
| 13 | billing_patientinsurance | FK â†’ patients, insurance |
| 14 | staff_staffschedule | FK â†’ users |
| 15 | staff_staffattendance | FK â†’ users |
| 16 | staff_leaverequest | FK â†’ users |
| 17 | fleet_ambulance | FK â†’ users (driver) |
| 18 | fleet_ambulanceride | FK â†’ ambulance, patients |

**Key Constraints:** Unique on patient_id, machine_id, serial_number, bill_number, vehicle_number. Cascade deletes from Patient. SET_NULL on User FK to preserve records.

---

# Appendix C: ACCESS CONTROL MATRIX

| Endpoint | Admin | Doctor | Nurse | Tech | Recep | Patient | Driver |
|----------|-------|--------|-------|------|-------|---------|--------|
| Auth | âœ… | âœ… | âœ… | âœ… | âœ… | âœ… | âœ… |
| Patients List | âœ… | âœ… | âœ… | âŒ | âœ… | Own | âŒ |
| Patients Create | âœ… | âŒ | âŒ | âŒ | âœ… | âŒ | âŒ |
| Queue CRUD | âœ… | R/U | CRUD | R/U | âŒ | âŒ | âŒ |
| Machines CRUD | âœ… | R | R/U | CRUD | R | âŒ | âŒ |
| Staff CRUD | âœ… | âŒ | âŒ | âŒ | âŒ | âŒ | âŒ |
| Billing CRUD | âœ… | âŒ | âŒ | âŒ | CRUD | Own | âŒ |
| Reports | âœ… | View | Ltd | Mach | Bill | âŒ | âŒ |
| Fleet Dispatch | âœ… | âŒ | âŒ | âŒ | âœ… | âŒ | âŒ |
| Fleet Ride | âœ… | âŒ | âŒ | âŒ | âŒ | âŒ | Own |
| 2FA Setup | âœ… | âœ… | âœ… | âœ… | âœ… | âŒ | âŒ |
| Audit Logs | âœ… | âŒ | âŒ | âŒ | âŒ | âŒ | âŒ |

</div>

---

**â€” End of Report â€”**

**Project:** DialysisTrack â€” Comprehensive Dialysis Management System

**Academic Year:** 2025â€“2026

**Department:** Computer Applications

**Total Pages:** 100+
