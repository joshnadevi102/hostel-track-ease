# CampusCare Hub

Build a complete full-stack web application called "CampusCare" — a Hostel Complaint Management System.

IMPORTANT:

- Build the actual working application, not just a landing page or UI mockup.

- Keep the implementation simple, clean, modular, and suitable for a college project.

- Avoid unnecessary animations, complex libraries, and over-engineering.

- Make the UI responsive for desktop, tablet, and mobile.

- Use a modern, clean campus-management SaaS style.

- Use the attached CampusCare reference image/poster as the visual and functional reference.

- Preserve the overall idea, colors, sections, and workflow from the reference, but create a professional web application rather than copying the poster literally.

TECH STACK:

- React

- TypeScript

- Tailwind CSS

- shadcn/ui where useful

- Supabase for authentication and database

- Use proper reusable components

- Use Supabase Storage for complaint images

- Use realtime updates where practical

APPLICATION NAME:

CampusCare

TAGLINE:

"Report → Track → Resolve"

"Because your comfort matters."

CORE PURPOSE:

Students should be able to report hostel problems/complaints, track their status, and receive updates. Wardens/volunteers should verify and assign complaints. Assigned staff should update progress and resolve complaints. Management/admin should monitor everything through dashboards and reports.

==================================================

1. USER ROLES

==================================================

Implement four roles:

1. STUDENT

- Register/login

- Create complaint

- Upload complaint image

- Select complaint category

- Set/see priority

- Track complaint status

- View complaint history

- Receive notifications

- View complaint details

2. VOLUNTEER

- Login

- View complaints assigned to them

- Verify complaints

- Add verification notes

- Upload supporting image

- Assign complaint to appropriate staff/team

- Update status

3. WARDEN

- Login

- View all complaints for their hostel

- Verify complaints

- Set priority

- Assign complaints

- Monitor progress

- Verify resolution

- Close complaints

- View reports

4. MANAGEMENT / ADMIN

- Login

- Dashboard with overall statistics

- Manage users

- Manage hostels

- Manage complaint categories

- View all complaints

- View analytics

- View reports

- Assign/reassign complaints

- Manage system settings

==================================================

2. COMPLAINT WORKFLOW

==================================================

Implement this exact workflow:

SUBMITTED

↓

VERIFIED

↓

ASSIGNED

↓

IN PROGRESS

↓

RESOLVED

↓

CLOSED

Each complaint must have:

- Unique complaint ID

- Student

- Hostel

- Room number

- Category

- Description

- Image(s)

- Priority: High / Medium / Low

- Current status

- Created date/time

- Assigned person/team

- Verification notes

- Resolution notes

- Before image

- After image

- Updated date/time

Rules:

- Student creates complaint → SUBMITTED

- Volunteer/Warden verifies → VERIFIED

- Complaint is assigned → ASSIGNED

- Assigned person starts work → IN PROGRESS

- Staff marks work completed → RESOLVED

- Warden verifies resolution → CLOSED

- Every status change must be stored in complaint history.

==================================================

3. COMPLAINT CATEGORIES

==================================================

Create these default categories:

- Water / Plumbing

- Electricity

- Wi-Fi / Internet

- Cleaning

- Food / Mess

- Room Maintenance

- Bathroom

- Furniture

- Security

- Other

Allow admin to add/edit/delete categories.

==================================================

4. STUDENT DASHBOARD

==================================================

Create a clean student dashboard.

Show summary cards:

- Total Complaints

- Pending

- In Progress

- Resolved

- Closed

Include:

- "Raise Complaint" primary button

- Recent complaints table/cards

- Complaint status badges

- Search/filter

- Notifications

Create a "Raise Complaint" form containing:

- Category

- Hostel

- Room number

- Title

- Description

- Priority

- Image upload

- Submit button

If possible, support QR-based reporting:

- Each hostel/room/location can have a QR code.

- Scanning the QR code should open the complaint form with hostel/location information prefilled.

- For the MVP, create a QR code management page for admin and support location-prefilled complaint URLs.

==================================================

5. COMPLAINT DETAILS PAGE

==================================================

Create a detailed complaint page.

Show:

- Complaint ID

- Title

- Description

- Category

- Location

- Priority

- Created date

- Current status

- Assigned person

- Complaint image

- Resolution image when available

Most importantly, create a visual status timeline:

Submitted → Verified → Assigned → In Progress → Resolved → Closed

Highlight the current status.

Also show an activity/history timeline:

- Complaint submitted

- Verified

- Assigned

- Work started

- Resolution uploaded

- Warden verified

- Complaint closed

==================================================

6. VOLUNTEER DASHBOARD

==================================================

Show:

- Assigned complaints

- Pending verification

- In progress

- Recently completed

Actions:

- Open complaint

- Verify

- Add notes

- Upload image

- Set priority

- Assign to staff/team

- Update status

==================================================

7. WARDEN DASHBOARD

==================================================

Create a hostel-focused dashboard.

Cards:

- Total Complaints

- Pending Verification

- High Priority

- In Progress

- Resolved

- Closed

Include:

- Complaint table

- Filters by status

- Filters by category

- Filters by priority

- Filters by hostel

- Search by complaint ID/student/title

Warden actions:

- Verify complaint

- Set priority

- Assign complaint

- Reassign complaint

- Verify resolution

- Close complaint

==================================================

8. ADMIN / MANAGEMENT DASHBOARD

==================================================

Create a professional analytics dashboard.

Show:

- Total complaints

- Open complaints

- Resolved complaints

- Closed complaints

- High priority complaints

- Average resolution time

- Complaints by category

- Complaints by hostel

- Complaints by status

- Complaints over time

Use simple charts.

Add:

- User management

- Hostel management

- Category management

- Complaint management

- Reports

Allow filtering analytics by:

- Date

- Hostel

- Category

- Status

- Priority

==================================================

9. SEARCH AND FILTERS

==================================================

Implement global complaint search.

Search by:

- Complaint ID

- Student name

- Complaint title

- Hostel

- Category

Filters:

- Status

- Priority

- Category

- Hostel

- Date

Make filters easy to use and mobile responsive.

==================================================

10. NOTIFICATIONS

==================================================

Create an in-app notification system.

Examples:

- Complaint submitted successfully

- Complaint verified

- Complaint assigned

- Complaint status changed

- Complaint resolved

- Complaint closed

Show notification bell in navbar.

Use Supabase realtime where practical so status changes can appear without refreshing.

For MVP, in-app notifications are required.

Email/SMS can be structured for future integration but do not add expensive/complex external services now.

==================================================

11. DATABASE

==================================================

Create a proper Supabase relational database.

Suggested tables:

profiles

- id

- name

- email

- phone

- role

- hostel_id

- room_number

- created_at

hostels

- id

- name

- location

- created_at

categories

- id

- name

- description

- created_at

complaints

- id

- complaint_number

- student_id

- hostel_id

- category_id

- title

- description

- room_number

- priority

- status

- assigned_to

- created_at

- updated_at

- resolved_at

- closed_at

complaint_images

- id

- complaint_id

- image_url

- image_type

- uploaded_by

- created_at

complaint_history

- id

- complaint_id

- user_id

- old_status

- new_status

- note

- created_at

notifications

- id

- user_id

- complaint_id

- title

- message

- is_read

- created_at

teams

- id

- name

- description

team_members

- team_id

- user_id

qr_locations

- id

- hostel_id

- location_name

- room_number

- qr_code

- created_at

==================================================

12. SECURITY

==================================================

Implement Supabase Row Level Security.

Students:

- Can create their own complaints.

- Can view their own complaints.

- Can view their own notifications.

Volunteers:

- Can view complaints relevant to their assigned hostel/work.

- Can update complaints they are responsible for.

Wardens:

- Can manage complaints belonging to their hostel.

Admins:

- Can access all system data.

Do not expose sensitive data unnecessarily.

==================================================

13. UI DESIGN

==================================================

Visual direction should be inspired by the CampusCare reference image:

- Friendly

- Modern

- Student-focused

- Professional

- Clean

- Soft blue/green/purple accents

- Rounded cards

- Clear status badges

- Simple icons

- Good spacing

- Strong visual hierarchy

Main navigation:

- Dashboard

- Complaints

- Raise Complaint

- Notifications

- Reports (role dependent)

- Profile

Use different dashboards based on the logged-in user's role.

Create a responsive sidebar on desktop and appropriate mobile navigation.

Status colors:

- Submitted = blue

- Verified = purple

- Assigned = orange

- In Progress = yellow/orange

- Resolved = green

- Closed = dark green

Priority:

- High = red

- Medium = orange

- Low = green

==================================================

14. LANDING PAGE

==================================================

Create a polished landing page before login.

Hero:

CampusCare

"Report → Track → Resolve"

"Because your comfort matters."

Description:

"A centralized hostel complaint management system that makes reporting, tracking and resolving campus issues simple, transparent and efficient."

Buttons:

- Get Started

- Login

Sections:

1. The Problem

2. How CampusCare Works

3. Key Features

4. Who Uses CampusCare?

5. Simple workflow

6. Call to action

Feature cards:

- Priority Management

- QR Code Reporting

- Image Upload

- Notifications

- Search & Filters

- Analytics Dashboard

- Complaint History

- Real-time Updates

==================================================

15. DEMO DATA

==================================================

Create seed/demo data so the dashboard does not look empty.

Include sample complaints such as:

- Water purifier not working

- Bathroom tap leaking

- Wi-Fi not working

- Room fan not working

- Mess food complaint

- Electrical issue

Create realistic sample users for:

- Student

- Volunteer

- Warden

- Admin

Clearly label demo data if necessary.

==================================================

16. IMPORTANT MVP LIMITATIONS

==================================================

Do NOT build unnecessary features such as:

- Payment system

- Chat system

- AI chatbot

- Complex microservices

- Advanced SMS provider

- External analytics platforms

- Complicated notification infrastructure

Focus on making the core complaint workflow fully functional.

==================================================

17. FINAL REQUIREMENT

==================================================

The final application should allow this complete demo:

Student logs in

→ raises "Water purifier not working"

→ uploads image

→ complaint becomes SUBMITTED

→ volunteer verifies it

→ warden assigns it

→ staff updates it to IN PROGRESS

→ staff uploads resolution image

→ status becomes RESOLVED

→ warden verifies

→ status becomes CLOSED

→ student can see the complete timeline

→ admin can see the complaint in analytics/reports.

Build the application with reusable components and clean TypeScript code.

Before finishing:

- Ensure all routes work.

- Ensure authentication works.

- Ensure role-based dashboards work.

- Ensure complaint creation works.

- Ensure image upload works.

- Ensure status transitions work.

- Ensure complaint history works.

- Ensure notifications work.

- Ensure Supabase database integration works.

- Ensure there are no broken buttons or placeholder pages.

- Ensure responsive design works.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://hostel-track-ease.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/35efd76f-49c8-51de-8788-8c3ff0e17edd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
