# iVALT OnDemand ID - Product Specification

## Overview

iVALT OnDemand ID is a secure identity verification platform that enables enterprises to verify users instantly through biometric authentication (face and fingerprint) delivered via push notifications to the iVALT mobile app. The platform eliminates the need for passwords and traditional authentication methods.

## User Flow

### Step 1: Organization Registration

1. **Company Registration**
   - An organization representative visits the registration page
   - They complete the registration form with:
     - Company name
     - Primary contact person name
     - Work email address
     - Mobile phone number with country code
     - Number of users for the trial (up to 100)
     - Additional notes (optional)
   - Upon submission, the registration request is sent to the iVALT team

2. **Manual Review & Approval**
   - The iVALT team receives a notification about the new registration request
   - An iVALT administrator reviews the organization's details
   - The administrator manually approves the request in the iVALT admin system
   - Upon approval, a unique IDCONNECTION code is generated and assigned to the organization

3. **IDCONNECTION Code Delivery**
   - The organization representative receives an email confirmation with:
     - Their unique IDCONNECTION code
     - Instructions on how to proceed
     - Trial credentials (API keys)
     - Mobile app onboarding link for their users
   - This process typically completes within one business day

### Step 2: User Onboarding

1. **Mobile App Setup**
   - The organization invites up to 100 trial users
   - Each user downloads the iVALT mobile app
   - Users enroll their biometrics (face and/or fingerprint) directly in the app
   - No enterprise PKI or complex setup required

### Step 3: Identity Verification

1. **Verification Initiation**
   - An organization representative or authorized system initiates a verification request
   - They enter:
     - The organization's IDCONNECTION code
     - The user's mobile phone number with country code
   - The system validates the IDCONNECTION code (must be active and approved)

2. **Push Notification Delivery**
   - The user receives a secure push notification on their iVALT mobile app
   - The notification prompts them to verify their identity

3. **Biometric Authentication**
   - The user opens the notification in the iVALT app
   - They authenticate using their enrolled face or fingerprint
   - The biometric data is processed securely on the device

4. **Verification Result**
   - The verification result is returned to the requesting system
   - Possible outcomes:
     - **Authenticated**: User verified successfully
     - **Failed**: Authentication rejected or failed
     - **Not Found**: User not registered in iVALT system
   - The entire process typically completes in under 2 seconds

## User Interface & Features

### Landing Page

**Purpose**: Provide information about the product and guide users to relevant actions

**Features**:
- Hero section with value proposition
- Trust metrics (accuracy rate, verification time, security features)
- Feature highlights showing key capabilities
- Step-by-step implementation guide
- Security architecture overview
- Call-to-action buttons for:
  - Starting a free trial (leads to registration)
  - Trying the OnDemand ID demo

### Registration Page

**Purpose**: Allow organizations to register for trial access

**Features**:
- Registration form with validation:
  - Company name (2-255 characters)
  - Primary contact name (2-255 characters)
  - Work email address (validated format)
  - Mobile phone number with country code selector
  - Initial user count for trial (1-100 users)
  - Additional notes (optional)
- Form validation with clear error messages
- Submission confirmation with reference ID
- Informational sidebar explaining the registration process

### OnDemand ID Verification Page

**Purpose**: Allow authorized users to verify identities in real-time

**Features**:
- Verification form with:
  - IDCONNECTION code input (auto-uppercase, 4-12 alphanumeric characters)
  - Mobile phone number input with country code selector
- Real-time status display:
  - **Idle**: Form ready for input
  - **Submitting**: Sending verification request
  - **Pending**: Waiting for user to respond to push notification
  - **Authenticated**: User verified successfully
  - **Failed**: Verification failed or rejected
  - **Not Found**: Invalid IDCONNECTION or inactive account
  - **Error**: System or network error
- Live polling for verification status
- Retry functionality for failed attempts
- Clear visual feedback throughout the process

## Email Notifications

### Registration Confirmation Email

**Recipient**: Organization representative

**Purpose**: Confirm successful registration and provide next steps

**Content**:
- Company name and registration confirmation
- Reference ID for tracking
- Timeline for IDCONNECTION code provisioning (within one business day)
- Overview of what happens next:
  - Team review and approval
  - IDCONNECTION code delivery
  - API keys and mobile app onboarding link
- Contact information for questions

### Admin Notification Email

**Recipient**: iVALT team administrator

**Purpose**: Alert team about new registration requiring review

**Content**:
- Company name and contact details
- Primary contact name and email
- Phone number
- Initial user count for trial
- Any additional notes provided
- Reference ID
- Link to admin system for approval

### Verification Alert Email

**Recipient**: iVALT team administrator

**Purpose**: Notify team about verification attempts for audit purposes

**Content**:
- IDCONNECTION code used
- Mobile phone number
- Verification status
- iVALT system status code
- Request ID for tracking
- Timestamp

## iVALT Integration

The platform integrates with the iVALT authentication system to provide secure biometric verification:

**Authentication Flow**:
- When a verification request is initiated, the platform communicates with the iVALT system
- iVALT sends a push notification to the user's mobile app
- The user authenticates using their enrolled biometrics in the app
- The authentication result is returned to the platform

**Security Features**:
- End-to-end encryption for all communications
- Biometric data processed on-device (never stored centrally)
- Real-time fraud detection and prevention
- Geo-location and time-window validation capabilities (optional)

**Status Codes**:
- **200**: User authenticated successfully
- **403**: Authentication failed or rejected
- **404**: User not found in iVALT system
- **422**: Pending - awaiting user response

## Data Storage

### Organization Data

**Purpose**: Store information about registered organizations

**Data Stored**:
- Unique organization identifier
- Company name
- Primary contact person name
- Contact email address
- Contact phone number (country code + mobile number)
- Initial user count for trial
- IDCONNECTION code (assigned after approval)
- Account status (pending, active, inactive)
- Additional notes
- Registration timestamp
- Last updated timestamp

### Verification Request Data

**Purpose**: Maintain an audit trail of all verification attempts

**Data Stored**:
- Unique request identifier
- IDCONNECTION code used
- User's mobile phone number (country code + mobile number)
- Request source (label indicating where request originated)
- Verification status (initiated, pending, authenticated, failed, not_found, error)
- iVALT system status code
- iVALT system response details
- IP address of the requesting system
- User agent (browser/device information)
- Request timestamp
- Completion timestamp (if completed)

**Audit Trail Benefits**:
- Complete history of all verification attempts
- Ability to investigate issues or disputes
- Compliance and security monitoring
- Usage analytics and reporting

## Security & Privacy

**Data Protection**:
- All data stored securely with access controls
- Regular backups and disaster recovery
- Compliance with data protection regulations

**Authentication Security**:
- Biometric authentication processed on-device
- No passwords stored or transmitted
- Real-time fraud detection

**Access Control**:
- IDCONNECTION codes ensure only authorized organizations can initiate verifications
- Manual approval process prevents unauthorized access (handled by iVALT team)
- Admin team oversight for all registrations (handled by iVALT team)

## Trial Limitations

- Up to 100 users per trial
- Duration determined by iVALT team
- IDCONNECTION code required for verification
- Manual approval required for registration
- Trial credentials provided after approval
