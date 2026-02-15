---
layout: home
permalink: index.html

# Please update this with your repository name and project title
repository-name: e22-co2060-travel-plan-assistant
title: Travel Plan Assistant
---

[comment]: # "This is the standard layout for the project, but you can clean this and use your own template, and add more information required for your own project"

<!-- Once you fill the index.json file inside /docs/data, please make sure the syntax is correct. (You can use this tool to identify syntax errors)

Please include the "correct" email address of your supervisors. (You can find them from https://people.ce.pdn.ac.lk/ )

Please include an appropriate cover page image ( cover_page.jpg ) and a thumbnail image ( thumbnail.jpg ) in the same folder as the index.json (i.e., /docs/data ). The cover page image must be cropped to 940×352 and the thumbnail image must be cropped to 640×360 . Use https://croppola.com/ for cropping and https://squoosh.app/ to reduce the file size.

If your followed all the given instructions correctly, your repository will be automatically added to the department's project web site (Update daily)

A HTML template integrated with the given GitHub repository templates, based on github.com/cepdnaclk/eYY-project-theme . If you like to remove this default theme and make your own web page, you can remove the file, docs/_config.yml and create the site using HTML. -->

# Travel Plan Assistant

---

## Team
-  E/22/061, D.L.S.K. Dasanayaka, [e22061@eng.pdn.ac.lk](mailto:e22061@eng.pdn.ac.lk)
-  E/22/074, W.Y.N. Dewshan, [e22074@eng.pdn.ac.lk](mailto:e22074@eng.pdn.ac.lk)
-  E/22/233, T.S.P. Matharaarachchi, [e22233@eng.pdn.ac.lk](mailto:e22233@eng.pdn.ac.lk)
-  E/22/253, G.T. Nethmina, [e22253@eng.pdn.ac.lk](mailto:e22253@eng.pdn.ac.lk)

<!-- Image (photo/drawing of the final hardware) should be here -->

<!-- This is a sample image, to show how to add images to your page. To learn more options, please refer [this](https://projects.ce.pdn.ac.lk/docs/faq/how-to-add-an-image/) -->

<!-- ![Sample Image](./images/sample.png) -->

#### Table of Contents
1. [Introduction](#introduction)
2. [Solution Architecture](#solution-architecture )
3. [Software Designs](#hardware-and-software-designs)
4. [Testing](#testing)
5. [Conclusion](#conclusion)
6. [Links](#links)

## Introduction

Travel planning is currently fragmented across multiple platforms, making structured itinerary creation a time-consuming process. Furthermore, optimizing time, cost, and routes is challenging without a unified system for automated travel planning. The Travel Plan Assistant is a web-based solution designed to automatically generate structured, optimized itineraries based on user inputs such as destination, time, and budget. By providing a personalized and intelligent solution, this application reduces manual effort and improves overall travel planning efficiency for tourists, business travelers, and budget-conscious individuals.


## Solution Architecture

The system follows a client-server architecture. The frontend is a React-based web application that handles user interactions and provides input flexibility. This frontend communicates via JSON REST APIs to a Node.js and Express backend server, which manages the core business logic and processes requests. Data is persistently stored and retrieved using a MySQL relational database. To enable algorithmic route optimization, the backend integrates with an External Routing API (such as Google Maps) to fetch real-time distance and travel time data via HTTP requests.

## Software Designs

The database design relies heavily on Graph-Based Data Modeling to facilitate automated route optimization. In the Entity-Relationship schema, destinations are mapped as nodes, while transport routes act as the edges connecting them. An `ITINERARY_DESTINATION` mapping table resolves the many-to-many relationship between users' travel plans and selected destinations, ensuring the exact visit order is maintained for each generated plan.

## Testing

Testing focuses on verifying end-to-end functionality and handling edge cases within the multi-criteria itinerary generation process. ]Key non-functional requirements such as performance, scalability, maintainability, and security are evaluated. Special emphasis is placed on validating API reliability and data accuracy when retrieving distance and pricing metrics from external services.

## Conclusion

The MVP successfully demonstrates the feasibility of automated travel planning using graph-based algorithms and real-world routing data. By streamlining complex travel decisions and optimizing routes, the system significantly enhances the user's travel experience. This scalable foundation validates the use of APIs to reduce manual planning and will be expanded in future developments to include more flexible transport choices and advanced optimization algorithms.

## Links

- [Project Repository](https://github.com/cepdnaclk/{{ page.repository-name }}){:target="_blank"}
- [Project Page](https://cepdnaclk.github.io/{{ page.repository-name}}){:target="_blank"}
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)

[//]: # (Please refer this to learn more about Markdown syntax)
[//]: # (https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)
