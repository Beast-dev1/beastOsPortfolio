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
  Globe,
  FileText,
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

export default function AboutMe() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const { addWindow } = useWindowContext();

  const personalInfo: PersonalInfo = {
    name: 'Prakash Rai',
    role: 'Frontend Developer',
    location: 'Bagemati Zone, Nepal',
    email: 'prakashrai199@gmail.com',
    phone: '9810346419',
    linkedin: 'https://www.linkedin.com/in/prakashraii',
    github: '', // Not in resume
    summary:
      "Creative and detail-oriented Frontend Developer with 1.5+ years of hands-on experience in building dynamic, scalable, and responsive web applications. Proficient in modern frontend technologies including React.js, Next.js, JavaScript (ES6+), HTML5, and CSS3, with a strong understanding of component-based architecture and state management. Skilled in translating UI/UX designs into high-quality code, integrating RESTful APIs, and optimizing performance for speed and usability. A collaborative team player with a passion for clean code, accessibility, and delivering seamless user experiences across all devices and platforms.",
    yearsOfExperience: '1.5+',
    projectsCompleted: '3+',
  };

  const experience: Experience[] = [
    {
      position: 'Frontend Developer',
      company: 'Web Studio Nepal',
      period: 'May 2024 – August 2025',
      location: 'Gyaneshowor',
      responsibilities: [
        'Developed responsive and interactive user interfaces using React.js, Next.js, HTML5, CSS3, and JavaScript (ES6+).',
        'Translated UI/UX designs from Figma or Adobe XD into high-quality code with pixel-perfect accuracy.',
        'Integrated RESTful APIs and managed dynamic data using Axios, Fetch API, and React Hooks.',
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
        'Developed a fast, SEO-optimized, and responsive e-commerce website for Shree Riddhi Siddhi Jewellers using Next.js, featuring product catalogs, collections, custom jewelry services, and brand storytelling with high-quality imagery. Implemented static site generation (SSG) for product pages and server-side rendering (SSR) for dynamic sections like promotions, ensuring lightning-fast load times and excellent search engine visibility. Built a secure, role-based admin dashboard to manage extensive jewelry inventory, customer orders, customization requests, pricing updates, and sales analytics with real-time dashboards. Leveraged TanStack Query for optimized API handling: infinite queries for paginated product lists, optimistic mutations for quick order updates, caching for repeated views, and auto-refetching on focus or intervals.',
      technologies: ['Next.js', 'React', 'TanStack Query', 'Axios', 'SSG', 'SSR', 'REST API'],
    },
    {
      name: 'Chino Organica',
      company: 'Web Studio Nepal',
      period: 'May 2025 – July 2025',
      url: 'https://chinoorganica.com.np/',
      description:
        'Developed a scalable Next.js web application that showcases organic products and company information with a fast, responsive UI and accessible navigation. Implemented server-rendered pages for performance and SEO, with client-side interactivity for a smooth user experience. Integrated a modular component library and clean page layouts to ensure consistency across sections (home, about, product catalogs, articles).',
      technologies: ['Next.js', 'React', 'SSR', 'Component Library'],
    },
    {
      name: 'Hotel Management System',
      company: 'Web Studio Nepal',
      period: 'January 2025 – April 2025',
      url: '',
      description:
        'Developed a fully functional hotel management system using React.js, focused on real-time room booking, guest check-in/out, and availability tracking. Utilized TanStack Query (React Query) for efficient data fetching, caching, and synchronization with backend APIs, resulting in improved UI responsiveness and reduced loading times. Designed an intuitive, mobile-friendly UI using Tailwind CSS, ensuring a seamless experience across devices. Integrated RESTful APIs using Axios for managing bookings, guest data, room assignments, and billing. Implemented conditional rendering and optimistic updates using TanStack Query to enhance UX for real-time status updates (e.g., room availability).',
      technologies: ['React.js', 'TanStack Query', 'Tailwind CSS', 'Axios', 'REST API'],
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
      { name: 'NoSQL', icon: 'mongodb' },
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
    <div className="flex h-full bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-50 dark:bg-[#2d2d2d] border-r border-gray-200 dark:border-[#3a3a3a] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-[#3a3a3a]">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">About Me</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? 'bg-blue-500 text-white dark:bg-blue-600'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3a3a3a]'
                }`}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{tab.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
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
    <div className="p-8 flex flex-col h-full">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-start gap-8 mb-8">
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <User className="w-16 h-16 text-white" />
          </div>
        </div>
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{personalInfo.name}</h1>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
              Available for hire
            </span>
          </div>
          <p className="text-xl text-blue-600 dark:text-blue-400 font-medium mb-4">{personalInfo.role}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{personalInfo.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{personalInfo.yearsOfExperience} years experience</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              <span>{personalInfo.projectsCompleted} projects completed</span>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{personalInfo.summary}</p>
        </div>
      </div>

      {/* Quick Actions - Bottom of page */}
      <div className="mt-auto pt-8 border-t border-gray-200 dark:border-[#3a3a3a]">
        <div className="flex gap-3 overflow-x-auto">
          <motion.a
            href={personalInfo.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap border border-gray-300"
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
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap border border-gray-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </motion.a>
          <motion.button
            onClick={onViewResume}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap border border-gray-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FileText className="w-4 h-4" />
            <span>View Resume</span>
          </motion.button>
          <motion.button
            onClick={onDownloadResume}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap border border-gray-300"
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
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Work Experience</h2>
      <div className="space-y-6">
        {experience.map((exp: typeof experience[0], index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 dark:bg-[#2d2d2d] rounded-xl p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{exp.position}</h3>
                <p className="text-lg text-blue-600 dark:text-blue-400 font-medium">{exp.company}</p>
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
                  <span className="text-blue-500 mt-1.5">•</span>
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
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Featured Projects</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project: typeof projects[0], index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 dark:bg-[#2d2d2d] rounded-xl p-6 border border-gray-200 dark:border-[#3a3a3a] hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{project.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <Briefcase className="w-4 h-4" />
                  <span>{project.company}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="w-4 h-4" />
                  <span>{project.period}</span>
                </div>
              </div>
              {project.url && (
                <motion.a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  whileHover={{ scale: 1.1 }}
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
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium"
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
    };
    return iconMap[iconName.toLowerCase()] || iconName.toLowerCase();
  };
  
  const getIconVariant = (iconName: string) => {
    // Determine if icon uses 'plain' or 'original' variant
    if (iconName === 'tailwindcss' || iconName === 'nextjs') {
      return 'plain';
    }
    return 'original';
  };

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Technical Skills</h2>
      
      {/* Frontend Skills */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-500" />
          Frontend Technologies
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {skills.frontend.map((skill: typeof skills.frontend[0], index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col items-center p-4 bg-gray-50 dark:bg-[#2d2d2d] rounded-lg border border-gray-200 dark:border-[#3a3a3a] hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all"
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
          <Code className="w-5 h-5 text-green-500" />
          Backend Technologies
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {skills.backend.map((skill: typeof skills.backend[0], index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (skills.frontend.length + index) * 0.05 }}
              className="flex flex-col items-center p-4 bg-gray-50 dark:bg-[#2d2d2d] rounded-lg border border-gray-200 dark:border-[#3a3a3a] hover:border-green-500 dark:hover:border-green-500 hover:shadow-md transition-all"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="w-12 h-12 mb-2 flex items-center justify-center">
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
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Education</h2>
      <div className="space-y-6">
        {education.map((edu: typeof education[0], index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 dark:bg-[#2d2d2d] rounded-xl p-6 border-l-4 border-purple-500"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{edu.degree}</h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 font-medium mb-2">{edu.institution}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{edu.location}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="w-4 h-4" />
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

