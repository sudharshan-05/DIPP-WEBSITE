# 🔬 D.I.P.P — Digital Image Processing and Programming Club

A premium, feature-rich club website built from scratch with modern web technologies, role-based authentication, and dynamic event management.

![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

---

## ✨ Features & Achievements

### 🎨 Premium UI/UX
- Dark-themed glassmorphism design with neon accent gradients
- Smooth micro-animations, hover effects, and page transitions
- Fully responsive layout (desktop, tablet, mobile)
- Typewriter hero effect with rotating keywords
- Stat counters with eased animation on scroll reveal
- Team member cards with hover-expand portraits
- macOS-style dock magnification on project cards

### 🔐 Role-Based Authentication System
- **4 Admin Roles**: President, Vice President, Lead, Member (core members)
- **Student Role**: Standard access for general users
- Admin-only UI elements (add/edit/delete events, manage gallery)
- President-only features (album management)
- Persistent login via `localStorage`

### 📋 Dynamic Event Management
- **Featured Event Banner** with admin-controlled selection (⭐ Change Featured)
- **Add New Events** — core members can create upcoming or conducted events with image upload
- **Delete Events** — persistent deletion that survives page reloads
- **Event Detail Modal** — full event info with countdown, registration, and reminders
- **Event Filters** — filter by category (Workshop, Competition, Hackathon, Seminar)
- **Date Sorting** — sort events by soonest or latest
- **Auto-Promote** — expired upcoming events automatically move to conducted
- **Google Form Autofill** — pre-fills registration forms with logged-in user data

### 🔔 Reminder System
- Set reminders for upcoming events
- Bell icon with badge count in navbar
- Reminder panel dropdown with countdown timers
- Urgent reminder highlighting

### 🖼 Gallery & Albums
- Photo gallery with album organization
- Drag-and-drop image upload
- Admin album management (president-only)
- Image deletion with hover controls

### 💾 Data Persistence (localStorage)
- All dynamically added events persist across page reloads
- Deleted events stay deleted (tracked in `dipp_deleted_events`)
- Featured event selection persists (`dipp_featured_event`)
- Custom events stored in `dipp_custom_events_v2`
- User login session persists
- Event registrations tracked per-user

### 🏆 Achievements Roadmap
- VOOI-style roadmap with wavy SVG path
- Glowing milestone nodes with glassmorphism cards
- Animated star particles background

### 📱 Mobile Experience
- Slide-out mobile navigation drawer
- Touch-friendly team card expand
- Responsive grids and typography

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)

### Installation

```bash
# Clone the repo
git clone https://github.com/sudharshan-05/dipp-website.git
cd dipp-website

# Install dependencies
npm install

# Start dev server
npm run dev
```

The site will be running at `http://localhost:5173/`

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| President | president@dipp.club | president123 |
| Vice President | vp@dipp.club | vp123 |
| Lead | lead@dipp.club | lead123 |
| Member | member@dipp.club | member123 |
| Student | student@dipp.club | student123 |

---

## 📁 Project Structure

```
dipp-website/
├── index.html          # Main website (all sections)
├── login.html          # Login page
├── vite.config.js      # Vite configuration
├── package.json        # Dependencies
├── public/
│   ├── logo.png        # Club logo
│   └── vite.svg        # Vite icon
└── src/
    ├── main.js         # Core logic, events, modals, featured picker
    ├── auth.js         # Role-based authentication system
    ├── style.css       # All styles (glassmorphism, animations, responsive)
    ├── reminders.js    # Event reminder system
    ├── transitions.js  # Page transition effects
    ├── cursor.js       # Cursor glow effect
    └── login.js        # Login page logic
```

---

## 🛠 Tech Stack

- **Build Tool**: Vite
- **Frontend**: Vanilla HTML, CSS, JavaScript (ES Modules)
- **Styling**: Custom CSS with glassmorphism, gradients, animations
- **Typography**: Inter (Google Fonts)
- **Storage**: localStorage for persistence
- **Images**: Unsplash (placeholder images)

---

## 👥 Team

Built by the D.I.P.P Club team — Digital Image Processing and Programming Club.

---

## 📄 License

This project is open source and available for educational purposes.
