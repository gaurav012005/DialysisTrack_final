# DialysisTrack - Access Control Matrix

**Generated:** 2026-01-21 15:22:00

## Summary

| Module | Admin | Doctor | Nurse | Technician | Receptionist | Patient |
|--------|-------|--------|-------|------------|--------------|--------|
| Dashboard | ✅ | ⚠️ | ⚠️ | ✅ | ✅ | ✅ |
| Patients | ✅ | ⚠️ | ⚠️ | ✅ | ✅ | ❌ |
| Queue | ✅ | ⚠️ | ⚠️ | ✅ | ✅ | ❌ |
| Machines | ✅ | ⚠️ | ⚠️ | ✅ | ✅ | ✅ |
| Sessions | ✅ | ⚠️ | ⚠️ | ✅ | ✅ | ❌ |
| Staff | ✅ | ⚠️ | ⚠️ | ✅ | ✅ | ✅ |
| Billing | ✅ | ⚠️ | ⚠️ | ✅ | ✅ | ✅ |
| Reports | ✅ | ⚠️ | ⚠️ | ✅ | ✅ | ✅ |
| Appointments | ✅ | ⚠️ | ⚠️ | ✅ | ✅ | ✅ |

## Detailed Permissions


### ADMIN


**Dashboard**
- ✅ `GET` - Success

**Patients**
- ✅ `GET` - Success
- ✅ `POST` - Accessible (validation error)
- ⚠️ `PUT` - HTTP 405
- ⚠️ `DELETE` - HTTP 405

**Queue**
- ✅ `GET` - Success
- ✅ `POST` - Accessible (validation error)
- ⚠️ `PUT` - HTTP 405

**Machines**
- ✅ `GET` - Success
- ✅ `POST` - Accessible (validation error)
- ⚠️ `PUT` - HTTP 405

**Sessions**
- ✅ `GET` - Success
- ✅ `POST` - Accessible (validation error)

**Staff**
- ✅ `GET` - Success
- ✅ `POST` - Accessible (validation error)

**Billing**
- ✅ `GET` - Success
- ✅ `POST` - Accessible (validation error)

**Reports**
- ✅ `GET` - Success

**Appointments**
- ✅ `GET` - Success
- ✅ `POST` - Accessible (validation error)

### DOCTOR


### NURSE


### TECHNICIAN


**Dashboard**
- ✅ `GET` - Success

**Patients**
- ✅ `GET` - Success
- ❌ `POST` - Forbidden
- ❌ `PUT` - Forbidden
- ❌ `DELETE` - Forbidden

**Queue**
- ✅ `GET` - Success
- ❌ `POST` - Forbidden
- ⚠️ `PUT` - HTTP 405

**Machines**
- ✅ `GET` - Success
- ✅ `POST` - Accessible (validation error)
- ⚠️ `PUT` - HTTP 405

**Sessions**
- ✅ `GET` - Success
- ❌ `POST` - Forbidden

**Staff**
- ✅ `GET` - Success
- ✅ `POST` - Accessible (validation error)

**Billing**
- ✅ `GET` - Success
- ✅ `POST` - Accessible (validation error)

**Reports**
- ✅ `GET` - Success

**Appointments**
- ✅ `GET` - Success
- ✅ `POST` - Accessible (validation error)

### RECEPTIONIST


**Dashboard**
- ✅ `GET` - Success

**Patients**
- ✅ `GET` - Success
- ✅ `POST` - Accessible (validation error)
- ⚠️ `PUT` - HTTP 405
- ❌ `DELETE` - Forbidden

**Queue**
- ✅ `GET` - Success
- ❌ `POST` - Forbidden
- ❌ `PUT` - Forbidden

**Machines**
- ✅ `GET` - Success
- ✅ `POST` - Accessible (validation error)
- ⚠️ `PUT` - HTTP 405

**Sessions**
- ✅ `GET` - Success
- ❌ `POST` - Forbidden

**Staff**
- ✅ `GET` - Success
- ✅ `POST` - Accessible (validation error)

**Billing**
- ✅ `GET` - Success
- ✅ `POST` - Accessible (validation error)

**Reports**
- ✅ `GET` - Success

**Appointments**
- ✅ `GET` - Success
- ✅ `POST` - Accessible (validation error)

### PATIENT


**Dashboard**
- ✅ `GET` - Success

**Patients**
- ❌ `GET` - Forbidden
- ❌ `POST` - Forbidden
- ❌ `PUT` - Forbidden
- ❌ `DELETE` - Forbidden

**Queue**
- ❌ `GET` - Forbidden
- ❌ `POST` - Forbidden
- ❌ `PUT` - Forbidden

**Machines**
- ✅ `GET` - Success
- ✅ `POST` - Accessible (validation error)
- ⚠️ `PUT` - HTTP 405

**Sessions**
- ❌ `GET` - Forbidden
- ❌ `POST` - Forbidden

**Staff**
- ✅ `GET` - Success
- ✅ `POST` - Accessible (validation error)

**Billing**
- ✅ `GET` - Success
- ✅ `POST` - Accessible (validation error)

**Reports**
- ✅ `GET` - Success

**Appointments**
- ✅ `GET` - Success
- ✅ `POST` - Accessible (validation error)
