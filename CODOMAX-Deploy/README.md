# Campus Lost & Found Portal with Live Alerts

> A full-stack, real-time web application built for college campuses to streamline lost item reporting, found property registration, automated heuristic matching, and secure retrieval coordination.

![Campus Lost & Found Portal Banner](https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80)

---

## 1. Project Overview

The **Campus Lost & Found Portal with Live Alerts** provides a centralized, authenticated platform for university students, faculty, and administrative staff. Instead of fragmented WhatsApp groups, physical bulletin boards, or unmonitored social media threads, this application delivers:

- **Structured Reporting:** Standardized forms for Lost and Found items with category classifications, campus landmarks, timestamps, color tags, and photo uploads.
- **Intelligent Heuristic Matching Engine:** Automatically calculates similarity scores between opposite report types based on categories, keyword token overlap, campus location proximity, and date timestamps.
- **Real-Time Live Alerts:** Instant WebSocket notifications powered by Socket.IO with transparent match score breakdowns.
- **Role-Based Access Control:** Distinct roles for Verified Students and Campus Security Administrators.
- **Privacy Protection:** Shields student ID numbers, phone numbers, and sensitive identifying features from unauthorized public viewing.
- **Audit Trails & Moderation:** Administrators verify authentic reports, reject inappropriate content, and soft-delete flagged items while preserving moderation history.

---

## 2. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS v3, React Router v6 |
| **Icons & UI** | Lucide React, Glassmorphism design tokens |
| **Backend API** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM (Auto-fallback to MongoMemoryServer for instant zero-config evaluation) |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs password hashing |
| **Real-Time Live Alerts** | Socket.IO (Authenticated user and admin rooms) |
| **File Storage** | Multer local disk storage with 5MB file size limit & mime validation |
| **Security** | Helmet HTTP headers, CORS origin restrictions, Express Rate Limiting |

---

## 3. Architecture Overview

```text
campus-lost-found/
├── client/                      # React frontend built with Vite
│   ├── src/
│   │   ├── components/          # Reusable UI (Navbar, Footer, ItemCard, Modals, Toast)
│   │   ├── context/             # AuthContext (JWT) and SocketContext (Socket.IO)
│   │   ├── pages/               # 14 complete responsive application pages
│   │   ├── services/            # Axios API client with interceptors
│   │   ├── App.jsx              # Protected & Admin route definitions
│   │   ├── index.css            # Tailwind directives, glassmorphism, animations
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js           # API and WebSocket proxy configuration
├── server/                      # Node.js + Express backend
│   ├── config/                  # Database connector (MongoDB + MemoryServer fallback)
│   ├── controllers/             # Auth, Item, User, Notification, Admin controllers
│   ├── middleware/              # Auth (JWT), Upload (Multer), Error handlers
│   ├── models/                  # User, ItemReport, Notification, MatchSuggestion
│   ├── routes/                  # RESTful API route definitions
│   ├── scripts/                 # Bootstrap admin & realistic database seeder
│   ├── services/                # Heuristic Matching Engine & Socket.IO Emitter
│   ├── sockets/                 # Socket.IO connection & room handler
│   ├── app.js                   # Express app setup
│   └── server.js                # Server entry point
├── uploads/                     # Local file upload directory
├── .env.example                 # Environment configuration template
├── .gitignore
├── package.json                 # Unified root development scripts
└── README.md
```

---

## 4. Database Schema (Mongoose Models)

### `User`
- `name`: String (Full student name)
- `collegeEmail`: String (Unique, lowercase college email)
- `studentId`: String (Unique uppercase student or staff ID)
- `passwordHash`: String (Bcrypt salt rounds 10)
- `role`: Enum `['student', 'admin']` (Default `'student'`)
- `department`: String (Faculty or department name)
- `phoneNumber`: String (Optional contact phone)
- `contactPreference`: Enum `['IN_APP', 'EMAIL', 'PHONE', 'SECURITY_OFFICE']`
- `isActive`: Boolean

### `ItemReport`
- `title`: String (Short item title)
- `type`: Enum `['LOST', 'FOUND']`
- `category`: Enum `['ID Card', 'Mobile Phone', 'Wallet', 'Books', 'Calculator', 'Bag', 'Electronics', 'Keys', 'Accessories', 'Documents', 'Other']`
- `description`: String (Detailed description)
- `location`: String (Campus zone / room)
- `dateOccurred`: Date
- `approximateTime`: String
- `color`: String
- `distinctiveMarks`: String
- `imageUrl`: String (Local upload path or URL)
- `ownerId`: ObjectId (Ref to User)
- `status`: Enum `['ACTIVE', 'RECOVERED', 'CLOSED']`
- `verificationStatus`: Enum `['PENDING', 'VERIFIED', 'REJECTED']`
- `rejectionReason`: String
- `verifiedBy`: ObjectId (Ref to User)
- `securityHandover`: Boolean
- `securityOfficeLocation`: String
- `isDeleted`: Boolean (Soft deletion for audit retention)

### `Notification`
- `recipientId`: ObjectId (Ref to User)
- `type`: Enum `['MATCH_SUGGESTION', 'REPORT_VERIFIED', 'REPORT_REJECTED', 'REPORT_RECOVERED', 'CONTACT_INQUIRY', 'SYSTEM_ALERT']`
- `title`: String
- `message`: String
- `relatedItemId`: ObjectId (Ref to ItemReport)
- `relatedMatchId`: ObjectId (Ref to MatchSuggestion)
- `metadata`: `{ score, matchingReasons, counterpartItemId, ... }`
- `isRead`: Boolean

### `MatchSuggestion`
- `lostItemId`: ObjectId (Ref to ItemReport)
- `foundItemId`: ObjectId (Ref to ItemReport)
- `matchingScore`: Number (0 - 100 percentage)
- `matchingReasons`: `[String]` (Transparent breakdown)
- `notifiedUsers`: `[ObjectId]`
- `status`: Enum `['PENDING', 'ACCEPTED', 'DISMISSED']`

---

## 5. Intelligent Heuristic Matching Engine

When any student submits a **LOST** or **FOUND** report, the matching engine runs in the background:

$$\text{Matching Score} = \text{Category} (35\%) + \text{Keyword Similarity} (25\%) + \text{Location Proximity} (20\%) + \text{Date Proximity} (15\%) + \text{Color Match} (5\%)$$

1. **Category Match (+35%):** Exact match across the 11 standardized categories.
2. **Keyword Similarity (Up to +25%):** Tokenizes title, description, and markings, removes campus stop words, and measures token overlap.
3. **Location Proximity (+20%):** Matches campus zone landmarks (Library, Cafeteria, Sports Gym, Block B, etc.).
4. **Date Proximity (Up to +15%):**
   - Within 24-36 hours: +15%
   - Within 4 days: +10%
   - Within 8 days: +5%
5. **Color Match (+5%):** Normalized color tag equality.

**Threshold:** If the combined score is $\ge 45\%$:
- A `MatchSuggestion` record is created.
- In-app `Notification` documents are generated for both the lost owner and found finder.
- Real-time Socket.IO alerts (`item_match_alert`) are emitted directly to both users' private socket rooms.

---

## 6. Installation & Setup Instructions (Windows PowerShell)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended; verified on Node v24)
- npm (v9 or higher)
- Optional: Local MongoDB or MongoDB Atlas connection string. *(If MongoDB is not installed, the server automatically starts an embedded memory database!)*

### Step 1: Clone or Navigate to Project
```powershell
cd "f:\FSD-2 Project"
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```
Default configuration values in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/campus_lost_found
JWT_SECRET=campus_lost_found_super_secret_jwt_key_2026
CLIENT_URL=http://localhost:5173

ADMIN_NAME="Campus Administrator"
ADMIN_EMAIL=admin@campus.edu
ADMIN_STUDENT_ID=ADM-001
ADMIN_PASSWORD=AdminPassword@2026
```

### Step 3: Install Dependencies
Install server and client packages:
```powershell
npm --prefix server install
npm --prefix client install
```

### Step 4: Seed Database with Realistic Campus Records
Execute the automated seeder to generate demo student accounts, realistic lost & found reports, and live match suggestions:
```powershell
npm run seed
```

### Step 5: Start the Backend API Server
In PowerShell Window 1:
```powershell
npm run server
```
*The server will start at `http://localhost:5000` with live Socket.IO alerts.*

### Step 6: Start the Frontend Client
In PowerShell Window 2:
```powershell
npm run client
```
*The client dev server will launch at `http://localhost:5173`.*

---

## 7. Pre-Configured Demo Accounts

| Role | Email | Student / Staff ID | Password | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Campus Admin** | `admin@campus.edu` | `ADM-001` | `AdminPassword@2026` | Full administrative moderation access |
| **Student 1** | `alex.j@campus.edu` | `STU-2024-042` | `Student@123` | Reported lost RFID Student ID Card |
| **Student 2** | `sarah.c@campus.edu` | `STU-2024-118` | `Student@123` | Found ID Card & reported Casio Calculator |
| **Student 3** | `liam.s@campus.edu` | `STU-2023-095` | `Student@123` | Found Casio Calculator & lost AirPods Pro |

*(Note: The login page includes one-click autofill buttons for both Alex and the Campus Admin for testing convenience!)*

---

## 8. RESTful API Endpoint Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register student account (Password strength check, college email verification)
- `POST /api/auth/login` - Authenticate via email or student ID, returns JWT
- `POST /api/auth/logout` - Invalidate client session
- `GET /api/auth/me` - Retrieve current authenticated profile

### Items (`/api/items`)
- `GET /api/items` - Search and filter reports with pagination (Public)
- `GET /api/items/:id` - Item details, views increment, related matches
- `POST /api/items` - Create lost or found report with optional image upload
- `PATCH /api/items/:id` - Edit report (Owner or Admin only)
- `PATCH /api/items/:id/recover` - Mark item as recovered
- `DELETE /api/items/:id` - Soft-delete report with audit reason
- `POST /api/items/:id/suspect-match` - Manually report a suspected match
- `POST /api/items/:id/contact` - Deliver safe in-app inquiry to reporter

### Student Personal Dashboard (`/api/users`)
- `GET /api/users/me/reports` - All personal reports with status count aggregations
- `GET /api/users/me/profile` - Student profile and activity metrics
- `PATCH /api/users/me/profile` - Update profile details or change password

### Notifications (`/api/notifications`)
- `GET /api/notifications` - Retrieve alerts and unread counter
- `PATCH /api/notifications/:id/read` - Mark single notification as read
- `PATCH /api/notifications/read-all` - Mark all user notifications as read
- `DELETE /api/notifications/:id` - Dismiss notification

### Admin Moderation (`/api/admin`)
- `GET /api/admin/dashboard` - Platform statistics, counts, and recent activity
- `GET /api/admin/reports` - Comprehensive moderation table with filter queries
- `PATCH /api/admin/reports/:id/verify` - Approve authentic report with verification badge
- `PATCH /api/admin/reports/:id/reject` - Reject fraudulent or spam report with reason
- `PATCH /api/admin/reports/:id/status` - Change report status (`ACTIVE`, `RECOVERED`, `CLOSED`)
- `DELETE /api/admin/reports/:id` - Administrative removal with audit note

---

## 9. Security & Privacy Highlights

1. **Password Security:** Salted hashes generated via `bcryptjs` with 10 salt rounds; plaintext passwords are never logged or stored.
2. **Private Identity Shield:** Student ID numbers and private phone numbers are stripped from public directory views; inquiries are routed through secure in-app messaging.
3. **No Public Admin Registration:** Administrative accounts cannot be created through the public registration route; the bootstrap CLI script `node server/scripts/createAdmin.js` must be used.
4. **Brute Force Protection:** Express rate limiting applied to `/api/auth/login` and `/api/auth/register` (60 requests / 15 minutes per IP).
5. **Soft Deletion:** Records are soft-deleted with moderator user ID and reason timestamps, preventing accidental or malicious loss of historical audit records.
6. **File Validation:** Multer verifies MIME type (JPEG, PNG, WebP) and enforces a strict 5MB upload ceiling.

---

## 10. License

Developed for university campus environments. Open for educational and institution use.
