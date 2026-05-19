# DialysisTrack - Analysis Diagrams (ERD, DFD, FDD)

These Mermaid diagrams correspond to Chapter 3: Analysis (Sections 3.2 to 3.5). 

## 3.2 Functional Decomposition Diagram (FDD)

```mermaid
flowchart TD
    SYS[DialysisTrack System]
    
    %% Primary Modules
    SYS --> M1[User Management]
    SYS --> M2[Patient Management]
    SYS --> M3[Appointment & Scheduling]
    SYS --> M4[Queue & Session Mgmt]
    SYS --> M5[Machine Inventory Mgmt]
    SYS --> M6[Billing & Payment Processing]
    SYS --> M7[Fleet & Ambulance Mgmt]
    SYS --> M8[Clinical Data Mgmt]
    SYS --> M9[Reporting & Analytics]
    SYS --> M10[Notification Mgmt]
    SYS --> M11[Audit & Security]

    %% Sub-functions (abbreviated for diagram readability)
    M1 --> M1_1[User Registration]
    M1 --> M1_2[Role Assignment]
    M1 --> M1_3[Login & JWT Auth]
    
    M2 --> M2_1[Patient Registration]
    M2 --> M2_2[Profile View/Update]
    M2 --> M2_3[Emergency Flag Mgmt]
    
    M3 --> M3_1[Appointment Booking]
    M3 --> M3_2[Conflict Detection]
    M3 --> M3_3[Machine Availability]
    
    M4 --> M4_1[Patient Check-In]
    M4 --> M4_2[Vital Sign Entry]
    M4 --> M4_3[Session Recording]
    
    M6 --> M6_1[Auto Bill Generation]
    M6 --> M6_2[GST Computation]
    M6 --> M6_3[UPI & Razorpay]
    
    M7 --> M7_1[Ambulance Dispatch]
    M7 --> M7_2[Live GPS Tracking]
    
    M8 --> M8_1[Infection Status]
    M8 --> M8_2[Dialysis Prescription]
    M8 --> M8_3[Lab Results & Kt/V]
```

## 3.3 Context Level Diagram (DFD Level 0)

```mermaid
flowchart TD
    %% External Entities
    Rec[Receptionist]
    Doc[Doctor]
    Nur[Nurse]
    Tech[Technician]
    Pat[Patient]
    Driv[Driver]
    Admin[Administrator]

    %% Central System
    SYS(("DialysisTrack\nDialysis Centre\nManagement System"))

    %% Flows
    Rec -->|"Patient Registration, Booking Requests, Payments"| SYS
    SYS -->|"Confirmations, Bills, UPI QR Codes"| Rec

    Doc -->|"Clinical Notes, Prescriptions, Labs"| SYS
    SYS -->|"Patient History Reports, Clinical Alerts"| Doc

    Nur -->|"Vital Sign Readings, Session Events"| SYS
    SYS -->|"Queue Updates, Task Notifications"| Nur

    Tech -->|"Machine Status, Session Events"| SYS
    SYS -->|"Maintenance Alerts, Assignments"| Tech

    Pat -->|"Self-Registration Data"| SYS
    SYS -->|"Reminders, Bill & Dispatch Notifications"| Pat

    Driv -->|"GPS Coordinates, Ride Status"| SYS
    SYS -->|"Ride Assignment Notifications"| Driv

    Admin -->|"Administrative Data"| SYS
    SYS -->|"Operational Reports, Audit Logs, System Alerts"| Admin
```

## 3.4 Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o| Patient : "has profile"
    Patient ||--o{ Appointment : "books"
    Patient ||--o{ Queue : "enters"
    Patient ||--o{ Bill : "receives"
    Patient ||--o{ DialysisPrescription : "has"
    Patient ||--o{ LabResult : "has tests"
    Patient ||--o{ AmbulanceRide : "takes"
    
    Appointment }o--|| DialysisMachine : "assigned to"
    Appointment |o--o| Queue : "optional link"
    Queue ||--|| DialysisSession : "records"
    Bill ||--o{ Payment : "generates"
    Ambulance ||--o{ AmbulanceRide : "performs"
    User ||--o{ Ambulance : "Driver assigned"

    User {
        int user_id PK
        string role
        string username
        string hashed_password
    }
    Patient {
        string patient_id PK
        string first_name
        string last_name
        boolean is_emergency
        string hepatitis_b_status
    }
    Appointment {
        string appointment_id PK
        date appointment_date
        string status
    }
    Queue {
        string queue_number PK
        string priority
        string status
    }
    DialysisSession {
        int pre_bp_systolic
        int blood_flow_rate
        decimal ultrafiltration_volume
    }
    Bill {
        string bill_number PK
        decimal total_amount
        decimal tax_amount
    }
    Payment {
        string payment_id PK
        string payment_method
        string transaction_id
    }
    DialysisPrescription {
        int session_duration_minutes
        decimal target_ktv
    }
    LabResult {
        decimal pre_dialysis_bun
        string infection_screening_results
    }
    Ambulance {
        string registration_number PK
        string status
    }
    AmbulanceRide {
        decimal driver_lat
        decimal driver_lng
        string status
    }
    DialysisMachine {
        string machine_id PK
    }
```

## 3.5 Data Flow Diagram (DFD Level 1)

```mermaid
flowchart TD
    %% Entities
    Rec[Receptionist]
    Doc[Doctor]
    NurTech[Nurse / Technician]
    Driv[Driver]
    Admin[Administrator]

    %% Stores
    DS1[(User Store)]
    DS2[(Patient Store)]
    DS3[(Appointment Store)]
    DS5[(Queue Store)]
    DS6[(Session Store)]
    DS7[(Bill Store)]
    DS8[(Fleet Store)]

    %% Processes
    P1((1. User Auth))
    P2((2. Patient Mgmt))
    P3((3. Appointment Scheduling))
    P4((4. Queue & Session Mgmt))
    P5((5. Billing & Payment))
    P6((6. Fleet Mgmt))
    P7((7. Clinical Data Mgmt))
    P8((8. Reports & Analytics))

    %% Data Flows
    Rec -->|Registration Data| P2
    P2 <-->|Read/Write Profile| DS2
    
    Rec -->|Booking Request| P3
    P3 <-->|Read/Write Conflicts| DS3
    
    NurTech -->|Check-in / Events| P4
    P4 <-->|Update Status| DS5
    P4 -->|Write Session| DS6
    P4 -->|Session Completion Trigger| P5
    
    P5 <-->|Read Details| DS6
    P5 -->|Write Bill| DS7
    P5 -->|QR Code & Status| Rec
    
    Rec -->|Dispatch| P6
    Driv -->|GPS| P6
    P6 <-->|Update Ride| DS8
    
    Doc -->|Prescription/Labs| P7
    P7 -->|Clinical Alerts| Admin
    
    P8 <-->|Aggregate Data| DS2
    P8 <-->|Aggregate Data| DS6
    P8 <-->|Aggregate Data| DS7
    P8 -->|Formatted Reports| Admin
```
