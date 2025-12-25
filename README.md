# Aarit Malhotra - Portfolio Website

A modern, interactive portfolio website built with Next.js, Three.js, and Framer Motion.

## Features

- 🎨 **Dark Theme** - Sleek dark theme with gradient accents
- 🎭 **3D Elements** - Interactive 3D sphere using Three.js and React Three Fiber
- ✨ **Animations** - Smooth animations and transitions with Framer Motion
- 📱 **Responsive** - Fully responsive design for all devices
- 🎯 **Portfolio Gallery** - Interactive project gallery with image carousel
- 📄 **Resume Section** - Complete resume display with download option
- 🎪 **Parallax Effects** - Parallax scrolling for depth and interactivity
- ⚡ **Custom Loading** - Beautiful custom loading animation

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Three.js** - 3D graphics
- **React Three Fiber** - React renderer for Three.js
- **Framer Motion** - Animation library
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Radix UI** - Accessible component primitives

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Main page
│   └── globals.css      # Global styles
├── components/
│   ├── hero.tsx         # Hero section with 3D elements
│   ├── about.tsx        # About section
│   ├── portfolio.tsx    # Portfolio gallery
│   ├── resume.tsx       # Resume section
│   ├── contact.tsx      # Contact section
│   ├── navigation.tsx   # Navigation bar
│   ├── footer.tsx       # Footer
│   └── loading.tsx      # Loading animation
└── public/
    └── resume.pdf       # Resume PDF (add your resume here)
```

## Customization

### Adding Projects

Edit `components/portfolio.tsx` and add your projects to the `projects` array:

```typescript
const projects = [
  {
    id: 1,
    title: 'Your Project',
    description: 'Project description',
    tech: ['Next.js', 'TypeScript'],
    images: [
      { url: '/project1.jpg', note: 'Image description' },
    ],
  },
]
```

### Adding Resume

Place your resume PDF in the `public` folder as `resume.pdf`.

## License

MIT
