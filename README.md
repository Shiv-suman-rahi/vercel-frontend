# YouTube Watch Party – Frontend

The **YouTube Watch Party** frontend is a React-based web application that provides a collaborative environment for watching YouTube videos with multiple users in a shared room. Users can create or join rooms using a unique room code or room link, while the application synchronizes video playback and room activities in real time through a Socket.IO connection with the backend server.

The frontend is built using **React, Vite, React Router, Tailwind CSS, and Socket.IO Client**. It provides a responsive user interface for creating and joining rooms, viewing participants, playing YouTube videos, and managing playback based on user roles. The application supports **Host, Moderator, and Participant** roles, with different permissions for controlling playback and managing participants.

## Key Features

* Create and join watch-party rooms
* Unique room codes and shareable room links
* Real-time YouTube playback synchronization
* Play, pause, seek, and video-change synchronization
* Host, Moderator, and Participant roles
* Participant management
* Responsive user interface
* Real-time connection with the Node.js/Socket.IO backend
* Production deployment on Vercel

## Tech Stack

* **React**
* **Vite**
* **React Router**
* **Tailwind CSS**
* **Socket.IO Client**
* **JavaScript**
* **Vercel**

## Backend

The frontend communicates with a separately deployed **Node.js, Express, Socket.IO, and MongoDB backend** for room management, real-time communication, permissions, and persistent data.

## Live Project

**Live Demo:** https://vercel-frontend-lkjj.vercel.app/

## Related Repository

**Backend Repository:** https://github.com/Shiv-suman-rahi/render-backend

## Author

**Shiv Suman Rahi**
B.Tech – Computer Science (Data Science)
