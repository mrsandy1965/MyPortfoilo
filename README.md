# 🖥️ macOS Portfolio

A macOS-style interactive developer portfolio built with **React**, **Vite**, and **Tailwind CSS**, featuring a live backend powered by **Express** and **PostgreSQL** (via Prisma + Neon).

---

## ✨ Features

- macOS-style desktop UI with draggable, resizable windows
- **Finder** — browse projects in a file-folder structure
- **Safari** — view blog posts with a built-in browser UI
- **Terminal** — interactive terminal with portfolio commands
- **Photos** — gallery with favorites and tags
- **Resume** — embedded Google Drive PDF viewer
- **Contact** — social links window
- Apple-style boot loading screen
- Admin portal for content management
- Data synced from a PostgreSQL database on every load

---

## 🗂️ Project Structure

```
portfolio/
├── public/           # Static assets (icons, images)
├── prisma/           # Prisma schema and migrations
├── scripts/          # Seed scripts
├── server/           # Express API server
│   └── index.js
└── src/
    ├── components/   # Reusable UI components (Dock, Navbar, etc.)
    ├── constants/    # Default/fallback data
    ├── hoc/          # Higher-order components (WindowWrapper)
    ├── store/        # Zustand state management
    └── windows/      # Individual window components
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A PostgreSQL database (e.g., [Neon](https://neon.tech/) — free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/mrsandy1965/MyPortfoilo.git
cd MyPortfoilo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
```

> **Tip:** You can get a free PostgreSQL connection string from [Neon](https://neon.tech/).

### 4. Set up the database

Push the Prisma schema to your database and generate the client:

```bash
npx prisma db push
npx prisma generate
```

### 5. Seed the database (optional)

Populate the database with initial data:

```bash
npm run seed
```

### 6. Start the development servers

You need to run **two** servers in parallel:

```bash
# Terminal 1 — Backend API (port 3000)
npm run server

# Terminal 2 — Frontend dev server (port 5173)
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⚙️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite frontend dev server |
| `npm run server` | Start the Express API server |
| `npm run build` | Build the frontend for production |
| `npm run preview` | Preview the production build |
| `npm run seed` | Seed the database with sample data |
| `npm run lint` | Run ESLint |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Animations | GSAP |
| State Management | Zustand + Immer |
| Backend | Node.js, Express |
| ORM | Prisma |
| Database | PostgreSQL (Neon) |
| Icons | Lucide React |

---

## 📝 Customization

### Updating personal info

Edit the constants in `src/constants/index.js` to update:
- About Me description
- Social links
- Default locations / Finder structure

### Updating the resume

Replace the Google Drive link in `src/windows/Resume.jsx` with your own file's `/preview` URL:

```jsx
src="https://drive.google.com/file/d/YOUR_FILE_ID/preview"
```

### Adding projects, photos, or blog posts

Use the **Admin** window inside the app (accessible from the Dock) to add/manage content directly in the database.

---

## 🗄️ Database Models

| Model | Fields |
|---|---|
| `Project` | name, icon, description, link, githubLink, imageUrl, techStack |
| `BlogPost` | title, date, image, link, tags |
| `GalleryPhoto` | title, img, date, tags, isFavorite |
| `TechStack` | category, items |
| `SocialProfile` | text, icon, bg, link |

---

## 📄 License

MIT — feel free to use and adapt this for your own portfolio!
