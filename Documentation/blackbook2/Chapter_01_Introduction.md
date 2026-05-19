
Chapter – 1 : Introduction

---

1.1 Company Profile

I Care Dialysis Centre is a dedicated renal therapy facility situated in Pune, Maharashtra. The centre was established with the singular mission of delivering high-quality dialysis treatment to patients suffering from chronic kidney disease and end-stage renal disease. It operates under the clinical supervision of qualified nephrologists and is supported by a full team of trained nurses, dialysis technicians, and administrative personnel who together ensure that every patient receives timely, safe, and medically appropriate care.

The facility maintains a fleet of dialysis machines that are serviced at regular intervals in accordance with biomedical engineering standards. Strict infection control procedures are followed at all times to protect patients who may be immunocompromised as a result of their underlying renal condition. The centre operates on a shift-based model with morning, afternoon, and evening shifts, allowing it to serve a substantial patient population across the course of each working day. Most patients attend the centre two to three times per week, each session typically lasting between three and five hours depending on the patient's individualised treatment prescription.

Beyond the clinical treatment itself, I Care Dialysis Centre provides ambulance transport services to assist elderly and mobility-limited patients in travelling to and from the facility. A team of trained drivers is employed for this purpose, and the centre coordinates pick-up and drop schedules in alignment with each patient's appointment timetable. The centre also maintains a dedicated administrative team responsible for patient registration, appointment coordination, billing, and insurance documentation.

Senior Technician Miss. Varsha Pote, who served as the client representative for this software project, provided the development team with detailed domain knowledge about the centre's operational requirements. Her on-ground experience made it possible to understand the precise pain points encountered by administrative and clinical staff in the day-to-day management of the centre, and her inputs were instrumental in shaping the feature set of the DialysisTrack system.

The centre serves a diverse patient population across a range of age groups. Managing this population — with all the associated scheduling, clinical documentation, billing, and transport coordination — at the scale at which the centre operates demands a level of accuracy, consistency, and real-time information access that the traditional paper-based systems in use were no longer able to provide reliably.

---

1.2 Existing System

Prior to the development of DialysisTrack, the operational management of I Care Dialysis Centre, like most smaller to mid-sized dialysis facilities in the region, was conducted through a combination of physical registers, handwritten patient cards, and Microsoft Excel spreadsheets. This combination of tools had evolved naturally over several years, and while it was functional at a modest scale, it had begun to show significant structural limitations as the centre's patient population grew and operational complexity increased.

Patient registration was handled through individual paper-based files maintained for each patient. Each file contained the patient's demographic details, primary diagnosis, assigned treating doctor, and a log of previous visits. When a new patient registered at the centre, a receptionist would fill out a printed form by hand and file it in a physical cabinet organised by patient number. Retrieving a patient's record required either recalling the patient's file number from memory or searching the cabinet manually — a process that became increasingly slow as the volume of registered patients grew.

Appointment scheduling was managed primarily through a combination of a large wall calendar and, in more recent years, a shared Microsoft Excel file stored on the reception computer. Receptionists would manually enter patient names against available machine slots for each day. This method had no automatic conflict detection of any kind. If two members of reception staff updated the appointment file at different times without checking one another's entries, or if the file was not synchronised across devices, the same machine slot could be inadvertently assigned to two different patients. Such conflicts were only discovered when the patients physically arrived for their sessions.

Billing was handled through a basic accounting software that was entirely separate from the patient management files. After a session was completed, the billing clerk had to manually calculate the charges by consulting a printed fee schedule, add any additional consumable charges or laboratory test costs, compute the applicable Goods and Services Tax, and then enter the final total into the accounting software. There was no automated link between the session completion event and the billing process — each required a separate manual action by a different member of staff.

The ambulance service was coordinated entirely through telephone calls and WhatsApp messages between the reception desk and the drivers. There was no formal dispatch log, no mechanism for tracking a vehicle's current location, and no documentation of completed transport events. When a patient or family member needed to know when their ambulance would arrive, the only available method was to call the driver directly on a personal phone number.

Staff scheduling and attendance were maintained through a handwritten shift register. Nurses and technicians signed in at the beginning of their shift and signed out at the end. There was no automated system for generating attendance summaries or for checking whether the scheduled staff for a given day had all arrived on time.

---

1.3 Problems in Existing System

A detailed study of the existing system at I Care Dialysis Centre, supplemented by direct conversations with the centre's administrative and clinical staff, identified a number of significant operational problems that directly motivated the development of DialysisTrack.

The most disruptive problem was the frequent occurrence of appointment conflicts and machine double-bookings. Because the Excel-based appointment schedule had no automatic conflict-checking mechanism, two patients could be booked for the same dialysis machine at the same time. These conflicts were only discovered when patients arrived at the centre, causing distress, confusion, and disruption to the day's session schedule. Resolving a conflict manually meant calling one of the affected patients and rescheduling them, which interrupted their treatment routine.

A second major problem was the complete absence of real-time operational visibility. At any given moment during operating hours, neither the administration nor the treating doctors had a live view of the treatment floor. Knowing which machines were currently in use, which sessions were running behind schedule, and which patients were waiting for their turn required physically walking to the floor or making internal phone calls. This lack of visibility made it impossible to manage the centre's capacity proactively.

The manual billing process was both slow and error-prone. Computing the correct total — accounting for the base session fee, consumable charges, any additional laboratory tests, and the applicable GST rate — required careful manual arithmetic for each patient after every session. Errors in this computation resulted in either under-charging (creating revenue loss for the centre) or over-charging (creating disputes with patients). Moreover, because billing had no automated connection to session completion, sessions were occasionally missed in the billing cycle on busy days.

Patient history was effectively inaccessible in a consolidated form. A treating nephrologist who needed to review a patient's weight trend, blood pressure history across the last fifteen sessions, or the timeline of medication changes would have to locate and physically examine the patient's paper file — a file that might be at the reception desk, with the nurse, or misfiled. Clinical decisions were therefore sometimes made without access to the full picture of the patient's recent health trajectory.

Patient privacy and data security were significant unaddressed concerns. Medical records — including sensitive infection status information such as Hepatitis B, Hepatitis C, and HIV — were stored in physical files that any staff member could access without authentication or audit. There was no access control, no log of who had read or modified a record, and no mechanism for restricting sensitive clinical data to authorised personnel only.

Finally, the complete absence of any transport tracking or documentation for the ambulance service was a problem for both operational efficiency and patient safety. When a vehicle was dispatched, there was no way to know its current location, verify that it had completed its journey, or maintain any record of the trip for management review.

---

1.4 Needs for Computerisation

The problems documented in the previous section made a compelling and urgent case for the complete computerisation of I Care Dialysis Centre's operations. The need was not merely to replace paper with a digital equivalent, but to implement a purpose-built, integrated software system that would actively assist staff in their daily work — one that enforced correct procedures, prevented common errors automatically, and gave all categories of users immediate access to the information they needed to do their jobs effectively.

The most pressing need was for an intelligent appointment scheduling system that would make machine double-booking technically impossible rather than merely administratively discouraged. A system with server-side conflict validation would check the availability of every machine and every doctor before confirming any booking, and would refuse to create a conflicting appointment regardless of which staff member initiated the request or which terminal they were using.

Equally pressing was the need for automated billing that was directly connected to session completion. The moment a dialysis session was marked as complete by clinical staff, the system should generate the patient's bill automatically, compute the correct GST, and present it for payment — without requiring a separate manual action from the billing department. This would eliminate billing delays, prevent missed invoices, and remove the risk of arithmetic errors from the process entirely.

A centralised patient record system was needed to replace the physical file cabinet. Every piece of information about a patient — demographics, medical history, infection status, dialysis prescription, lab results, appointment history, session records, and billing — should be accessible from a single digital interface, searchable in seconds, and protected by role-based access control so that only the appropriate categories of staff can view or modify specific sections.

The centre also required a real-time view of the treatment floor — a live dashboard that would show which sessions were in progress, which machines were available, which patients were waiting, and which sessions were running behind the scheduled end time. This visibility would enable management to make timely decisions without leaving the office or making phone calls.

Modern payment methods were needed to replace cash-only collection. The system should support digital payments through UPI and online payment gateways, generating a QR code for each bill so that patients can pay instantly using Google Pay, PhonePe, Paytm, or any other UPI application. This would reduce cash-handling risk at the reception counter and provide patients with a more professional service experience.

Finally, computerisation was needed to address the centre's growing regulatory and compliance obligations. Healthcare data regulations require that patient records be maintained securely, with access restricted to authorised personnel and a complete audit trail of all data modifications. A digital system with role-based authentication and comprehensive audit logging can meet these requirements in a way that a paper system is fundamentally incapable of.

DialysisTrack was conceived, designed, and built specifically to address every one of these identified needs — a comprehensive, purpose-built digital management system for the dialysis centre environment.

---
