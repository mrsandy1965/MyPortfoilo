# 🖥️ macOS Portfolio

A macOS-style interactive developer portfolio built with **React 19**, **Vite**, and **Tailwind CSS v4**, with a live backend powered by **Express** and **PostgreSQL** (via Prisma + Neon).

> Live demo: _coming soon_

---

## ✨ Features

- 🖱️ macOS-style desktop with draggable, resizable windows
- 📁 **Finder** — browse projects in a file-folder structure
- 🌐 **Safari** — view blog posts with a built-in browser UI
- 💻 **Terminal** — interactive terminal with custom portfolio commands
- 🖼️ **Photos** — gallery with favorites and tag filtering
- 📄 **Resume** — embedded Google Drive PDF viewer
- 📬 **Contact** — social links window
- 🍎 Apple-style animated boot / loading screen
- 🔐 **Admin** portal for full content management (projects, blog, gallery, socials)
- ☁️ **Cloudinary** integration for seamless image uploads in the Admin portal
- ⚡ All data is live-synced from PostgreSQL on every load

---

## 🗂️ Project Structure

```
portfolio/
├── public/            # Static assets (app icons, images)
├── prisma/            # Prisma schema & migrations
│   └── schema.prisma
├── scripts/           # Database seed scripts
│   └── seed.cjs
├── server/            # Express REST API
│   └── index.js
└── src/
    ├── App.jsx        # Root app component
    ├── main.jsx       # Entry point
    ├── index.css      # Global styles
    ├── components/    # Reusable UI (Dock, Navbar, BootScreen, etc.)
    ├── constants/     # Default / fallback data
    ├── hoc/           # Higher-order components (WindowWrapper)
    ├── store/         # Zustand state management
    └── windows/       # Individual window apps
        ├── Admin.jsx
        ├── Contact.jsx
        ├── Finder.jsx
        ├── Photos.jsx
        ├── Resume.jsx
        ├── Safari.jsx
        └── Terminal.jsx
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **v18+**
- A PostgreSQL database — [Neon](https://neon.tech/) offers a free tier

---

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

Create a `.env` file in the **root** of the project:

```env
# PostgreSQL connection string (required)
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"

# Admin secret for authentication (required for Admin portal)
ADMIN_SECRET="your_secure_admin_token"

# Cloudinary credentials (required for image uploads)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Frontend URL (optional - for CORS in production)
FRONTEND_URL="https://your-portfolio.vercel.app"

# Server Port (optional - defaults to 3000)
PORT=3000
```

> **Tip:** Get a free connection string from [Neon](https://neon.tech/). Copy the **Prisma** connection string from your project dashboard.

### 4. Push the database schema

```bash
npx prisma db push
npx prisma generate
```

### 5. Seed the database _(optional)_

Populate with sample projects, blog posts, and gallery photos:

```bash
npm run seed
```

### 6. Start the development servers

Two servers need to run in parallel:

```bash
# Terminal 1 — Express API (http://localhost:3000)
npm run server

# Terminal 2 — Vite frontend (http://localhost:5173)
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
| `npm run preview` | Preview the production build locally |
| `npm run seed` | Seed the database with sample data |
| `npm run lint` | Run ESLint |

---

## 🌐 API Endpoints

All endpoints are served from `http://localhost:3000`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Check server health status |
| `GET` | `/api/about` | Fetch about me details |
| `GET` | `/api/projects` | Fetch all projects |
| `GET` | `/api/blog-posts` | Fetch all blog posts (latest first) |
| `GET` | `/api/gallery` | Fetch all gallery photos |
| `GET` | `/api/tech-stack` | Fetch tech stack categories |
| `GET` | `/api/socials` | Fetch social profile links |
| `POST` | `/api/admin/verify` | Verify admin authentication token |
| `POST` | `/api/upload` | Upload image to Cloudinary |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 7, Tailwind CSS v4 |
| **Animations** | GSAP 3 + `@gsap/react` |
| **State Management** | Zustand 5 + Immer |
| **Backend** | Node.js, Express 5, Multer |
| **ORM** | Prisma 5 |
| **Database** | PostgreSQL (hosted on Neon) |
| **Cloud Storage** | Cloudinary |
| **Icons** | Lucide React |
| **Utilities** | clsx, dayjs, react-tooltip |

---

## 🗄️ Database Models

| Model | Key Fields |
|---|---|
| `Project` | `name`, `icon`, `description[]`, `link`, `githubLink`, `imageUrl`, `techStack[]` |
| `BlogPost` | `title`, `date`, `image`, `link`, `tags[]` |
| `GalleryPhoto` | `title`, `img`, `date`, `tags[]`, `isFavorite` |
| `TechStack` | `category` _(unique)_, `items[]` |
| `SocialProfile` | `text`, `icon`, `bg`, `link` |
| `About` | `name`, `subtitle`, `bio[]`, `photos[]` |

---

## 📝 Customization

### Update personal info

Edit `src/constants/index.js` to change:
- About Me description
- Social links (fallback data)
- Finder folder structures and default projects

### Update your resume

Replace the Google Drive embed URL in `src/windows/Resume.jsx`:

```jsx
src="https://drive.google.com/file/d/YOUR_FILE_ID/preview"
```

### Manage content (projects, blog posts, photos)

Open the **Admin** window from the Dock inside the running app. You can create, update, and delete all content directly in your database — no code edits needed.

### Terminal commands

The built-in Terminal supports custom commands defined in `src/windows/Terminal.jsx`. Add your own commands by extending the command handler map.

---

## � Deployment

### Frontend (e.g. Vercel / Netlify)

1. Build the app: `npm run build`
2. Deploy the `dist/` folder
3. Set the API base URL to point to your deployed backend (update the fetch URLs or use an environment variable like `VITE_API_URL`)

### Backend (e.g. Railway / Render)

1. Set the `DATABASE_URL` and `PORT` environment variables
2. Start command: `node server/index.js`
3. Make sure `prisma generate` runs at build time (add to a `postinstall` script if needed)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT — feel free to use and adapt this for your own portfolio!
