# Windows 11 Portfolio OS

A Windows 11-inspired portfolio operating system built with Next.js, React, and Tailwind CSS.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features (Planned)

- Windows 11 UI with glassmorphism effects
- Centered taskbar with live previews
- Draggable desktop icons and windows
- Start Menu with smooth animations
- Dark/Light mode toggle
- Window controls (minimize, maximize, close)
- System apps: File Explorer, Settings, About, Terminal, Project Viewer

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **State Management:** React Context / Zustand
- **Icons:** Lucide React / Iconify

## Project Structure

```
myPortfolio/
├── app/              # Next.js App Router pages
├── components/       # React components
├── contexts/         # React Context providers
├── lib/              # Utility functions
├── public/           # Static assets
└── styles/           # Global styles
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CX_ID=your_google_cx_id_here
```

- **OpenWeatherMap API Key**: Get your API key from [OpenWeatherMap](https://home.openweathermap.org/api_keys)
- **Google Custom Search API**: Get your API key and CX ID from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
  
**Note**: Google Search API keys are now stored server-side (without `NEXT_PUBLIC_` prefix) for better security. The API route will also accept `NEXT_PUBLIC_GOOGLE_API_KEY` and `NEXT_PUBLIC_GOOGLE_CX_ID` as fallback for backward compatibility.

You can use `.env.example` as a template.

## Deployment

### Deploying to Vercel

This project is configured for easy deployment on [Vercel](https://vercel.com), the platform created by the Next.js team.

#### Prerequisites
- A GitHub, GitLab, or Bitbucket account
- A Vercel account (sign up at [vercel.com](https://vercel.com))

#### Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import your project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables**
   - In the Vercel project settings, go to "Environment Variables"
   - Add the following variables:
     - `NEXT_PUBLIC_OPENWEATHER_API_KEY`
     - `GOOGLE_API_KEY` (server-side, more secure - recommended)
     - `GOOGLE_CX_ID` (server-side, more secure - recommended)
     - Or use `NEXT_PUBLIC_GOOGLE_API_KEY` and `NEXT_PUBLIC_GOOGLE_CX_ID` for backward compatibility
   - Set them for all environments (Production, Preview, Development)

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application
   - Your app will be live at `your-project.vercel.app`

#### Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to `main` or `master` branch
- **Preview**: Every push to other branches and pull requests

### Testing Production Build Locally

Before deploying, test the production build:

```bash
npm run build
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to verify everything works.

## CI/CD

This project includes GitHub Actions for continuous integration:

- **Linting**: Runs ESLint on every push and pull request
- **Build Check**: Verifies the application builds successfully
- **Automated Testing**: Ensures code quality before deployment

The CI workflow is located at `.github/workflows/ci.yml`.

To use GitHub Actions secrets for environment variables in CI:
1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Add the required secrets:
   - `NEXT_PUBLIC_OPENWEATHER_API_KEY`
   - `GOOGLE_API_KEY` (server-side, recommended)
   - `GOOGLE_CX_ID` (server-side, recommended)
   - Or use `NEXT_PUBLIC_GOOGLE_API_KEY` and `NEXT_PUBLIC_GOOGLE_CX_ID` for backward compatibility

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)









