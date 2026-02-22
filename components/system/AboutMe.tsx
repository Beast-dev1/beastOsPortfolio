'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import {
  User,
  Briefcase,
  Code,
  GraduationCap,
  Download,
  Mail,
  MapPin,
  Linkedin,
  Github,
  ExternalLink,
  Calendar,
  Award,
  FileText,
  Menu,
  X,
} from 'lucide-react';
import { useWindowContext } from '@/Context/windowContext';
import { appConfig } from '@/config/apps';
import Chrome from './Chrome';

type TabId = 'overview' | 'experience' | 'projects' | 'skills' | 'education';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

interface PersonalInfo {
  name: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  summary: string;
  yearsOfExperience: string;
  projectsCompleted: string;
}

interface Experience {
  position: string;
  company: string;
  period: string;
  location: string;
  responsibilities: string[];
}

interface Project {
  name: string;
  company: string;
  period: string;
  url: string;
  description: string;
  technologies: string[];
}

interface Skill {
  name: string;
  icon: string;
}

interface Skills {
  frontend: Skill[];
  backend: Skill[];
}

interface Education {
  degree: string;
  institution: string;
  location: string;
  year: string;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'projects', label: 'Projects', icon: Code },
  { id: 'skills', label: 'Skills', icon: Code },
  { id: 'education', label: 'Education', icon: GraduationCap },
];

// Shared glass card style for consistency
const glassCard =
  'bg-white/70 dark:bg-[#252525]/80 backdrop-blur-sm rounded-xl border border-gray-200/80 dark:border-white/10';

export default function AboutMe() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { addWindow } = useWindowContext();

  const personalInfo: PersonalInfo = {
    name: 'Prakash Rai',
    role: 'Full Stack Developer',
    location: 'Bagemati Zone, Nepal',
    email: 'prakashrai199@gmail.com',
    phone: '9810346419',
    linkedin: 'https://www.linkedin.com/in/prakashraii',
    github: '', // Not in resume
    summary:
      "Full stack developer with 1.5+ years of experience building end-to-end web applications. Proficient in the MERN stack (MongoDB, Express, React, Node.js) and PostgreSQL, with Prisma ORM, Docker, and CI/CD workflows. Skilled in responsive frontends (React, Next.js), RESTful APIs, and clean, maintainable code. Passionate about delivering scalable solutions from database to UI.",
    yearsOfExperience: '1.5+',
    projectsCompleted: '7+',
  };

  const experience: Experience[] = [
    {
      position: 'Full Stack Developer',
      company: 'Web Studio Nepal',
      period: 'May 2024 – August 2025',
      location: 'Gyaneshowor',
      responsibilities: [
        'Developed responsive and interactive user interfaces using React.js, Next.js, HTML5, CSS3, and JavaScript (ES6+).',
        'Translated UI/UX designs from Figma or Adobe XD into high-quality code with pixel-perfect accuracy.',
        'Integrated RESTful APIs and managed dynamic data using Axios, Fetch API, and React Hooks.',
        'Worked across the stack: API integration, data modeling, and frontend–backend coordination for full-featured applications.',
        'Implemented responsive design principles to ensure cross-browser and cross-device compatibility (mobile-first approach).',
        'Optimized performance through lazy loading, code splitting, and asset optimization, improving page load speed by 30%.',
        'Maintained state management using Redux, Context API, or local state.',
        'Collaborated with backend developers, designers, and QA teams in an Agile environment using Git, and GitHub.',
      ],
    },
  ];

  const projects: Project[] = [
    {
      name: 'Shree Riddhisiddhi Jewellers Website + Dashboard',
      company: 'Web Studio Nepal',
      period: 'June 2025 – August 2025',
      url: 'https://shreeriddhisiddhijewellers.com/',
      description:
        'Full stack e-commerce and role-based admin dashboard. Next.js with SSG/SSR, TanStack Query, and REST API for product catalogs, orders, and analytics.',
      technologies: ['Next.js', 'React', 'TanStack Query', 'Axios', 'SSG', 'SSR', 'REST API'],
    },
    {
      name: 'Chino Organica',
      company: 'Web Studio Nepal',
      period: 'May 2025 – July 2025',
      url: 'https://chinoorganica.com.np/',
      description:
        'Next.js organic products site with SSR, responsive UI, and consistent layouts for home, about, product catalogs, and articles.',
      technologies: ['Next.js', 'React', 'SSR', 'Component Library'],
    },
    {
      name: 'Hotel Management System',
      company: 'Web Studio Nepal',
      period: 'January 2025 – April 2025',
      url: '',
      description:
        'React app for room booking, check-in/out, and availability. TanStack Query, Tailwind CSS, and REST APIs for bookings and billing.',
      technologies: ['React.js', 'TanStack Query', 'Tailwind CSS', 'Axios', 'REST API'],
    },
    {
      name: 'E-commerce Platform',
      company: 'Personal',
      period: '2024 – Present',
      url: 'https://ecom.webstudiomatrix.com/',
      description:
        'Full stack e-commerce: Next.js 15, TypeScript, Redux, Tailwind, Docker, CI/CD. Auth, product catalog, cart, and payments (Esewa, Khalti).',
      technologies: ['Next.js', 'TypeScript', 'Redux', 'Tailwind', 'Docker', 'CI/CD'],
    },
    {
      name: 'Sastobazar',
      company: 'Personal',
      period: '2024 – Present',
      url: '',
      description:
        'Backend marketplace: NestJS, TypeORM, PostgreSQL, Redis, Docker. Vendor subscriptions, admin, and reporting.',
      technologies: ['NestJS', 'TypeORM', 'PostgreSQL', 'Redis', 'Docker'],
    },
    {
      name: 'Messenger (Let\'sChat)',
      company: 'Personal',
      period: '2024 – Present',
      url: '',
      description:
        'Real-time chat: Next.js frontend, Node/Express API, Prisma + PostgreSQL, Redis, Socket.io, WebRTC for calls, Docker.',
      technologies: ['Next.js', 'Express', 'Prisma', 'PostgreSQL', 'Redis', 'Socket.io', 'Docker'],
    },
    {
      name: 'Resume Builder',
      company: 'Personal',
      period: '2024 – Present',
      url: 'https://github.com/Beast-dev1/resumebuilder',
      description:
        'MERN stack resume builder: React/Vite client, Express + MongoDB server, JWT auth, AI (OpenAI) enhancements, multiple templates, PDF export.',
      technologies: ['React', 'Vite', 'Express', 'MongoDB', 'JWT', 'OpenAI'],
    },
  ];

  const skills: Skills = {
    frontend: [
      { name: 'HTML', icon: 'html5' },
      { name: 'CSS', icon: 'css3' },
      { name: 'JavaScript', icon: 'javascript' },
      { name: 'React', icon: 'react' },
      { name: 'Next.js', icon: 'nextjs' },
      { name: 'Redux Toolkit', icon: 'redux' },
      { name: 'TanStack Query', icon: 'reactquery' },
      { name: 'Tailwind CSS', icon: 'tailwindcss' },
      { name: 'Material UI', icon: 'materialui' },
    ],
    backend: [
      { name: 'Express', icon: 'express' },
      { name: 'Node.js', icon: 'nodejs' },
      { name: 'MongoDB', icon: 'mongodb' },
      { name: 'PostgreSQL', icon: 'postgresql' },
      { name: 'Prisma', icon: 'prisma' },
      { name: 'Docker', icon: 'docker' },
      { name: 'CI/CD', icon: 'githubactions' },
    ],
  };

  const education: Education[] = [
    {
      degree: 'CSIT',
      institution: 'College of Applied Business',
      location: 'Chabahil, Kathmandu',
      year: '2025',
    },
  ];

  const handleResumeDownload = () => {
    const link = document.createElement('a');
    link.href = '/resume/resume.pdf';
    link.download = 'Prakash_Rai_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100/80 dark:bg-[#1a1a1a] text-gray-900 dark:text-white overflow-hidden backdrop-blur-[2px]">
      {/* Mobile header bar - hamburger + title */}
      <div className="flex md:hidden items-center gap-3 px-4 py-3 border-b border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#2d2d2d]/80 backdrop-blur-xl flex-shrink-0">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={sidebarOpen}
        >
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">About Me</h2>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Navigation - drawer on mobile, fixed on desktop */}
        <div
          className={`absolute md:relative z-20 w-64 h-full bg-white/70 dark:bg-[#2d2d2d]/80 backdrop-blur-xl border-r border-gray-200/80 dark:border-white/10 flex flex-col rounded-r-xl overflow-hidden transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="p-4 md:p-6 border-b border-gray-200/80 dark:border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">About Me</h2>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 border-l-4 pl-3 pr-4 py-3 rounded-lg mb-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-windows-blue focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1a1a1a] ${
                    isActive
                      ? 'bg-windows-blue/15 dark:bg-windows-blue/20 text-windows-blue dark:text-windows-blue-light border-windows-blue'
                      : 'border-transparent text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                  whileHover={isActive ? {} : { x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-10"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {activeTab === 'overview' && (
              <OverviewTab
                personalInfo={personalInfo}
                onDownloadResume={handleResumeDownload}
                onViewResume={() => {
                  const chromeApp = appConfig.taskbarApps.find((app) => app.id === 'GoogleChrome');
                  if (chromeApp) {
                    addWindow(
                      'GoogleChrome',
                      <Chrome initialUrl="/resume/resume.pdf" />,
                      1200,
                      800,
                      chromeApp.icon
                    );
                  }
                }}
              />
            )}
            {activeTab === 'experience' && <ExperienceTab experience={experience} />}
            {activeTab === 'projects' && <ProjectsTab projects={projects} />}
            {activeTab === 'skills' && <SkillsTab skills={skills} />}
            {activeTab === 'education' && <EducationTab education={education} />}
          </motion.div>
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({
  personalInfo,
  onDownloadResume,
  onViewResume,
}: {
  personalInfo: PersonalInfo;
  onDownloadResume: () => void;
  onViewResume: () => void;
}) {
  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col h-full">
      {/* Hero Section - Glass card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${glassCard} p-6 mb-6`}
      >
        <div className="flex flex-col lg:flex-row items-start gap-8">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-windows-blue to-windows-blue-dark flex items-center justify-center shadow-lg ring-2 ring-white/20 dark:ring-white/10">
              <User className="w-16 h-16 text-white" />
            </div>
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{personalInfo.name}</h1>
              <span className="px-3 py-1 bg-windows-blue/10 dark:bg-windows-blue/20 text-windows-blue dark:text-windows-blue-light rounded-full text-sm font-medium">
                Available for hire
              </span>
            </div>
            <p className="text-xl text-windows-blue dark:text-windows-blue-light font-medium mb-4">{personalInfo.role}</p>
            {/* Stats as metric pills */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10">
                <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{personalInfo.location}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{personalInfo.yearsOfExperience} years exp.</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10">
                <Award className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{personalInfo.projectsCompleted} projects</span>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base max-w-2xl">{personalInfo.summary}</p>
          </div>
        </div>
      </motion.div>

      {/* Summary strip - optional muted background */}
      <div className="flex-1 min-h-0" />

      {/* Quick Actions - Primary (Download) + Secondary (View, Email, LinkedIn) */}
      <div className="mt-auto pt-8 border-t border-gray-200/80 dark:border-white/10">
        <div className="flex flex-wrap gap-3">
          <motion.a
            href={personalInfo.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-transparent text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors whitespace-nowrap border border-gray-300/80 dark:border-white/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Linkedin className="w-4 h-4" />
            <span>LinkedIn</span>
          </motion.a>
          <motion.a
            href="https://mail.google.com/mail/?view=cm&to=prakashrai1900@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-transparent text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors whitespace-nowrap border border-gray-300/80 dark:border-white/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </motion.a>
          <motion.button
            onClick={onViewResume}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-transparent text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors whitespace-nowrap border border-gray-300/80 dark:border-white/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FileText className="w-4 h-4" />
            <span>View Resume</span>
          </motion.button>
          <motion.button
            onClick={onDownloadResume}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-windows-blue hover:bg-windows-blue-dark dark:bg-windows-blue dark:hover:bg-windows-blue-dark text-white transition-colors whitespace-nowrap border border-windows-blue shadow-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4" />
            <span>Download Resume</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// Experience Tab Component
function ExperienceTab({ experience }: { experience: Experience[] }) {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <span className="w-1 h-6 rounded-full bg-windows-blue" aria-hidden />
        Work Experience
      </h2>
      <div className="space-y-6">
        {experience.map((exp: typeof experience[0], index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${glassCard} p-6 border-l-4 border-windows-blue`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{exp.position}</h3>
                <p className="text-lg text-windows-blue dark:text-windows-blue-light font-medium">{exp.company}</p>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{exp.period}</span>
                  <span className="mx-2">•</span>
                  <MapPin className="w-4 h-4" />
                  <span>{exp.location}</span>
                </div>
              </div>
            </div>
            <ul className="space-y-2 mt-4">
              {exp.responsibilities.map((responsibility: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-windows-blue mt-1.5 flex-shrink-0">•</span>
                  <span>{responsibility}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Projects Tab Component
function ProjectsTab({ projects }: { projects: Project[] }) {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <span className="w-1 h-6 rounded-full bg-windows-blue" aria-hidden />
        Featured Projects
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project: typeof projects[0], index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${glassCard} p-6 hover:shadow-lg hover:border-windows-blue/30 transition-all duration-200`}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{project.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <Briefcase className="w-4 h-4 flex-shrink-0" />
                  <span>{project.company}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>{project.period}</span>
                </div>
              </div>
              {project.url && (
                <motion.a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-windows-blue/10 dark:bg-windows-blue/20 text-windows-blue dark:text-windows-blue-light hover:bg-windows-blue/20 dark:hover:bg-windows-blue/30 transition-colors flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Open project link"
                >
                  <ExternalLink className="w-4 h-4" />
                </motion.a>
              )}
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">{project.description}</p>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech: string, techIndex: number) => (
                <span
                  key={techIndex}
                  className="px-3 py-1 bg-windows-blue/10 dark:bg-windows-blue/20 text-windows-blue dark:text-windows-blue-light rounded-full text-xs font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Skills Tab Component
function SkillsTab({ skills }: { skills: Skills }) {
  const getTechIcon = (iconName: string) => {
    // Map skill icon names to devicon folder names
    const iconMap: Record<string, string> = {
      html5: 'html5',
      css3: 'css3',
      javascript: 'javascript',
      react: 'react',
      nextjs: 'nextjs',
      redux: 'redux',
      reactquery: 'reactquery',
      tailwindcss: 'tailwindcss',
      materialui: 'materialui',
      express: 'express',
      nodejs: 'nodejs',
      mongodb: 'mongodb',
      jwt: 'jsonwebtoken',
      postgresql: 'postgresql',
      prisma: 'prisma',
      docker: 'docker',
      githubactions: 'githubactions',
    };
    return iconMap[iconName.toLowerCase()] || iconName.toLowerCase();
  };
  
  const getIconVariant = (iconName: string) => {
    // Determine if icon uses 'plain' or 'original' variant
    if (['tailwindcss', 'nextjs', 'postgresql', 'prisma', 'githubactions'].includes(iconName.toLowerCase())) {
      return 'plain';
    }
    return 'original';
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <span className="w-1 h-6 rounded-full bg-windows-blue" aria-hidden />
        Technical Skills
      </h2>
      
      {/* Frontend Skills */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-windows-blue" aria-hidden />
          Frontend Technologies
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {skills.frontend.map((skill: typeof skills.frontend[0], index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`${glassCard} flex flex-col items-center p-4 hover:border-blue-400/50 dark:hover:border-windows-blue/50 hover:shadow-md transition-all`}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="w-12 h-12 mb-2 flex items-center justify-center">
                {skill.icon === 'reactquery' ? (
                  <Image
                    src="/react-query-seeklogo.svg"
                    alt={skill.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain"
                    unoptimized
                  />
                ) : skill.icon === 'tailwindcss' ? (
                  <Icon icon="devicon:tailwindcss" className="w-12 h-12" />
                ) : (
                  <Image
                    src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${getTechIcon(skill.icon)}/${getTechIcon(skill.icon)}-${getIconVariant(skill.icon)}.svg`}
                    alt={skill.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain"
                    unoptimized
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center text-xs font-semibold">${skill.name.charAt(0)}</div>`;
                      }
                    }}
                  />
                )}
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{skill.name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Backend Skills */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden />
          Backend Technologies
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {skills.backend.map((skill: typeof skills.backend[0], index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (skills.frontend.length + index) * 0.05 }}
              className={`${glassCard} flex flex-col items-center p-4 hover:border-emerald-400/50 dark:hover:border-emerald-500/50 hover:shadow-md transition-all`}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="w-12 h-12 mb-2 flex items-center justify-center">
                {skill.icon === 'prisma' ? (
                  <Icon icon="devicon:prisma" className="w-12 h-12" />
                ) : skill.icon === 'githubactions' ? (
                  <Icon icon="simple-icons:githubactions" className="w-12 h-12" />
                ) : (
                  <Image
                    src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${getTechIcon(skill.icon)}/${getTechIcon(skill.icon)}-${getIconVariant(skill.icon)}.svg`}
                    alt={skill.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain"
                    unoptimized
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center text-xs font-semibold">${skill.name.charAt(0)}</div>`;
                      }
                    }}
                  />
                )}
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{skill.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Education Tab Component
function EducationTab({ education }: { education: Education[] }) {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <span className="w-1 h-6 rounded-full bg-purple-500" aria-hidden />
        Education
      </h2>
      <div className="space-y-6">
        {education.map((edu: typeof education[0], index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${glassCard} p-6 border-l-4 border-purple-500`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0 border border-purple-200/50 dark:border-purple-500/30">
                <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{edu.degree}</h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 font-medium mb-2">{edu.institution}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{edu.location}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>{edu.year}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

