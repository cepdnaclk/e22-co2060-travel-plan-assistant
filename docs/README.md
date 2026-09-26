# Travel Plan Assistant — Documentation

[![CO2060 Systems Design](https://img.shields.io/badge/Course-CO2060%20Systems%20Design-0284c7.svg)](http://www.ce.pdn.ac.lk/)
[![Status: Active MVP](https://img.shields.io/badge/Status-Active%20MVP%20(Sprint%203)-10b981.svg)](https://github.com/cepdnaclk/e22-co2060-travel-plan-assistant)
[![Team Phoenix](https://img.shields.io/badge/Team-Phoenix-8b5cf6.svg)](https://github.com/cepdnaclk/e22-co2060-travel-plan-assistant)
[![Stack](https://img.shields.io/badge/Stack-React%2019%20%7C%20Node%20%7C%20MySQL-f59e0b.svg)](https://github.com/cepdnaclk/e22-co2060-travel-plan-assistant)
[![Dept of Computer Engineering](https://img.shields.io/badge/Dept-Computer%20Engineering%2C%20UoP-0f172a.svg)](http://www.ce.pdn.ac.lk/)

> 🌐 **Live Project Documentation Page:** [https://cepdnaclk.github.io/e22-co2060-travel-plan-assistant](https://cepdnaclk.github.io/e22-co2060-travel-plan-assistant)  
> 🔗 **GitHub Repository:** [https://github.com/cepdnaclk/e22-co2060-travel-plan-assistant](https://github.com/cepdnaclk/e22-co2060-travel-plan-assistant)

---

![Travel Plan Assistant Banner](./images/cover_page.jpg)

An automated algorithmic itinerary generation engine and smart corridor travel companion designed to solve fragmented trip planning through graph-based routing, real-world geospatial intelligence, and dynamic schedule optimization.

---

## 👥 Team Phoenix

**Department of Computer Engineering, Faculty of Engineering, University of Peradeniya**

| Registration No. | Member Name | Official Email |
| :--- | :--- | :--- |
| **E/22/061** | D.L.S.K. Dasanayaka | [e22061@eng.pdn.ac.lk](mailto:e22061@eng.pdn.ac.lk) |
| **E/22/074** | W.Y.N. Dewshan | [e22074@eng.pdn.ac.lk](mailto:e22074@eng.pdn.ac.lk) |
| **E/22/233** | T.S.P. Matharaarachchi | [e22233@eng.pdn.ac.lk](mailto:e22233@eng.pdn.ac.lk) |
| **E/22/253** | G.T. Nethmina | [e22253@eng.pdn.ac.lk](mailto:e22253@eng.pdn.ac.lk) |

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [Core Capabilities & Feature Matrix](#2-core-capabilities--feature-matrix)
3. [Solution Architecture](#3-solution-architecture)
4. [Software & Algorithmic Designs](#4-software--algorithmic-designs)
5. [Current Progress & Milestones](#5-current-progress--milestones)
6. [Verification & Testing](#6-verification--testing)
7. [Conclusion & Future Roadmap](#7-conclusion--future-roadmap)
8. [Links & References](#8-links--references)

---

## 1. Introduction

Modern leisure and business travel requires synthesizing dozens of fragmented data sources: researching reputable attractions, estimating vehicular transit times, calculating realistic visit durations, booking roadside dining and lodging, and adjusting to rigid daily schedules. For multi-destination exploration (such as touring Sri Lanka's historical, coastal, and hill-country circuits), travelers frequently suffer from **itinerary fatigue**, sub-optimal travel corridors, and unrealistic time expectations.

**Travel Plan Assistant** addresses this friction by providing an end-to-end, automated planning ecosystem. Rather than offering static point-to-point maps or uncurated listicles, the system leverages **graph-based heuristic pathfinding** to automatically generate balanced, multi-stop itineraries. Users define their origin, intended destinations, time budgets, and pacing preferences; the engine dynamically sequences the stops, calculates exact arrival and departure times, and seamlessly recommends verified hotels and restaurants precisely along the transit path.

* **Fragmented Discovery:** Replaces 4+ disparate apps with an all-in-one synchronized planner.
* **Algorithmic Optimization:** Bidirectional route search with 3 distinct pacing & transit variants.
* **Smart Corridor Amenities:** Proximity-filtered accommodations and dining without detour overhead.

---

## 2. Core Capabilities & Feature Matrix

* 🧭 **Bidirectional Route Search:** Expands simultaneous forward and backward frontiers between origin and destination nodes, discovering optimal intermediate waypoints and generating 3 distinct styles: Shortest, Balanced, and Scenic.
* ⏱️ **Dynamic Schedule Computation:** Auto-calculates transit duration, arrival times, and departure timestamps per stop while enforcing overall day-time budgets (e.g., 08:30 to 20:00) and user-customized dwell times.
* 🏨 **Corridor Stays & Dining:** Integrates verified hotels and dining options directly adjacent to the travel corridor, displaying pricing tiers, ratings, opening hours, contact details, and web links.
* ✏️ **Interactive Plan Management:** Full customization UI allowing travelers to reorder stops, modify checkpoint visit times, save itineraries to multi-trip archives, and bookmark destinations in personalized wishlists.
* 🗺️ **Geospatial Map Visualization:** Integrated interactive map visualizing route polylines, ordered stop pins, amenity badges, and interactive popups with direct navigation assistance.
* 👑 **Admin Portal & Monetization:** Role-based admin control for managing destination catalogs and reviewing user access, accompanied by subscription tiers (Free vs. Premium Voyager) with seamless checkout.

### Sri Lankan Destination Repository
Pre-loaded with verified spatial coordinates, district tags, imagery, and historical context across top travel regions:
* **Sigiriya Fortress** (`./images/destinations/sigiriya.png`)
* **Kandy & Heritage** (`./images/destinations/kandy.png`)
* **Ella Mountains** (`./images/destinations/ella.png`)
* **Galle Dutch Fort** (`./images/destinations/galle-fort.png`)
* **Nuwara Eliya** (`./images/destinations/nuwara-eliya.png`)
* **Mirissa Coastline** (`./images/destinations/mirissa.png`)

---

## 3. Solution Architecture

The system follows a decoupled, three-tier **Client-Server & Distributed Service Architecture**. High-performance RESTful JSON APIs bridge the frontend React client with the Node.js business tier, MySQL spatial database, and external routing services.

1. **Client Layer (React 19, Leaflet):** Dynamic plan generator, interactive map view, itinerary schedule editor, destination directory, wishlist, and trip sessions. Deployed on Vercel CDN.
2. **Engine & API (Node / Express):**
   * `plannerService`: Bidirectional heuristic search (Shortest, Balanced, Scenic).
   * `itineraryService`: Timeline timestamps and duration limits.
   * `hotelService` & `restaurantService`: Corridor-based amenity lookup.
   * `auth & adminController`: JWT authentication, RBAC, and approval workflows.
   * `subscriptionService`: Premium checkout and tier entitlements.
   * Hosted on DigitalOcean Ubuntu VPS with PM2 daemon.
3. **MySQL Spatial DB:** Native spatial data types (`POINT`), graph edges (`nearby_destinations`), accommodations, dining, users, and saved sessions.
4. **External Integrations:** Google Distance Matrix API, Google Places & Geocoding for live traffic and matrix fallback.

---

## 4. Software & Algorithmic Designs

### 4.1 Graph-Based Bidirectional Route Optimization

| Route Style | Algorithmic Selection Strategy | Neighbor Distance Threshold | Primary Use Case |
| :--- | :--- | :--- | :--- |
| **Shortest (Direct)** | Selects closest neighbor (rank 0) along directional vector toward destination | `distance <= 25 km` | Fastest transit, minimal fuel consumption, business travel |
| **Balanced (Average)** | Selects median-ranked candidate neighbor: `index = floor((len - 1)/2)` | `distance <= 25 km` | Balanced discovery, blending primary highways with popular towns |
| **Scenic (Longest)** | Selects farthest valid candidate neighbor: `index = len - 1` | `distance <= 25 km` | Leisure exploration, coastal/mountain scenic routes, maximum attractions |

Directional filtering (`directionalService.js`) utilizes vector angle bounds between the current candidate and destination coordinates to guarantee forward geographic momentum and avoid backtrack loops.

### 4.2 Corridor-Based Amenity Extraction
* **Separation of Concerns:** Hotels and dining spots are tagged distinctly from primary tourist attractions, preventing administrative confusion in the graph engine.
* **Rich Amenity Attributes:** Stores price levels (`$` to `$$$$`), opening hours, user ratings, photo URLs, cuisine types, phone numbers, and official websites.
* **On-Path Presentation:** Accommodations render directly below each itinerary leg with 1-click navigation.

### 4.3 Database Schema & Spatial Modeling

| Table Name | Primary Keys / Indices | Core Attributes | Purpose |
| :--- | :--- | :--- | :--- |
| `destinations` | `destinationID` (PK), Spatial (POINT) | `name`, `lat`, `lng`, `description`, `photos`, `rating`, `type` | Attraction repository across districts |
| `nearby_destinations` | Composite (`source_id`, `destination_id`) | `distance_km`, `duration_mins`, `road_condition` | Graph edges connecting nodes |
| `hotels` | `hotel_id` (PK), `destination_id` (FK) | `name`, `lat`, `lng`, `price_level`, `hotel_type`, `phone`, `website` | Accommodations along corridors |
| `restaurants` | `restaurant_id` (PK), `destination_id` (FK) | `name`, `lat`, `lng`, `cuisine_type`, `price_level`, `opening_hours` | Dining spots along routes |
| `users` | `user_id` (PK), `email` (UNIQUE) | `name`, `password` (bcrypt), `role`, `status`, `is_subscribed` | Auth, RBAC & profile settings |
| `user_travel_sessions` | `session_id` (PK), `user_id` (FK) | `travel_plan` (JSON), `milestones`, `customDurations` | Stateful persistence of plans |
| `wishlists` | `wishlist_id` (PK), UNIQUE(`user_id`, `dest_id`) | `destination_id`, `note`, `created_at` | Destination bookmarks |

---

## 5. Current Progress & Milestones

| Module / Feature | Implementation Details | Status |
| :--- | :--- | :--- |
| **Algorithmic Path Engine** | Bidirectional search supporting shortest, average, and scenic route styles | ✅ Completed |
| **Corridor Stays & Dining** | Hotel and restaurant catalog populated with geo-corridor queries | ✅ Completed |
| **Interactive Itinerary Editor** | Stop reordering, custom dwell durations, and schedule recalculation | ✅ Completed |
| **Interactive Map View** | Dynamic Leaflet map integration displaying route polylines and markers | ✅ Completed |
| **User Auth & Saved Trips** | JWT authentication, user status approval, wishlist bookmarking | ✅ Completed |
| **Admin Dashboard** | User management (approve/reject) and destination CRUD administration | ✅ Completed |
| **Premium Subscriptions** | Subscription flow, tier management, and subscriber-only features | ✅ Completed |
| **Production Deployment** | Frontend on Vercel; Backend & DB on DigitalOcean VPS | ✅ Completed |
| **Public Transit Integration** | Sri Lanka Railway schedule overlay and multi-modal transit options | ⏳ Planned (Sprint 4) |

---

## 6. Verification & Testing

* 🔬 **Algorithmic & Graph Stress Testing:** Tested bidirectional expansion against 50+ origin-destination pairs. Validated frontier termination limits (max steps = 50), isolation of forward/backward visited sets, and verified 0 disjoint sub-paths.
* 🌐 **External API Resilience & Caching:** Benchmarked Google Distance Matrix API calls with fallback mock distance matrix. Enforced defensive timeouts and caching of repeated distance pairs in `nearby_destinations` to minimize quota consumption.
* 🛡️ **Security & RBAC Validation:** Verified JWT signature expiration, bcrypt salt rounds (10), protected route guards in React Router, and strict role segregation between travelers and administrators.
* ⚡ **End-to-End Latency & Zero Cold-Start:** Hosted on dedicated Ubuntu VPS to prevent serverless cold starts. Corridor query times under 35ms; full 3-style itinerary generation under 650ms.

---

## 7. Conclusion & Future Roadmap

The **Travel Plan Assistant (MVP)** successfully validates that graph-based bidirectional pathfinding combined with real-world geospatial intelligence can eliminate the friction of multi-stop travel planning. By unifying route optimization, dynamic scheduling, interactive stop modification, and corridor-based accommodation discovery into a cohesive platform, Team Phoenix has delivered a production-ready system with immediate practical value.

**Future Enhancements:**
* Multi-Modal Transit Integration (Sri Lanka Railway schedule overlay)
* Live Weather & Monsoon Alerts with adaptive rerouting
* Collaborative Group Planning with real-time WebSockets
* AI Personalization Engine based on historical travel preferences

---

## 8. Links & References

* 🔗 [Project Repository on GitHub](https://github.com/cepdnaclk/e22-co2060-travel-plan-assistant)
* 🌐 [Live Project Documentation Page](https://cepdnaclk.github.io/e22-co2060-travel-plan-assistant)
* 🏛️ [Department of Computer Engineering, University of Peradeniya](http://www.ce.pdn.ac.lk/)
* 🎓 [Faculty of Engineering, University of Peradeniya](https://eng.pdn.ac.lk/)
