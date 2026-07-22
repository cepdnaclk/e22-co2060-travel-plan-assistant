# CO2060 Software Systems Design Project — Progress Report

# Travel Plan Assistant

---

**Group Number:** Team Phoenix

**Project Title:** Travel Plan Assistant

**Department of Computer Engineering**
**University of Peradeniya**

**Date:** July 2026

---

## Student Details

| Name | Registration No. | Email |
|------|-------------------|-------|
| D.L.S.K. Dasanayaka | E/22/061 | e22061@eng.pdn.ac.lk |
| W.Y.N. Dewshan | E/22/074 | e22074@eng.pdn.ac.lk |
| T.S.P. Matharaarachchi | E/22/233 | e22233@eng.pdn.ac.lk |
| G.T. Nethmina | E/22/253 | e22253@eng.pdn.ac.lk |

---

## Declaration

We, the undersigned, hereby declare that this project progress report titled **"Travel Plan Assistant"** submitted as part of the CO2060 Software Systems Design Project is a record of original work done by us under the supervision of the assigned supervisor.

The information and data given in this report are authentic to the best of our knowledge. This work has not been previously submitted for any other course or academic purpose.

| Name | Signature | Date |
|------|-----------|------|
| D.L.S.K. Dasanayaka | ______________ | ______________ |
| W.Y.N. Dewshan | ______________ | ______________ |
| T.S.P. Matharaarachchi | ______________ | ______________ |
| G.T. Nethmina | ______________ | ______________ |

---

## Table of Contents

- [Chapter 1: Introduction](#chapter-1-introduction)
  - [1.1 Project Title](#11-project-title)
  - [1.2 Project Description](#12-project-description)
  - [1.3 Background and Motivation](#13-background-and-motivation)
  - [1.4 Problem in Brief](#14-problem-in-brief)
  - [1.5 Proposed Solution](#15-proposed-solution)
  - [1.6 Project Aim and Objectives](#16-project-aim-and-objectives)
  - [1.7 Significance of the Study](#17-significance-of-the-study)
- [Chapter 2: Methodology](#chapter-2-methodology)
  - [2.1 Introduction](#21-introduction)
  - [2.2 Requirements Identification](#22-requirements-identification)
  - [2.3 System Analysis and Design](#23-system-analysis-and-design)
- [Chapter 3: System Implementation and Progress](#chapter-3-system-implementation-and-progress)
  - [3.1 Introduction](#31-introduction)
  - [3.2 Current Implementation Status](#32-current-implementation-status)
  - [3.3 Functional Milestones Achieved](#33-functional-milestones-achieved)
  - [3.4 Technical Challenges and Deviations](#34-technical-challenges-and-deviations)
- [Chapter 4: Project Plan](#chapter-4-project-plan)
  - [4.1 Project Plan (Gantt Chart)](#41-project-plan-gantt-chart)
  - [4.2 Individual Contribution](#42-individual-contribution)
  - [4.3 Future Work](#43-future-work)
- [References](#references)
- [Appendices](#appendices)

---

## List of Figures

| Figure No. | Description | Page/Section |
|------------|-------------|--------------|
| Figure 2.1 | Use Case Diagram | [Section 2.3](#23-system-analysis-and-design) |
| Figure 2.2 | ER Diagram | [Section 2.3](#23-system-analysis-and-design) |
| Figure 2.3 | System Architecture Diagram | [Section 2.3](#23-system-analysis-and-design) |
| Figure 4.1 | Gantt Chart | [Section 4.1](#41-project-plan-gantt-chart) |

## List of Tables

| Table No. | Description | Page/Section |
|-----------|-------------|--------------|
| Table 2.1 | Functional Requirements | [Section 2.2](#22-requirements-identification) |
| Table 2.2 | Non-Functional Requirements | [Section 2.2](#22-requirements-identification) |
| Table 2.3 | User Roles | [Section 2.2](#22-requirements-identification) |
| Table 2.4 | System Requirements | [Section 2.2](#22-requirements-identification) |
| Table 3.1 | Functional Milestones Status | [Section 3.3](#33-functional-milestones-achieved) |
| Table 4.1 | Individual Contribution | [Section 4.2](#42-individual-contribution) |

---

## Chapter 1: Introduction

### 1.1 Project Title

**Travel Plan Assistant**

### 1.2 Project Description

The Travel Plan Assistant is an all-in-one digital companion designed to streamline trip planning within Sri Lanka. The system provides a unified, automated platform that generates structured and optimized travel itineraries based on user inputs such as destination preferences, travel dates, and budget constraints.

The application follows a client-server architecture with a React.js frontend and a Node.js/Express.js backend, connected to a MySQL database. It integrates with external routing APIs (Google Maps Directions API) for real-world time and distance metrics, enabling the system to produce practical and route-optimized travel plans.

### 1.3 Background and Motivation

Travel planning has traditionally been a fragmented process. Travelers must visit multiple websites and applications to research destinations, compare distances, estimate budgets, and assemble coherent itineraries [1]. This disconnected workflow leads to inefficient planning, missed opportunities, and suboptimal travel routes.

The rise of web-based travel platforms has partially addressed this issue; however, most existing solutions focus on booking accommodations or flights rather than providing end-to-end itinerary generation [2]. Systems such as TripAdvisor and Google Travel offer destination reviews and basic trip organization, but they lack automated itinerary optimization based on geographic proximity, travel time, and user-defined constraints [3].

Graph-based data modeling has demonstrated significant potential in solving route optimization problems. Techniques such as the Travelling Salesman Problem (TSP) and shortest-path algorithms can be applied to travel itinerary generation to minimize travel time while maximizing destination coverage [4]. This computational approach motivates the development of a system that combines user preferences with algorithmic route optimization.

The motivation for this project stems from the team's firsthand experience with the challenges of planning multi-destination trips in Sri Lanka, where scattered information across platforms and the lack of optimized route suggestions create unnecessary complexity.

### 1.4 Problem in Brief

The existing travel planning ecosystem suffers from the following key problems:

1. **Fragmented Information:** Travelers must use multiple disconnected platforms to gather destination information, check distances, and plan routes.
2. **Lack of Route Optimization:** Current platforms do not offer algorithmically optimized itineraries that consider geographic proximity and travel time between destinations.
3. **No Personalized Itinerary Generation:** Existing tools rarely generate complete, day-by-day itineraries tailored to user-specified constraints such as budget, trip duration, and preferred locations.
4. **Manual Effort:** Users must manually organize destinations, estimate travel times, and create itineraries — a time-consuming and error-prone process.

### 1.5 Proposed Solution

The Travel Plan Assistant addresses these problems by providing a unified web-based platform that:

- Allows users to specify their travel preferences including starting location, end location, must-visit places, travel dates, and budget.
- Automatically generates structured, day-by-day itineraries optimized for route efficiency using the Google Maps Directions API.
- Provides a destination catalog with detailed information, ratings, and images for places across Sri Lanka.
- Offers trip management features including saving trips, viewing past itineraries, and managing a wishlist of destinations.
- Includes an admin dashboard for destination management and user oversight.
- Implements budget tracking and estimation for planned trips.

### 1.6 Project Aim and Objectives

**Aim:** To design and develop a web-based travel planning system that automates itinerary generation and optimizes travel routes for trips within Sri Lanka.

**Objectives:**

1. To develop a backend system for destination management with CRUD operations.
2. To implement automated travel itinerary generation based on user-defined inputs (locations, dates, budget).
3. To integrate with the Google Maps Directions API for accurate time and distance metrics between destinations.
4. To build an interactive and responsive frontend interface for trip planning and management.
5. To implement user authentication and role-based access control (regular users and admin).
6. To provide multi-criteria travel plan filtering and destination discovery features.
7. To deploy the system with a scalable client-server architecture.

### 1.7 Significance of the Study

The Travel Plan Assistant distinguishes itself from existing systems in several key ways:

| Feature | Google Travel | TripAdvisor | Travel Plan Assistant |
|---------|--------------|-------------|----------------------|
| Destination Catalog | ✅ | ✅ | ✅ |
| Route Optimization | ❌ | ❌ | ✅ |
| Auto Itinerary Generation | ❌ | ❌ | ✅ |
| Budget Tracking | ❌ | ❌ | ✅ |
| Sri Lanka Focused | ❌ | Partial | ✅ |
| Day-by-Day Planning | ❌ | ❌ | ✅ |

The system's primary significance lies in its ability to combine destination discovery with automated, route-optimized itinerary generation — a capability not offered by mainstream travel platforms. By focusing specifically on Sri Lanka, the system provides localized, accurate data that global platforms cannot match.

---

## Chapter 2: Methodology

### 2.1 Introduction

The project follows an **Agile Development Methodology** with iterative sprints. The software development life cycle includes the following phases:

1. **Requirements Gathering:** Initial requirements were gathered through team brainstorming sessions, analysis of existing travel platforms, and identification of gaps in current solutions.
2. **System Design:** UML diagrams (Use Case, ER, Class diagrams) were created to model the system architecture and data relationships.
3. **Iterative Development:** The system is being developed in sprints, with each sprint delivering functional increments across the frontend and backend layers.
4. **Testing:** Unit testing and integration testing are conducted at each milestone to verify correct behavior.
5. **Deployment:** The frontend is deployed via Vercel with a custom domain, and the backend is hosted on a DigitalOcean Ubuntu VPS.

### 2.2 Requirements Identification

#### a. Functional Requirements

| Req. ID | Requirement | Description |
|---------|-------------|-------------|
| FR-01 | User Registration & Login | Users can register, log in, and manage their accounts with JWT-based authentication |
| FR-02 | Destination Browsing | Users can browse, search, and filter destinations across Sri Lanka |
| FR-03 | Destination Details | Users can view detailed information about each destination (description, images, ratings, location) |
| FR-04 | Trip Planning | Users can create trips by specifying starting/ending locations, must-visit places, dates, and budget |
| FR-05 | Itinerary Generation | The system auto-generates day-by-day itineraries with route-optimized ordering |
| FR-06 | Google Maps Integration | Real-time directions, distance, and travel time calculated via Google Maps API |
| FR-07 | Trip Management | Users can view, save, and manage their created trips |
| FR-08 | Wishlist | Users can save destinations to a personal wishlist for future reference |
| FR-09 | Budget Tracking | Users can set and track budget allocations for their trips |
| FR-10 | Admin Dashboard | Admin users can manage destinations, view user statistics, and oversee system content |
| FR-11 | User Profile Management | Users can view and update their profile information |

#### b. Non-Functional Requirements

| Req. ID | Requirement | Description |
|---------|-------------|-------------|
| NFR-01 | Performance | Pages should load within 3 seconds under normal network conditions |
| NFR-02 | Security | Passwords are hashed with bcrypt; API routes protected via JWT middleware |
| NFR-03 | Responsiveness | The UI should be responsive across desktop and mobile devices |
| NFR-04 | Scalability | The architecture should support future scaling of destinations and users |
| NFR-05 | Usability | The interface should be intuitive, requiring minimal learning curve |
| NFR-06 | Availability | The deployed system should maintain 99% uptime |

#### c. User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| Guest | Unauthenticated visitor | Browse destinations, view homepage |
| Registered User | Authenticated user | All guest permissions + trip planning, itinerary generation, wishlist, profile management |
| Admin | System administrator | All user permissions + destination CRUD, user management, admin dashboard access |

#### d. System Requirements

**Hardware Requirements:**

| Component | Specification | Justification |
|-----------|--------------|---------------|
| Server (VPS) | DigitalOcean Droplet (Ubuntu) | Hosts backend API and MySQL database with zero cold-start |
| Client Device | Modern web browser (Chrome, Firefox, Safari) | Accesses the React.js frontend application |

**Software Requirements:**

| Technology | Version | Justification |
|------------|---------|---------------|
| Node.js | Latest LTS | Server-side JavaScript runtime for Express.js backend |
| Express.js | v5.x | Lightweight, flexible web framework for building RESTful APIs |
| React.js | v19.x | Component-based UI library for building interactive, responsive frontends |
| TypeScript | v5.9 | Type safety and improved developer experience for the frontend codebase |
| Vite | v7.x | Fast build tool and dev server for the React frontend |
| MySQL | v8.x | Relational database for structured data storage (destinations, users, trips) |
| TailwindCSS | v4.x | Utility-first CSS framework for rapid, consistent UI styling |
| Google Maps API | Directions API | Provides real-time routing, distance, and travel time data |
| JWT (jsonwebtoken) | v9.x | Stateless token-based authentication for API security |
| bcryptjs | v3.x | Password hashing for secure credential storage |
| Axios | Latest | HTTP client for API communication between frontend and backend |
| Vercel | Cloud Platform | Frontend deployment with CI/CD and custom domain support |

### 2.3 System Analysis and Design

#### Use Case Diagram

*(Insert Use Case Diagram here)*

The system supports three primary actors: **Guest**, **Registered User**, and **Admin**. Key use cases include:

- **Guest:** View homepage, browse destinations, view destination details, register/login.
- **Registered User:** Plan trips, generate itineraries, manage trips, manage wishlist, view budget, manage profile.
- **Admin:** Manage destinations (add/edit/delete), view admin dashboard, manage users.

#### ER Diagram

*(Insert ER Diagram here)*

Primary entities and relationships:

- **Users** — stores user credentials and profile information.
- **Destinations** — stores destination details (name, description, coordinates, district, images, ratings).
- **Trips** — stores user-created trips with date ranges and budget.
- **Trip_Destinations** — junction table linking trips to their selected destinations.
- **Itineraries** — stores generated itineraries with day-wise destination ordering.
- **Wishlists** — stores user-destination wishlist mappings.
- **Districts** — stores district information for destination categorization.

#### System Architecture Diagram

*(Insert System Architecture Diagram here)*

```
┌─────────────────────┐       HTTPS/REST       ┌──────────────────────┐
│                     │ ◄────────────────────► │                      │
│   React.js Frontend │                        │  Express.js Backend  │
│   (Vite + TS)       │                        │  (Node.js)           │
│   Deployed: Vercel  │                        │  Deployed: VPS       │
│                     │                        │                      │
└─────────────────────┘                        └──────────┬───────────┘
                                                          │
                                                          │ mysql2
                                                          ▼
                                               ┌──────────────────────┐
                                               │   MySQL Database     │
                                               │   (DigitalOcean VPS) │
                                               └──────────────────────┘
                                                          │
                                               ┌──────────┴──────────┐
                                               │  Google Maps API    │
                                               │  (Directions)       │
                                               └─────────────────────┘
```

---

## Chapter 3: System Implementation and Progress

### 3.1 Introduction

This section provides a comprehensive overview of the current developmental state of the Travel Plan Assistant project. It highlights the modules, features, and system architectures that have been successfully realized up to this reporting milestone, establishing a baseline for the remaining timeline.

### 3.2 Current Implementation Status

The development phase has progressed across multiple layers of the software architecture. The specific technical milestones achieved during this reporting period are outlined below:

#### 3.2.1 Database Realization

The relational schema and database structures have been successfully deployed using MySQL. The database initialization script (`config/initDb.js`) automatically creates the required tables on server startup:

- **Users table** — stores user credentials (hashed passwords via bcryptjs), email, and profile data.
- **Destinations table** — stores destination information including name, description, latitude/longitude coordinates, district, image URLs, and ratings.
- **Districts table** — stores Sri Lankan district data for destination categorization.
- **Trips table** — stores user-created trip data with date ranges and budget information.
- **Itineraries table** — stores generated itinerary data linking trips to ordered destination sequences.

Primary tables, foreign key constraints, and connection pooling (via `mysql2/promise`) have been configured to support backend operations efficiently.

#### 3.2.2 Backend and Core Logic

The server-side logic, API endpoints, and core components have been implemented using Express.js v5. The following modules are operational:

- **Authentication System** (`authController.js`, `authRoutes.js`):
  - User registration with bcrypt password hashing.
  - JWT-based login with token generation and verification.
  - Auth middleware (`authMiddleware.js`) protecting private API routes.

- **Destination Management** (`destinationController.js`, `destinationRoutes.js`):
  - CRUD operations for destinations.
  - Destination listing with filtering capabilities.

- **Trip Management** (`tripController.js`, `tripRoutes.js`):
  - Trip creation with associated destinations, dates, and budget.
  - Trip retrieval and management for authenticated users.

- **Itinerary Generation** (`itineraryController.js`, `itineraryRoutes.js`):
  - Itinerary creation linked to trips and ordered destination sequences.

- **Directions API Integration** (inline route in `server.js`):
  - Proxies requests to the Google Maps Directions API.
  - Accepts an array of destination coordinates and returns optimized routing data (polylines, distances, durations).

- **Admin Management** (`adminController.js`, `adminRoutes.js`):
  - Admin-specific endpoints for destination management and user oversight.

- **District Management** (`districtController.js`):
  - District data retrieval for destination categorization.

#### 3.2.3 Frontend and User Interface

The primary graphical user interfaces and layout frameworks have been constructed using React.js v19 with TypeScript and Vite. The following pages and components are functional:

**Pages:**
- **Home Page** (`home.tsx`) — Hero section with mountain landscape background, destination highlights, and call-to-action elements.
- **Dashboard** (`dashboard.tsx`) — User dashboard with greeting, trending destinations, and trip overview.
- **Destinations** (`destinations.tsx`) — Browsable destination catalog with search and filtering.
- **Destination Details** (`destination-details.tsx`) — Detailed destination view with images, descriptions, ratings, and location map.
- **My Trips** (`my-trips.tsx`) — List of user-created trips with management options.
- **Itinerary** (`itinerary.tsx`) — Day-by-day itinerary view with timeline visualization.
- **Budget** (`budget.tsx`) — Budget tracking and allocation interface.
- **Wishlist** (`wishlist.tsx`) — Saved destinations for future trip planning.
- **My Profile** (`my-profile.tsx`) — User profile viewing and editing.
- **Admin Dashboard** (`admin-dashboard.tsx`) — Admin panel for destination and user management.

**Key Components:**
- **Login Modal** (`LoginModal.tsx`) — Authentication dialog with login/register forms.
- **Sri Lanka Map** (`SriLankaMap.tsx`) — Interactive map component for destination visualization.
- **Directions Map** (`DirectionsMap.tsx`) — Google Maps integration for route display.
- **Itinerary Timeline** (`ItineraryTimeline.tsx`) — Visual timeline component for day-by-day itinerary display.
- **Image Viewer** (`ImageViewer.tsx`) — Gallery component for destination images.
- **Protected Route / Admin Route** — Route guard components for authentication and authorization.

**UI Features:**
- Scroll-responsive transparent navbar that transitions to solid on scroll.
- Smooth page transitions and micro-animations.
- Responsive design using TailwindCSS v4.
- Date range picker for trip date selection.
- Radix UI components for dropdowns, dialogs, sliders, and popovers.

*(Refer to Appendix C for corresponding user interface screenshots.)*

### 3.3 Functional Milestones Achieved

To measure progress against the initial requirements identified in Chapter 2, a systematic evaluation of completed functional components has been conducted. The current status of each primary system requirement is summarized below:

| Req. ID | Requirement | Status |
|---------|-------------|--------|
| FR-01 | User Registration & Login | ✅ Fully Implemented |
| FR-02 | Destination Browsing | ✅ Fully Implemented |
| FR-03 | Destination Details | ✅ Fully Implemented |
| FR-04 | Trip Planning | ✅ Fully Implemented |
| FR-05 | Itinerary Generation | 🔶 Partially Implemented |
| FR-06 | Google Maps Integration | ✅ Fully Implemented |
| FR-07 | Trip Management | ✅ Fully Implemented |
| FR-08 | Wishlist | ✅ Fully Implemented |
| FR-09 | Budget Tracking | 🔶 Partially Implemented |
| FR-10 | Admin Dashboard | ✅ Fully Implemented |
| FR-11 | User Profile Management | ✅ Fully Implemented |

### 3.4 Technical Challenges and Deviations

During the development cycles, several unforeseen technical challenges were encountered:

1. **Google Maps API Rate Limiting:** During testing, the Google Maps Directions API enforced rate limits that required implementing request throttling and caching strategies on the backend proxy endpoint.

2. **Date Range Picker Component:** The initial third-party date picker component did not meet the design requirements. A custom two-month side-by-side date range calendar was developed from scratch with visual range highlighting.

3. **Responsive Navbar Behavior:** Implementing a navbar that remains transparent at the top of the page and transitions to a solid background on scroll required custom scroll event listeners and CSS transition management across multiple page layouts.

4. **MySQL Connection Pooling:** Initial database connections experienced timeout issues under concurrent requests. Migrating to `mysql2/promise` with connection pooling resolved stability issues.

5. **Frontend State Management:** Managing authentication state, trip data, and UI state across deeply nested components required implementing React Context providers for centralized state management.

To mitigate these obstacles without compromising the core project scope, specific adaptations were made to the development workflow, including adjusting sprint timelines and reallocating development tasks among team members.

---

## Chapter 4: Project Plan

### 4.1 Project Plan (Gantt Chart)

*(Insert Gantt Chart here — create using a tool such as GanttProject, Microsoft Project, or draw.io)*

| Phase | Start Date | End Date | Duration |
|-------|-----------|----------|----------|
| Requirements Gathering | Week 1 | Week 2 | 2 weeks |
| System Design (UML, ER, Architecture) | Week 2 | Week 3 | 2 weeks |
| Database Design & Implementation | Week 3 | Week 4 | 2 weeks |
| Backend API Development | Week 4 | Week 8 | 5 weeks |
| Frontend UI Development | Week 5 | Week 10 | 6 weeks |
| Google Maps API Integration | Week 7 | Week 9 | 3 weeks |
| Itinerary Algorithm Development | Week 8 | Week 11 | 4 weeks |
| Testing & Bug Fixes | Week 9 | Week 12 | 4 weeks |
| Deployment & Documentation | Week 11 | Week 13 | 3 weeks |
| Final Presentation & Report | Week 13 | Week 14 | 2 weeks |

### 4.2 Individual Contribution

| Team Member | Primary Responsibilities |
|-------------|------------------------|
| D.L.S.K. Dasanayaka (E/22/061) | Backend API development, database design, authentication system, admin functionality |
| W.Y.N. Dewshan (E/22/074) | Frontend UI development, component design, responsive layouts, state management |
| T.S.P. Matharaarachchi (E/22/233) | Google Maps API integration, route optimization, itinerary generation algorithm, deployment |
| G.T. Nethmina (E/22/253) | Trip management module, wishlist feature, budget tracking, testing & QA |

### 4.3 Future Work

The following functionalities are planned for completion in upcoming sprints:

| Team Member | Pending Tasks |
|-------------|--------------|
| D.L.S.K. Dasanayaka | Enhance admin analytics dashboard, implement destination recommendation engine, API rate limiting |
| W.Y.N. Dewshan | Implement advanced filtering/sorting on destinations, enhance mobile responsiveness, add loading skeletons |
| T.S.P. Matharaarachchi | Optimize itinerary generation algorithm with multi-day route balancing, implement itinerary export (PDF), improve map interactions |
| G.T. Nethmina | Complete budget estimation with per-destination cost breakdowns, implement trip sharing feature, end-to-end testing |

---

## References

[1] Werthner, H. and Ricci, F. 2004. E-commerce and tourism. *Communications of the ACM* 47, 12 (Dec. 2004), 101–105. DOI: https://doi.org/10.1145/1035134.1035141

[2] Gavalas, D., Konstantopoulos, C., Mastakas, K., and Pantziou, G. 2014. A survey on algorithmic approaches for solving tourist trip design problems. *Journal of Heuristics* 20, 3 (June 2014), 291–328. DOI: https://doi.org/10.1007/s10732-014-9242-5

[3] Vansteenwegen, P., Souffriau, W., and Van Oudheusden, D. 2011. The orienteering problem: A survey. *European Journal of Operational Research* 209, 1 (Feb. 2011), 1–10. DOI: https://doi.org/10.1016/j.ejor.2010.03.045

[4] Applegate, D.L., Bixby, R.E., Chvátal, V., and Cook, W.J. 2006. *The Traveling Salesman Problem: A Computational Study*. Princeton University Press, Princeton, NJ.

---

## Appendices

### Appendix A — Sample References and Citation Style

Inside the body of the text, references are cited using square brackets (e.g., [1], [2,3], [3-8]). The reference list follows the ACM reference style and is arranged in cited order.

**ACM Reference Style:** https://www.acm.org/publications/authors/reference-formatting

### Appendix B — Declaration

*(See Declaration section on page ii)*

### Appendix C — User Interface Screenshots

*(Insert screenshots of the following interfaces:)*

1. **Home Page** — Hero section with mountain landscape and call-to-action
2. **Dashboard** — User greeting, trending destinations, and trip overview
3. **Destinations Page** — Browsable destination catalog with search
4. **Destination Details** — Detailed view with images, map, and ratings
5. **Trip Planning** — Trip creation form with date picker and location inputs
6. **Itinerary View** — Generated day-by-day itinerary with timeline
7. **Budget Tracker** — Budget allocation and tracking interface
8. **Wishlist** — Saved destinations list
9. **Admin Dashboard** — Destination management and user statistics
10. **Login/Register Modal** — Authentication forms

### Appendix D — API Endpoint Documentation

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and receive JWT token |
| GET | `/api/destinations` | No | Get all destinations |
| GET | `/api/destinations/:id` | No | Get destination by ID |
| POST | `/api/trips` | Yes | Create a new trip |
| GET | `/api/trips` | Yes | Get user's trips |
| POST | `/api/itinerary` | Yes | Generate itinerary for a trip |
| POST | `/api/directions` | Yes | Get route directions via Google Maps |
| GET | `/api/admin/*` | Yes (Admin) | Admin management endpoints |

### Appendix E — Project Repository and Links

- **Repository:** https://github.com/cepdnaclk/e22-co2060-travel-plan-assistant
- **Project Page:** https://cepdnaclk.github.io/e22-co2060-travel-plan-assistant
- **Department:** http://www.ce.pdn.ac.lk/
- **University:** https://eng.pdn.ac.lk/
