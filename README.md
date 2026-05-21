# CvNet FrontEnd

CvNet is a modern, AI-powered recruitment and career development platform designed to bridge the gap between recruiters and candidates. This repository contains the frontend implementation of the CvNet platform, built with Next.js 15+, React 19, and Tailwind CSS 4.

## 🚀 Features

### For Recruiters
- **Dashboard**: Real-time overview of recruitment activities.
- **Job Management**: Create, edit, and track job postings easily.
- **Candidate Tracking**: Manage applications and track candidate progress.
- **Interview Scheduling**: Streamlined interview management.
- **Analytics**: Data-driven insights into hiring trends and performance.

### For Candidates
- **Smart Dashboard**: Personalized view of job applications and recommendations.
- **CV Management**: Tools to build and manage professional resumes.
- **Skill Gap Analysis**: Identify areas for improvement to meet job requirements.
- **Application Tracking**: Keep tabs on every job you've applied for.

### General
- **Authentication**: Secure login and signup flows for both roles.
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile.
- **Modern UI**: Clean, professional interface built with Tailwind CSS.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 📂 Project Structure

```text
cvnet-frontend/
├── public/                  # Static assets (images, icons, etc.)
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (candidate)/     # Candidate portal routes
│   │   │   ├── applications/ # Application tracking
│   │   │   ├── cv/           # CV management
│   │   │   ├── dashboard/    # Candidate dashboard
│   │   │   ├── skill-gap/    # AI skill analysis
│   │   │   └── layout.tsx    # Candidate-specific layout
│   │   ├── (recruiter)/     # Recruiter portal routes
│   │   │   ├── recruiter/    # Nested recruiter routes
│   │   │   │   ├── analytics/
│   │   │   │   ├── candidates/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── interviews/
│   │   │   │   ├── jobs/
│   │   │   │   └── post-job/
│   │   │   └── layout.tsx    # Recruiter-specific layout
│   │   ├── login/           # Authentication
│   │   ├── signup/          # Registration
│   │   ├── globals.css      # Global styles & Tailwind directives
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Landing page
│   └── components/          # Reusable React components
│       ├── CandidateSidebar.tsx
│       ├── RecruiterSidebar.tsx
│       └── MarketingNav.tsx
├── next.config.ts           # Next.js configuration
├── package.json             # Scripts and dependencies
└── tsconfig.json            # TypeScript configuration
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/cvnet-frontend.git
   ```

2. Navigate to the project directory:
   ```bash
   cd cvnet-frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## 📝 License

This project is licensed under the [MIT License](LICENSE).

