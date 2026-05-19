# DialysisTrack - UML Mermaid Diagrams

These Mermaid diagrams have been explicitly designed to perfectly match the textual descriptions and logic described in `Chapter_04_System_Design.md`. You can use these mermaid blocks in markdown editors (like GitHub, Notion, or VS Code) to dynamically generate the diagrams.

## 4.6 Use Case Diagram

```mermaid
flowchart LR
    %% Actors
    Admin([Admin])
    Doctor([Doctor])
    Nurse([Nurse])
    Tech([Technician])
    Recep([Receptionist])
    Patient([Patient])
    Driver([Driver])

    %% Use Cases
    subgraph DialysisTrack System
        UC1(Patient Registration)
        UC2(Appointment Scheduling)
        UC3(Session Management)
        UC4(Billing Generation)
        UC5(Machine Status Update)
        UC6(Staff Attendance)
        UC7(Fleet Dispatch)
        UC8(Django Admin Access)
        UC9(Apply GST)
        UC10(Generate UPI QR)
        UC11(View Assigned Patients)
        UC12(Access Treatment Records)
        UC13(Update Prescriptions)
        UC14(Manage Session Vitals)
        UC15(Queue Updates)
        UC16(Machine Preparation)
        UC17(Session Start/Completion)
        UC18(View Appointment History)
        UC19(View Billing History)
        UC20(Manage Dispatch Status)
        UC21(Submit GPS Coordinates)
    end

    %% Relationships
    Admin --> UC8
    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7

    Doctor --> UC11
    Doctor --> UC12
    Doctor --> UC13

    Nurse --> UC14
    Nurse --> UC15

    Tech --> UC16
    Tech --> UC17
    Tech --> UC5

    Recep --> UC1
    Recep --> UC2
    Recep --> UC4
    Recep --> UC7

    Patient --> UC18
    Patient --> UC19

    Driver --> UC20
    Driver --> UC21

    UC4 -. "<<include>>" .-> UC9
    UC10 -. "<<extend>>" .-> UC4
```

## 4.7 Class Diagram

```mermaid
classDiagram
    class AbstractUser {
        +String username
        +String email
        +String password
    }
    class CustomUser {
        +String role
    }
    class DoctorProfile {
        +String specialization
        +String medical_license
    }
    class PatientProfile {
        +String blood_type
        +String medical_history
    }
    class NurseProfile {
        +String shift
    }
    class TechnicianProfile {
        +String certification
    }
    class DriverProfile {
        +String license_number
    }
    class Appointment {
        +Date date
        +Time time
    }
    class DialysisMachine {
        +String machine_id
        +String status
    }
    class DialysisSession {
        +Time start_time
        +Time end_time
        +String status
    }
    class BillingRecord {
        +Float amount
        +String payment_status
    }
    class MachineInventory {
        +int consumable_stock
    }
    class StaffAttendance {
        +Date date
        +String status
    }
    class AmbulanceDispatch {
        +String location
        +String status
    }
    class GPSTrackingEvent {
        +Float latitude
        +Float longitude
        +Time timestamp
    }

    AbstractUser <|-- CustomUser
    CustomUser "1" *-- "1" DoctorProfile
    CustomUser "1" *-- "1" PatientProfile
    CustomUser "1" *-- "1" NurseProfile
    CustomUser "1" *-- "1" TechnicianProfile
    CustomUser "1" *-- "1" DriverProfile

    Appointment "*" --> "1" PatientProfile
    Appointment "*" --> "1" DoctorProfile
    Appointment "*" --> "1" DialysisMachine

    DialysisSession "1" --> "1" Appointment
    BillingRecord "1" -- "1" DialysisSession

    DialysisMachine "1" --> "1" MachineInventory
    CustomUser "1" --> "*" StaffAttendance

    AmbulanceDispatch "*" --> "1" DriverProfile
    AmbulanceDispatch "*" --> "1" PatientProfile
    GPSTrackingEvent "*" --> "1" AmbulanceDispatch
```

## 4.8 Sequence Diagram

```mermaid
sequenceDiagram
    actor Receptionist
    participant Frontend as React Frontend
    participant Middleware as JWT Middleware
    participant API as AppointmentViewSet
    participant MachineSvc as Machine Availability Svc
    participant DoctorSvc as Doctor Schedule Svc
    participant DB as MySQL Database

    Receptionist->>Frontend: Submit appointment details
    Frontend->>Middleware: POST /appointments/create/ (with JWT)
    
    alt Token Invalid
        Middleware-->>Frontend: 401 Unauthorized
        Frontend-->>Receptionist: Show login prompt
    else Token Valid
        Middleware->>API: Forward request
        API->>MachineSvc: Check machine availability (Time & Date)
        
        alt Machine Unavailable
            MachineSvc-->>API: Conflict Error
            API-->>Frontend: 400 Bad Request (Machine Conflict)
            Frontend-->>Receptionist: Show conflict error
        else Machine Available
            MachineSvc-->>API: Machine Available
            API->>DoctorSvc: Check doctor availability
            
            alt Doctor Unavailable
                DoctorSvc-->>API: Conflict Error
                API-->>Frontend: 400 Bad Request (Doctor Unavailable)
                Frontend-->>Receptionist: Show unavailable error
            else Doctor Available
                DoctorSvc-->>API: Doctor Available
                API->>DB: Save appointment record (ORM)
                DB-->>API: Confirm save
                API-->>Frontend: 201 Created (Appointment Details)
                Frontend-->>Receptionist: Show success & confirmation
            end
        end
    end
```

## 4.9 Activity Diagram

```mermaid
stateDiagram-v2
    state "Patient Arrives at Centre" as StartNode
    state "Check in patient" as CheckIn
    state "Verify appointment & confirm machine" as Verify
    state "Prepare machine" as Prepare
    state "Initiate session" as Initiate
    state "Record vitals at intervals" as RecordVitals
    state "Session Ends" as SessionEnds
    
    state Fork <<fork>>
    state Join <<join>>
    
    state "Review & document session outcome (Doctor)" as DocReview
    state "Generate bill automatically (Billing System)" as GenBill
    
    state "Bill payment confirmed?" as PayConfirm
    state "Pay at reception (UPI/Cash)" as Pay
    state "Patient Discharged / Transported" as Discharge
    state "Wait for payment" as WaitPayment

    [*] --> StartNode
    StartNode --> CheckIn : Receptionist
    CheckIn --> Verify : Receptionist
    Verify --> Prepare : Technician
    Prepare --> Initiate : Technician
    Initiate --> RecordVitals : Nurse
    RecordVitals --> SessionEnds : Technician/Nurse
    
    SessionEnds --> Fork
    Fork --> DocReview
    Fork --> GenBill
    DocReview --> Join
    GenBill --> Join
    
    Join --> Pay
    Pay --> PayConfirm
    PayConfirm --> Discharge : Yes
    PayConfirm --> WaitPayment : No
    WaitPayment --> Pay
    Discharge --> [*]
```

## 4.10 Statechart Diagram

```mermaid
stateDiagram-v2
    state "Dialysis Machine States" as MachineStates {
        [*] --> Available
        Available --> Reserved : Appointment Confirmed
        Reserved --> InUse : Session Started
        InUse --> RequiresMaintenance : Usage Threshold Reached
        InUse --> Available : Session Ended
        RequiresMaintenance --> UnderMaintenance : Maintenance Started
        UnderMaintenance --> Available : Maintenance Completed
        Available --> Offline : Taken Out of Service
        Offline --> Available : Restored
    }

    state "Dialysis Session States" as SessionStates {
        [*] --> Scheduled
        Scheduled --> InProgress : Session Started
        InProgress --> Paused : Medical Interrupt
        Paused --> InProgress : Resumed
        InProgress --> Completed : Mandatory Vitals Recorded & Ended
        Scheduled --> Cancelled : Appointment Cancelled
        Completed --> [*]
        Cancelled --> [*]
    }
```

## 4.11 Collaboration Diagram

```mermaid
flowchart TD
    %% Use flowchart to mimic collaboration diagram with numbered messages
    BillingSvc[1: BillingService]
    CompSession[2: CompletedSession]
    PatientProf[3: PatientProfile]
    GSTRate[4: GSTRate Config]
    PaymentGateway[5: PaymentGateway Component]

    BillingSvc -- "1. getSessionDetails()" --> CompSession
    BillingSvc -- "2. getPatientMetadata()" --> PatientProf
    BillingSvc -- "3. getTaxBrackets()" --> GSTRate
    BillingSvc -- "4. generateUPIPayload()" --> PaymentGateway

    %% trigger
    TriggerEvent((post_save Signal)) -.-> |Triggers| BillingSvc
```

## 4.12 Component Diagram

```mermaid
flowchart TD
    Client[Client Browser / Device]
    Nginx[Nginx Reverse Proxy / Static File Server]
    React[React Frontend Bundle]
    
    subgraph Server Environment
        DjangoWSGI[Django Application Server<br/>WSGI - HTTP]
        DjangoASGI[Django Channels Worker<br/>ASGI - WebSockets]
        DRF[Django DRF REST API]
        AdminApp[Django Admin Interface]
        MySQL[(MySQL Database)]
        Redis[(Redis Message Broker)]
    end

    Client -- "HTTP/HTTPS" --> Nginx
    Client -- "WebSocket" --> Nginx
    
    Nginx -- "Serves" --> React
    Nginx -- "Routes HTTP" --> DjangoWSGI
    Nginx -- "Routes WebSockets" --> DjangoASGI
    
    DjangoWSGI -- "Exposes" --> DRF
    DjangoWSGI -- "Exposes" --> AdminApp
    
    DjangoWSGI -- "Read/Write" --> MySQL
    DjangoASGI -- "Read/Write" --> MySQL
    
    DjangoASGI -- "Pub/Sub" --> Redis
    
    React -. "Consumes" .-> DRF
```

## 4.13 Deployment Diagram

```mermaid
flowchart TD
    subgraph "Client Devices (External Network)"
        Desktop[Reception Desktop<br/>Browser]
        Tablet[Nurse Tablet<br/>Browser]
        Mobile[Driver Mobile<br/>GPS WebSocket]
    end

    subgraph "Ubuntu 22.04 Virtual Machine"
        subgraph "Docker Compose Network"
            NginxServer[Nginx Container<br/>:80 / :443]
            
            DjangoContainer[Django Backend Container<br/>Gunicorn WSGI]
            ChannelsContainer[Django Channels Container<br/>Daphne ASGI]
            
            MySQLContainer[(MySQL Database Container<br/>:3306)]
            RedisContainer[(Redis Broker Container<br/>:6379)]
        end
    end

    Desktop -- "HTTPS" --> NginxServer
    Tablet -- "HTTPS" --> NginxServer
    Mobile -- "WSS (WebSockets)" --> NginxServer

    NginxServer -- "Proxy Pass HTTP" --> DjangoContainer
    NginxServer -- "Proxy Pass WS" --> ChannelsContainer

    DjangoContainer -- "TCP/IP" --> MySQLContainer
    ChannelsContainer -- "TCP/IP" --> MySQLContainer

    ChannelsContainer -- "TCP/IP" --> RedisContainer
```
