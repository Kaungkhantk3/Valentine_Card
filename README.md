# 💝 Valentine Card

A modern, interactive digital Valentine's Day card creator with customizable photos, stickers, text layers, and engaging unlock animations.

## ✨ Features

### Card Creation

- **Multiple Templates**: Choose from 8+ beautiful card templates with different layouts
- **Photo Upload & Editing**: Add up to 5 photos with advanced editing capabilities
  - Multiple shape options (circle, heart, star, hexagon, etc.)
  - Position, scale, and rotate controls
  - Object-fit options (cover/contain)
- **Stickers & Decorations**: Add romantic stickers and decorative elements
- **Text Layers**: Add customizable text with various fonts, colors, and styles
- **Background Customization**: Choose from pre-designed backgrounds

### Interactive Unlock Animations

Choose from 4 different unlock mechanisms for your card recipient:

- **Bring Together**: Drag two avatars together to unlock
- **Break Heart**: Drag a key to the heart lock
- **Scratch Card**: Scratch to reveal the card
- **Find The Real Heart**: Find the correct heart among decoys

### Sharing

- Unique shareable links for each card
- Edit token for card creators to modify their cards
- Mobile-responsive viewer experience

## 🛠 Tech Stack

### Frontend (Web App)

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Gesture handling** with pointer events for smooth mobile interactions

### Backend (API)

- **Node.js** with TypeScript
- **Express** framework
- **Prisma ORM** for database management
- **MYSQL** database

### DevOps

- **Docker** & **Docker Compose** for containerization
- **npm** for package management

## 📁 Project Structure

```
valentine-card/
├── apps/
│   ├── api/              # Backend API server
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── package.json
│   │
│   └── web/              # Frontend React application
│       ├── src/
│       │   ├── pages/
│       │   │   ├── create/        # Card creation page
│       │   │   ├── reveal/        # Unlock animations
│       │   │   ├── CardPage.tsx   # Card viewer
│       │   │   ├── ExportPage.tsx # Share/export
│       │   │   └── Home.tsx       # Landing page
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── public/
│       │   ├── avatars/
│       │   ├── background/
│       │   ├── stickers/
│       │   └── templates/
│       └── package.json
│
├── docker-compose.yml
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm**
- **Docker** & **Docker Compose** (for database)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Kaungkhantk3/Valentine_Card.git
   cd valentine-card
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the database**

   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**

   ```bash
   cd apps/api
   npm prisma migrate deploy
   ```

5. **Start the development servers**

   In separate terminals:

   **Backend:**

   ```bash
   cd apps/api
   npm dev
   ```

   **Frontend:**

   ```bash
   cd apps/web
   npm dev
   ```

6. **Open your browser**
   - Frontend: `http://localhost:5173`
   - API: `http://localhost:4000`

## 💻 Development

### Frontend Development

The web app runs on Vite with hot module replacement for fast development.

```bash
cd apps/web
npm run dev
```

### Backend Development

The API server uses nodemon for auto-restart on file changes.

```bash
cd apps/api
npm run dev
```

### Database Management

**Generate Prisma Client:**

```bash
cd apps/api
npm prisma generate
```

**Create a new migration:**

```bash
cd apps/api
npm prisma migrate dev --name your_migration_name
```

**Open Prisma Studio (Database GUI):**

```bash
cd apps/api
npm prisma studio
```

## 📦 Building for Production

### Build Frontend

```bash
cd apps/web
npm build
```

### Build Backend

```bash
cd apps/api
npm build
```

## 🎨 Customization

### Adding New Templates

1. Add template images to `apps/web/public/templates/`
2. Update template definitions in `apps/web/src/pages/create/templates.ts`

### Adding New Stickers

1. Add sticker images to `apps/web/public/stickers/`
2. Update sticker definitions in `apps/web/src/pages/create/stickers.ts`

### Adding New Shapes

Update shape definitions in `apps/web/src/pages/create/shapes.ts`

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices with:

- Touch-friendly gesture controls
- Responsive layouts
- Mobile-optimized unlock animations
- Smooth scrolling and interactions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Kaung Khant Kyaw** - [@Kaungkhantk3](https://github.com/Kaungkhantk3)

## 🙏 Acknowledgments

- Icons from [Lucide React](https://lucide.dev/)
- UI components built with [Tailwind CSS](https://tailwindcss.com/)
- Database management with [Prisma](https://www.prisma.io/)

---

Made with ❤️ for Valentine's Day

> > > > > > > 63597f2 (Added README file)
