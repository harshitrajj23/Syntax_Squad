# SecurePay+ - Modern Fintech Landing Page & App Shell

A beautiful, modern fintech application built with Next.js 16, React, and Tailwind CSS. Features secure payments and automated expense tracking.

## Features

- ✨ **Modern Design** - Soft gradients, rounded cards, Lovable aesthetic
- 🎨 **Pink-Purple-Indigo Palette** - Custom semantic design tokens
- 📱 **Mobile-First** - Responsive design for all devices
- 🔐 **Security-Focused** - Enterprise-grade security messaging
- 🎯 **Complete Pages** - Home, Dashboard, Features, Team, Auth (Login/Signup)
- ⚡ **Fast Performance** - Next.js 16 with App Router
- 🎭 **Interactive Components** - Smooth animations and transitions

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4 with semantic design tokens
- **Icons**: Lucide React
- **Fonts**: Geist (from Google Fonts)
- **Language**: TypeScript

## Pages Included

### Public Pages
- **Home** (`/`) - Hero section with phone mockup, features grid, CTA section
- **Features** (`/features`) - Detailed feature cards with comparison table
- **Team** (`/team`) - Team member profiles and company values
- **Dashboard** (`/dashboard`) - Mini app UI with stats, transactions, forms

### Auth Pages
- **Login** (`/auth/login`) - Sign in form with password reset and social options
- **Signup** (`/auth/signup`) - Registration with password strength validator

## Components

All components are modular and reusable:

- `Navbar` - Sticky navigation with mobile menu
- `Footer` - Multi-column footer with social links
- `Hero` - Hero section with headline, CTA, and phone mockup
- `FeatureCard` - Reusable feature card with icon and description
- `ProfileCard` - Team member profile display
- `TransactionList` - Transaction history display
- `TransactionForm` - Add transaction form
- `DashboardStats` - Statistics cards grid
- `PhoneMockup` - Interactive phone mockup showing app preview

## Design System

### Color Palette
- **Primary**: Pink (#EC4899)
- **Secondary**: Purple (#A855F7)
- **Accent**: Indigo (#6366F1)
- **Success**: Green (#10B981)
- **Neutrals**: Grays and off-whites

### Semantic Tokens
All colors are defined as CSS variables in `app/globals.css`:
- `--background` - Main background
- `--background-secondary` - Secondary background
- `--foreground` - Primary text
- `--foreground-muted` - Secondary text
- `--border` - Border color
- `--color-primary` - Primary brand color
- `--color-secondary` - Secondary brand color
- `--color-accent` - Accent color

### Utilities
- `gradient-text` - Pink-purple-indigo text gradient
- `gradient-primary` - Full color gradient background
- `gradient-primary-subtle` - Soft version for backgrounds
- `animate-float` - Floating animation for blur elements
- `animate-gradient` - Animated gradient effect

## Getting Started

### Prerequisites
- Node.js 18+ or runtime environment supporting ES modules

### Installation

Option 1: Using shadcn CLI (Recommended)
\`\`\`bash
npx shadcn-cli@latest init
# Follow prompts to set up your Next.js project
# Then copy the files from this project
\`\`\`

Option 2: Manual Installation
\`\`\`bash
# Clone or download this project
# Install dependencies
npm install

# Or with yarn
yarn install

# Or with pnpm
pnpm install
\`\`\`

### Development

\`\`\`bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
\`\`\`

The app will be available at `http://localhost:3000`

## File Structure

\`\`\`
.
├── app/
│   ├── layout.tsx           # Root layout with metadata
│   ├── globals.css          # Global styles and design tokens
│   ├── page.tsx             # Home page
│   ├── features/
│   │   └── page.tsx         # Features page
│   ├── team/
│   │   └── page.tsx         # Team page
│   ├── dashboard/
│   │   └── page.tsx         # Dashboard page
│   └── auth/
│       ├── login/
│       │   └── page.tsx     # Login page
│       └── signup/
│           └── page.tsx     # Signup page
├── components/
│   ├── navbar.tsx           # Navigation component
│   ├── footer.tsx           # Footer component
│   ├── hero.tsx             # Hero section
│   ├── feature-card.tsx     # Feature card component
│   ├── profile-card.tsx     # Team member card
│   ├── transaction-list.tsx # Transaction history
│   ├── transaction-form.tsx # Add transaction form
│   ├── dashboard-stats.tsx  # Statistics display
│   ├── phone-mockup.tsx     # Phone mockup component
│   └── ui/                  # shadcn/ui components (auto-generated)
├── README.md                # This file
├── package.json
├── tsconfig.json
├── next.config.mjs
└── tailwind.config.js       # Tailwind CSS config

\`\`\`

## Customization

### Changing Colors
Edit the design tokens in `app/globals.css`:
\`\`\`css
--color-primary: #YOUR_COLOR;
--color-secondary: #YOUR_COLOR;
--color-accent: #YOUR_COLOR;
\`\`\`

### Updating Content
All content is hardcoded for the demo. To make it dynamic:
1. Add your CMS/database integration
2. Update page components to fetch content
3. Pass data as props to components

### Adding Pages
1. Create a new directory under `app/`
2. Add `page.tsx` file
3. Use existing components or create new ones
4. Update Navbar links if needed

### Modifying The Phone Mockup
Edit `components/phone-mockup.tsx` to:
- Change the app preview content
- Adjust screen dimensions
- Update the status bar styling
- Add different screens or states

## Deployment

### Deploy to Vercel (Recommended)

\`\`\`bash
# Push to GitHub first
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/repo.git
git push -u origin main

# Deploy to Vercel
npm install -g vercel
vercel
\`\`\`

### Deploy to Other Platforms

**Netlify**:
\`\`\`bash
npm run build
# Upload the `.next` folder and public assets
\`\`\`

**Docker**:
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
\`\`\`

## Performance Tips

1. **Images**: Replace placeholder images with optimized versions
2. **Fonts**: Currently using Google Fonts - consider self-hosting for better performance
3. **Components**: All components support code splitting via Next.js
4. **Analytics**: Add your analytics provider (Google Analytics, PostHog, etc.)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## License

MIT - Feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or suggestions:
1. Check existing documentation
2. Review component props and usage
3. Test in different browsers
4. Check browser console for errors

## Future Enhancements

- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Database integration
- [ ] Real authentication system
- [ ] Payment processing integration
- [ ] Advanced analytics dashboard
- [ ] API documentation
- [ ] Test suite

---

Built with ❤️ using Next.js and React
