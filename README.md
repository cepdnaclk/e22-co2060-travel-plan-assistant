# 🌍 Travel Plan Assistant (Team Phoenix)

<p align="center">
  <img src="./docs/images/cover_page.jpg" alt="Travel Plan Assistant Banner" width="100%" style="border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);" />
</p>

<p align="center">
  <a href="https://github.com/cepdnaclk/e22-co2060-travel-plan-assistant"><img src="https://img.shields.io/badge/Course-CO2060_Systems_Design-0284c7.svg" alt="CO2060"></a>
  <a href="https://github.com/cepdnaclk/e22-co2060-travel-plan-assistant"><img src="https://img.shields.io/badge/Status-MVP_Complete_(Sprint_3)-10b981.svg" alt="Status"></a>
  <a href="https://github.com/cepdnaclk/e22-co2060-travel-plan-assistant"><img src="https://img.shields.io/badge/Team-Phoenix-8b5cf6.svg" alt="Team Phoenix"></a>
  <a href="https://cepdnaclk.github.io/e22-co2060-travel-plan-assistant"><img src="https://img.shields.io/badge/Docs-Project_Page-0ea5e9.svg" alt="Project Page"></a>
  <a href="http://www.ce.pdn.ac.lk/"><img src="https://img.shields.io/badge/Dept-Computer_Engineering_UoP-334155.svg" alt="UoP"></a>
</p>

Welcome to the repository for **Travel Plan Assistant**, an intelligent, algorithmic digital travel companion designed to eliminate fragmented trip planning. Developed as part of the **CO2060 Software Systems Design Project** at the Department of Computer Engineering, University of Peradeniya.

---

## 📌 About the Project

Travel planning is notoriously fragmented across disjointed mapping, booking, and review platforms. In multi-stop exploration, calculating optimal travel corridors, visit durations, and stop sequences quickly turns into an intractable manual chore.

The **Travel Plan Assistant** solves this by providing a unified, automated planning engine. Leveraging **bidirectional heuristic graph search** and real-world spatial intelligence, the application generates balanced, personalized multi-day itineraries with dynamic schedule timestamps and context-aware accommodations and dining along the travel route.

### ✨ Key Features & Current Progress (Sprint 3 Complete)

- 🧭 **Bidirectional Route Optimization:** Heuristic graph traversal computing 3 distinct route variations:
  - **Shortest (Direct):** Greedy closest-neighbor search for fast, fuel-efficient transit.
  - **Balanced (Average):** Median candidate exploration balancing transit with popular regional stops.
  - **Scenic (Longest):** Maximum attraction density across coastal and mountain passes.
- ⏰ **Dynamic Schedule Computation:** Automatic calculation of departure, travel duration, arrival timestamps, and curfew constraints (08:30 – 20:00).
- 🏨 **Corridor Accommodations & Dining:** Geo-corridor proximity queries recommending verified hotels and restaurants with price levels, ratings, cuisine types, and contact info.
- 🗺️ **Interactive Geospatial Map:** Leaflet/OpenStreetMap/Google Maps integration visualizing route polylines, ordered waypoints, and amenity markers.
- ✏️ **Interactive Itinerary Customizer:** Reorder stops, modify per-checkpoint visit durations, and dynamically recalculate schedules.
- 📚 **Rich Destination Repository:** Categorized attractions across Sri Lankan districts with photos, descriptions, ratings, and reviews.
- 👤 **User Profiles & Saved Sessions:** JWT-based authentication, wishlist destination bookmarks, and multi-trip session history.
- 🛡️ **Role-Based Admin Dashboard:** Manage destination records and approve/reject user accounts.
- 💎 **Premium Subscriptions:** Tiered access (Free Explorer vs. Premium Voyager) with seamless checkout workflows.

---

## 💻 Technology Stack & Infrastructure

| Layer | Technologies & Tools | Deployment / Hosting |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Axios, React Router v7 | **Vercel Edge Network** (Custom domain, instant CDN distribution) |
| **Backend** | Node.js, Express.js (REST API, MVC Architecture, JWT Auth, CORS) | **DigitalOcean Ubuntu VPS** (PM2 process daemon, low-latency API) |
| **Database** | MySQL (Spatial `POINT`, GIS coordinates, Relational schemas) | **DigitalOcean VPS** (Zero cold-start connection pool) |
| **External APIs** | Google Maps Distance Matrix API, Geocoding & Places APIs | HTTPS REST Integrations with caching layer |

---

## 👥 Team Phoenix Members

| Registration | Name | University Email |
| :---: | :--- | :--- |
| **E/22/061** | D.L.S.K. Dasanayaka | [e22061@eng.pdn.ac.lk](mailto:e22061@eng.pdn.ac.lk) |
| **E/22/074** | W.Y.N. Dewshan | [e22074@eng.pdn.ac.lk](mailto:e22074@eng.pdn.ac.lk) |
| **E/22/233** | T.S.P. Matharaarachchi | [e22233@eng.pdn.ac.lk](mailto:e22233@eng.pdn.ac.lk) |
| **E/22/253** | G.T. Nethmina | [e22253@eng.pdn.ac.lk](mailto:e22253@eng.pdn.ac.lk) |

---

## 🔗 Project Links

- 🌐 **Live Project Documentation Page:** [https://cepdnaclk.github.io/e22-co2060-travel-plan-assistant](https://cepdnaclk.github.io/e22-co2060-travel-plan-assistant)
- 🐙 **GitHub Repository:** [https://github.com/cepdnaclk/e22-co2060-travel-plan-assistant](https://github.com/cepdnaclk/e22-co2060-travel-plan-assistant)
- 🏛️ **Department of Computer Engineering:** [http://www.ce.pdn.ac.lk/](http://www.ce.pdn.ac.lk/)
- 🎓 **University of Peradeniya:** [https://eng.pdn.ac.lk/](https://eng.pdn.ac.lk/)
