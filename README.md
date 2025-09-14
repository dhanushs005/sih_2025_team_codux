# Smart Bus Tracking System

A **real-time bus tracking and passenger information platform** that improves public transport accessibility and reliability.  
This project consists of:  
- A **React Native mobile app** for passengers and drivers.  
- A **Progressive Web App (PWA)** built with HTML, CSS, and JavaScript.  
- A **Supabase backend** for authentication, database, and real-time updates.  
- Deployment on **Render** (backend) and **GitHub Pages** (PWA).

---

## Features

- **Live Bus Tracking** – Real-time updates powered by Supabase subscriptions.  
- **ETA Display** – Shows estimated arrival times for upcoming stops.  
- **Notifications** – Alerts for delays, route changes, or breakdowns.  
- **Route Overview** – Simple, lightweight interface to view routes.  
- **Cross-Platform App** – Runs smoothly on Android and iOS with React Native.  
- **PWA Support** – Accessible directly from a browser on any device.  
- **Fully Cloud-Hosted** – Scalable backend using Render and Supabase.  

---

## System Architecture

```text
+-------------------+       +-------------------+       +-------------------+
|  Driver App       | --->  |  Backend (Render) | --->  |  Passenger App &  |
|  (React Native)   |       |  Supabase DB      |       |  PWA (GitHub Pages)|
+-------------------+       +-------------------+       +-------------------+
          |                           |                           |
          +---------------------------+---------------------------+
                            Supabase (Realtime)

```
### DriverApp Releases: https://github.com/dhanushs005/sih_2025_team_codux/releases/tag/v1.0.0
### PassengerApp url: https://selvarajdhanush-ai.github.io/Test/
