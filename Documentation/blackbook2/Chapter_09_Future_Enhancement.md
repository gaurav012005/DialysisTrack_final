
Chapter – 9 : Scope for Future Enhancement

---

9.1 Overview of Future Scope

While the current version of DialysisTrack successfully addresses the primary operational bottlenecks of I Care Dialysis Centre, the modular architecture of the system allows for significant future expansion. A software system in the healthcare domain must continually evolve to meet new medical guidelines, operational scales, and patient expectations. The following enhancements have been identified as valuable future additions to the platform.

---

9.2 Hardware Integration Enhancements

Direct Machine Integration: Currently, dialysis parameters and vital signs are read from the machine's display by a nurse or technician and manually entered into the DialysisTrack tablet interface. Future versions of the system could integrate directly with the APIs of modern dialysis machines (such as those manufactured by Fresenius or Baxter) using standard healthcare interoperability protocols like HL7 or FHIR. This would allow the system to pull continuous real-time data directly from the machine during the session, eliminating manual data entry entirely and preventing transcription errors.

Biometric Authentication: To further strengthen the security of the Role-Based Access Control system and speed up the login process for clinical staff on the treatment floor, biometric authentication could be implemented. Integrating a fingerprint scanner or facial recognition system at the nurse station tablets would allow staff to quickly authenticate and record vital signs without needing to type passwords or check authenticator apps during busy shifts.

IoT Temperature and Humidity Monitoring: Dialysis centres must maintain specific environmental conditions, particularly in areas where dialysate and medical supplies are stored. Integrating Internet of Things (IoT) temperature and humidity sensors into the DialysisTrack dashboard would allow administrators to monitor the physical facility environment in real time and receive automated alerts if conditions fall outside safe medical parameters.

---

9.3 Software and Functional Enhancements

Inventory and Consumables Management: Dialysis treatment requires a constant supply of specific consumables — dialyzers, blood tubing sets, fistula needles, heparin, and normal saline. A dedicated inventory module could be added to DialysisTrack to track the stock levels of these items. By linking this module to the session completion process, the system could automatically deduct the standard consumables used in a session from the inventory count and generate purchase order alerts when stock falls below predefined threshold levels.

Advanced Machine Maintenance Scheduling: The current system tracks machine assignment to prevent double-booking. This could be expanded into a comprehensive preventive maintenance module. The system could track the total number of running hours for each machine and automatically flag a machine as "Maintenance Required" when it hits the manufacturer's specified service interval, blocking it from being scheduled for patient use until a technician clears the maintenance flag.

Dietary and Nutrition Tracking: Nutrition plays a critical role in the management of End-Stage Renal Disease. A new module could be developed to allow the centre's visiting dietician to record nutritional assessments, prescribe specific renal diets (managing protein, potassium, phosphorus, and sodium intake), and track the patient's nutritional adherence alongside their clinical lab results.

Predictive Clinical Analytics: By applying machine learning algorithms to the accumulated historical data of a patient's pre- and post-dialysis weights, blood pressure trends, and laboratory results, the system could provide predictive clinical alerts. For example, the system could flag a patient who is statistically at a high risk for an intradialytic hypotensive episode (a sudden drop in blood pressure during dialysis) before the session even begins, allowing the clinical staff to adjust the ultrafiltration profile proactively.

Multi-Branch Support: As the client organisation grows, they may open additional dialysis centres in different locations. DialysisTrack could be upgraded to a multi-tenant architecture, allowing a central administrative team to manage multiple branches from a single deployment. This would involve adding a "Branch" entity to the database and ensuring all queries and dashboards are securely filtered by the user's assigned branch.

---


9.4 Limitations of the Current System

DialysisTrack was developed as an academic project within a defined timeframe, and while it is functionally comprehensive, several limitations exist in the current version that are important to document honestly:

Single-Centre Architecture: The system is designed to operate for a single dialysis centre. All patient records, machines, staff, and billing data are scoped to one installation. An organisation that operates multiple dialysis centres across different locations would need to run separate instances of DialysisTrack, with no shared data or consolidated reporting across centres. This is a significant architectural limitation for any business that wants to scale.

No Direct Hardware Integration: Patient vitals — blood pressure, pulse, weight — are entered manually by nursing staff. There is no direct API integration with the physical dialysis machines or bedside monitoring devices to automatically capture these readings. Manual entry introduces the possibility of transcription errors and is dependent on staff diligence in recording readings on schedule.

No HL7 / FHIR Compliance: DialysisTrack does not implement HL7 or FHIR healthcare interoperability standards. This means it cannot exchange patient data directly with other hospital information systems, national e-health registries (such as India's ABHA platform), or third-party laboratory information systems. Data sharing with external systems requires manual CSV export and import.

Limited Offline Capability: While the PWA service worker provides basic caching of static assets, the application is not truly offline-capable for data operations. Vital sign entries, appointment lookups, and queue updates require an active network connection to the server. In areas with unreliable internet connectivity, this could be a problem.

No AI-Powered Recommendations: Treatment schedule optimisation, machine load balancing across the week, and early flagging of deteriorating patient vitals are currently manual, judgment-based activities. The system collects the data needed to support these decisions but does not yet use any machine learning models to generate proactive recommendations.

---
