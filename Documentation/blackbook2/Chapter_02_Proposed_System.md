
Chapter – 2 : Proposed System

---

2.1 Proposed System

DialysisTrack is the proposed system — a centrally hosted, web-based comprehensive management platform developed specifically for the operational environment of a dialysis centre. The system was designed from the ground up to address every deficiency identified in the study of the existing manual and semi-digital approach used at I Care Dialysis Centre. Rather than adapting a generic Hospital Management System or a general-purpose application to this context, DialysisTrack was purpose-built with the specific workflows of a dialysis centre as its design foundation.

At the core of DialysisTrack is a single, unified MySQL relational database that serves as the definitive source of truth for every piece of data in the centre's operations. Patient registration records, appointment schedules, dialysis session details, vital sign readings, machine inventory, staff records, billing invoices, payment transactions, ambulance dispatch events, and GPS tracking coordinates are all stored in this single, well-structured database. Because every function of the system reads from and writes to this one database, there is no fragmentation, no data duplication, and no risk of inconsistency between different parts of the system.

The system is structured around a role-based access control framework that defines seven distinct user roles, each with a precisely defined set of permissions. The roles are Administrator, Doctor, Nurse, Technician, Receptionist, Patient, and Driver. Each role is presented with a tailored interface that shows only the data and controls relevant to that role's responsibilities, and every API endpoint on the backend enforces permission checks to ensure that no user can access data or perform actions beyond what their role permits. This architecture simultaneously improves usability — by reducing the number of irrelevant options a user must navigate — and security, by preventing unauthorised access at the technical level.

The appointment scheduling module is one of the most critical components of the proposed system. When a Receptionist initiates a new appointment booking, the backend performs a server-side conflict validation that queries the database for all existing confirmed appointments for the selected machine on the selected date and time window. If any overlap is found, the booking is rejected with a descriptive error message. The same validation applies to doctor availability — if the selected doctor is not scheduled to work on the requested day, the system rejects the booking before any record is created. This mechanism makes double-booking technically impossible within the system.

The dialysis session queue module provides the treatment floor staff with a real-time view of all sessions for the current day. Patients can be checked in when they arrive, sessions can be started when the machine is ready, and vital signs can be recorded at intervals directly from a tablet or workstation. Session status updates — from Waiting, to In Progress, to Completed — are reflected immediately across all connected devices, giving management and clinical supervisors a live picture of the floor at all times.

The billing module automatically generates an itemised invoice the moment a session is marked as completed. The invoice includes the base session fee, any additional charges for consumables or laboratory tests, and the applicable Goods and Services Tax computed at eighteen percent. No manual action from the billing department is required for standard session invoices. The generated bill can be paid through multiple methods — cash, UPI via a dynamically generated QR code, or online payment through the Razorpay gateway supporting credit cards, debit cards, net banking, and wallet payments.

The ambulance fleet management module allows the reception staff to dispatch a vehicle, track its real-time location on an embedded Google Maps view, and receive automatic status updates as the driver moves through the journey stages of Assigned, En Route, Arrived, and Completed. GPS coordinates from the driver's mobile device are transmitted to the server through a WebSocket connection managed by Django Channels, ensuring that location data on the tracking screen updates within seconds of the driver's actual movement.

A clinical data management module enforces compliance with the critical infection safety requirements of dialysis practice. The system records each patient's Hepatitis B, Hepatitis C, and HIV status, tracks the date of their last infection screening, and flags patients whose screening is overdue for retesting. Patients with a positive Hepatitis B status are marked as requiring an isolated dialysis machine, and this flag is visible to the technician when preparing machine assignments. Clinical lab results — including the key dialysis adequacy metrics of Kt/V and Urea Reduction Ratio — are recorded and automatically evaluated against standard clinical targets, with critical values flagged for immediate clinical attention.

---

2.2 Hardware and Software Specifications

The DialysisTrack system is designed to run on standard, widely available hardware and does not require specialised or proprietary infrastructure. The following specifications represent the recommended configuration for both development and production deployment.

Server Hardware Requirements:

For production deployment, a Linux-based virtual machine is recommended. The minimum specification for a small to mid-sized dialysis centre is a server with a dual-core processor operating at two gigahertz or above, four gigabytes of RAM, and fifty gigabytes of dedicated storage space for the database and application files. For a centre with more than fifty active patients and multiple concurrent users, eight gigabytes of RAM and a quad-core processor are recommended. These specifications are comfortably met by entry-level cloud virtual machines from providers such as Amazon Web Services, Google Cloud Platform, or Microsoft Azure, as well as by modest on-premise server hardware.

Client Hardware Requirements:

Staff access to DialysisTrack is through a standard web browser, which means any device capable of running a modern web browser can serve as a client terminal. The reception desk typically uses a desktop computer or laptop with a screen large enough to comfortably display the dashboard and data-entry forms. Nursing and technician staff on the treatment floor benefit from using a tablet device, as the interface is fully responsive and the Progressive Web App configuration allows DialysisTrack to be installed on a tablet home screen and used in a full-screen mode that resembles a native application. Driver staff submit GPS location updates through the DialysisTrack Driver Dashboard accessed on their mobile phones.

Software Specifications — Backend:

The backend of DialysisTrack is built on Python version 3.10 or above. The primary web framework is Django version 4.2, an open-source, mature web framework that provides the ORM, authentication system, admin interface, URL routing, and security middleware. The REST API layer is provided by Django REST Framework, which handles serialisation, viewsets, authentication, and pagination. Real-time WebSocket communication for the GPS tracking module is handled by Django Channels version 4.0 running under the Daphne ASGI server in production. JWT-based authentication is implemented using the djangorestframework-simplejwt library. Two-Factor Authentication for clinical staff uses the django-otp library with the TOTP algorithm. The PyMySQL library is used as the MySQL database adapter for Python.

Software Specifications — Frontend:

The frontend of DialysisTrack is a Single Page Application built with React.js version 18. The build tool is Vite, which provides fast hot-module replacement during development and produces optimised production bundles. Client-side routing is managed by React Router version 6. HTTP communication with the backend API uses the Axios library with interceptors for automatic token refresh. The frontend is configured as a Progressive Web App using the vite-plugin-pwa package, which generates the necessary service worker and manifest file for home screen installation.

Software Specifications — Database:

MySQL version 8.0 is used as the production relational database management system. The database is configured with the utf8mb4 character set to support the full Unicode character range, including special characters in patient names and addresses. The time zone is set to Asia/Kolkata to ensure all timestamps correctly reflect Indian Standard Time. For development and testing environments, SQLite 3 can be used as a lightweight alternative that requires no separate database server installation.

Operating System:

The server runs on Ubuntu 22.04 LTS. The entire server-side application stack is containerised using Docker and orchestrated using Docker Compose, which means the operating system dependency is effectively abstracted — the containers can be run on any server that supports a recent version of the Docker Engine, whether that is a Linux virtual machine, a Windows Server with WSL2, or a macOS-based development machine.

Network Requirements:

The production deployment requires an HTTPS-enabled domain name with a valid SSL/TLS certificate. The Nginx reverse proxy handles SSL termination at the network boundary and routes requests internally to the appropriate containers over plain HTTP. For the WebSocket GPS tracking feature to function in production, the Nginx configuration must include a WebSocket upgrade proxy pass directive pointing to the Daphne ASGI server.

---

2.3 Feasibility Study

A feasibility study was conducted before development commenced, to evaluate whether DialysisTrack could be successfully built and deployed within the constraints of an academic project while still meeting the real-world requirements of I Care Dialysis Centre. The study examined feasibility across three dimensions: technical, economic, and operational.

Technical Feasibility:

All technologies selected for DialysisTrack — Django, React.js, MySQL, Docker, Django Channels — are mature, open-source, extensively documented, and widely used in production applications globally. The development team had prior academic exposure to Python and JavaScript, which provided a foundation upon which the more advanced framework-specific skills could be built during the project. No proprietary technology licenses were required, and the entire development environment was set up on standard student laptop hardware running Windows, confirming that no specialised development infrastructure was needed. The selected technologies are known to scale well — applications built on Django and React serve millions of users in commercial deployments — confirming that the proposed architecture is not only technically adequate for the current scale of the centre but can accommodate future growth. The conclusion of the technical feasibility assessment is that the project is fully technically feasible.

Economic Feasibility:

The development cost of DialysisTrack consisted entirely of the development team's time, as all software components used are open-source and free of licensing fees. The operational cost of running the deployed system is limited to server hosting charges. A cloud virtual machine of the specification required to run DialysisTrack for a single dialysis centre costs approximately eight hundred to two thousand five hundred rupees per month depending on the selected cloud provider and configuration, which is significantly lower than the annual licensing fees of commercial Hospital Management System software, which typically charges per user or per module and often requires additional fees for technical support. The automated billing and payment features of DialysisTrack are expected to reduce revenue leakage from missed invoices and billing errors, providing a measurable financial return on the cost of deployment. The economic feasibility conclusion is that the system is economically viable.

Operational Feasibility:

The system was designed with operational simplicity as a priority. Each user role is presented with an interface that shows only the controls and data relevant to their job, minimising the learning curve. A receptionist's interface, for example, shows patient registration, appointment booking, and billing — and nothing else. Nursing and technician interfaces are designed around the tasks they actually perform on the floor. The Progressive Web App configuration ensures that staff who need to use the system while moving around the treatment area can do so from a tablet without any additional software installation. The conclusion of the operational feasibility assessment is that the system is operationally feasible for deployment in a dialysis centre environment.

---

2.4 Fact Finding Techniques

Fact finding is the systematic process of collecting information about the existing system, the problem environment, and the requirements for the proposed system. For DialysisTrack, several fact finding techniques were employed during the requirements gathering phase to ensure that the system was grounded in real-world operational realities rather than theoretical assumptions.

Interviews: The primary fact finding method was structured and unstructured interviews with key stakeholders at I Care Dialysis Centre. The development team conducted extended interviews with Senior Technician Miss. Varsha Pote, who provided detailed accounts of the day-to-day operational workflows, the specific frustrations experienced by different categories of staff, and the requirements that any replacement system would need to meet. These interviews were the primary source of the functional requirements that shaped DialysisTrack's feature set.

Observation: The development team observed the actual operation of the centre during a working day to understand the physical flow of patients, the sequence of tasks performed by reception, nursing, and technical staff, and the points in the workflow where the existing system created bottlenecks or required workarounds. This direct observation revealed details that were not explicitly mentioned in the interviews — for example, the fact that nurses frequently needed to record vitals while standing at the bedside, which confirmed the need for a tablet-optimised interface for the session management screen.

Document Analysis: Existing documents used by the centre were collected and analysed, including sample patient registration forms, printed appointment scheduling sheets, blank billing formats, and the fee schedule used for computing session charges. Analysing these documents provided the development team with the precise data fields, terminologies, and calculation rules that the digital system would need to replicate and improve upon.

Questionnaire: A brief structured questionnaire was distributed to three members of the administrative staff to gather their assessment of the most severe problems in the existing system, their frequency of occurrence, and the features they considered most important in a replacement system. This questionnaire data complemented the interview findings and helped prioritise the feature backlog during the planning phase.

Research and Benchmarking: The development team researched existing healthcare management software products and reviewed publicly available documentation about the operational standards and regulatory requirements for dialysis centres in India. This research confirmed the absence of any affordable, purpose-built software solution for standalone dialysis centres in the Indian market and reinforced the value of the proposed system.

---
