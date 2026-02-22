'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Home,
  Search,
  FolderPlus,
  FilePlus,
  Scissors,
  Copy,
  Clipboard,
  Edit,
  Share2,
  Trash2,
  ArrowUpDown,
  LayoutGrid,
  List,
  Filter,
  MoreHorizontal,
  HardDrive,
  Network,
  Clock,
  Star,
  Users,
  Shield,
  Folder,
  Music,
  Image as ImageIcon,
  Video,
  FileText,
  X,
  Plus,
} from 'lucide-react';
import Image from 'next/image';
import { useFileSystem, File } from '@/Context/FileSystemContext';
import { useWindowContext } from '@/Context/windowContext';
import { fileExplorerConfig } from '@/config/fileExplorerConfig';
import { appConfig } from '@/config/apps';
import Terminal from './Terminal';
import Chrome from './Chrome';
import Photos from './Photos';
import MusicPlayer from './Music';
import VideoPlayer from './Video';
import Mail from './Mail';
import AboutMe from './AboutMe';

type ViewMode = 'grid' | 'list' | 'details';
type TabType = 'recent' | 'favorites' | 'shared';
type CurrentView = 'home' | 'folder' | 'thispc' | 'drive' | 'desktop' | 'documents' | 'pictures' | 'music' | 'videos';

interface NavigationHistory {
  path: string | null;
  directoryId: string | null;
}

export default function FileExplorer() {
  const {
    files,
    currentDirectory,
    setCurrentDirectory,
    getChildren,
    getFileById,
    addFile,
    deleteFile,
    updateFile,
  } = useFileSystem();
  const { addWindow } = useWindowContext();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<TabType>('recent');
  const [currentView, setCurrentView] = useState<CurrentView>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [copiedItems, setCopiedItems] = useState<File[]>([]);
  const [isCutting, setIsCutting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['thispc']));
  const [currentPath, setCurrentPath] = useState<string>('Home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const addressBarRef = useRef<HTMLInputElement>(null);

  // Drive storage data
  const drives = [
    {
      id: 'c',
      name: 'Local Disk (C:)',
      icon: '/icons/drives/c.png',
      totalGB: 237,
      freeGB: 97.4,
      hasWindowsLogo: true,
    },
    {
      id: 'd',
      name: 'Local Disk (D:)',
      icon: '/icons/drives/d.png',
      totalGB: 465,
      freeGB: 462.0,
      hasWindowsLogo: false,
    },
  ];

  // System folders for C: drive
  interface DriveItem {
    name: string;
    dateModified: string;
    type: string;
    size: string;
    icon?: string;
    id?: string;
  }

  const cDriveFolders: DriveItem[] = [
    { name: 'Intel', dateModified: '7/13/2025 7:58 PM', type: 'File folder', size: '-' },
    { name: 'PerfLogs', dateModified: '4/1/2024 1:11 PM', type: 'File folder', size: '-' },
    { name: 'Program Files', dateModified: '12/14/2025 4:01 PM', type: 'File folder', size: '-' },
    { name: 'Program Files (x86)', dateModified: '12/10/2025 1:21 PM', type: 'File folder', size: '-' },
    { name: 'Users', dateModified: '12/10/2025 11:26 AM', type: 'File folder', size: '-' },
    { name: 'Windows', dateModified: '1/4/2026 3:45 PM', type: 'File folder', size: '-' },
    { name: 'Windows.old', dateModified: '12/10/2025 11:31 AM', type: 'File folder', size: '-' },
    { name: 'DumpStack.log', dateModified: '11/22/2025 8:12 PM', type: 'LOG File', size: '12 KB' },
  ];

  const dDriveFolders: DriveItem[] = [];

  // Get drive contents (folders + applications)
  const getDriveContents = (driveId: string): DriveItem[] => {
    const folders = driveId === 'c' ? cDriveFolders : dDriveFolders;
    // Only add applications to D: drive, not C: drive
    if (driveId === 'd') {
      // Filter out File Explorer from applications
      const apps: DriveItem[] = appConfig.taskbarApps
        .filter((app) => app.id !== 'FileExplorer')
        .map((app) => ({
          name: app.name,
          dateModified: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          type: 'Application',
          size: '-',
          icon: app.icon,
          id: app.id,
        }));
      return [...folders, ...apps];
    }
    // C: drive only has folders, no applications
    return folders;
  };

  // Get desktop applications
  const getDesktopApplications = (): DriveItem[] => {
    // Filter out File Explorer from applications
    const apps: DriveItem[] = appConfig.taskbarApps
      .filter((app) => app.id !== 'FileExplorer')
      .map((app) => ({
        name: app.name,
        dateModified: '01/11/2026 5:19 PM',
        type: 'Application',
        size: '-',
        icon: app.icon,
        id: app.id,
      }));
    return apps;
  };

  // Get Documents folder contents (resume.pdf)
  const getDocumentsContents = (): DriveItem[] => {
    return [
      {
        name: 'my resume',
        dateModified: '12/31/2025 4:29 PM',
        type: 'PDF File',
        size: '248 KB',
        icon: undefined, // Will use FileText icon as fallback
        id: 'resume-pdf',
      },
    ];
  };

  // Initialize navigation history
  useEffect(() => {
    if (currentView === 'home') {
      setNavigationHistory([{ path: 'Home', directoryId: null }]);
      setHistoryIndex(0);
    }
  }, [currentView]);

  // Initialize expanded sections
  useEffect(() => {
    if (currentView === 'thispc') {
      setExpandedSections(new Set(['thispc', 'devices']));
    }
    if (currentView === 'drive' || currentView === 'desktop' || currentView === 'documents' || currentView === 'pictures' || currentView === 'music' || currentView === 'videos') {
      setViewMode('details');
    }
  }, [currentView]);

  // Get recent files (files accessed in last 7 days, sorted by lastAccessed)
  const getRecentFiles = (): File[] => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return files
      .filter((file) => new Date(file.lastAccessed) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
      .slice(0, 20);
  };

  const recentFiles = getRecentFiles();

  // Navigation functions
  const navigateTo = (directoryId: string | null, path: string | null) => {
    setCurrentDirectory(directoryId);
    setCurrentView('folder');
    setCurrentPath(path || 'Home');
    
    // Add to history
    const newHistory = navigationHistory.slice(0, historyIndex + 1);
    newHistory.push({ path: path || 'Home', directoryId });
    setNavigationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const navigateBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const historyItem = navigationHistory[newIndex];
      setHistoryIndex(newIndex);
      setCurrentDirectory(historyItem.directoryId);
      setCurrentPath(historyItem.path || 'Home');
      if (historyItem.path === 'Home') {
        setCurrentView('home');
      } else if (historyItem.path === 'This PC') {
        setCurrentView('thispc');
      } else if (historyItem.path === 'Desktop') {
        setCurrentView('desktop');
      } else if (historyItem.path === 'Documents') {
        setCurrentView('documents');
      } else if (historyItem.path === 'Pictures') {
        setCurrentView('pictures');
      } else if (historyItem.path === 'Music') {
        setCurrentView('music');
      } else if (historyItem.path === 'Videos') {
        setCurrentView('videos');
      } else if (historyItem.directoryId?.startsWith('drive-')) {
        setCurrentView('drive');
      } else {
        setCurrentView('folder');
      }
    }
  };

  const navigateForward = () => {
    if (historyIndex < navigationHistory.length - 1) {
      const newIndex = historyIndex + 1;
      const historyItem = navigationHistory[newIndex];
      setHistoryIndex(newIndex);
      setCurrentDirectory(historyItem.directoryId);
      setCurrentPath(historyItem.path || 'Home');
      if (historyItem.path === 'Home') {
        setCurrentView('home');
      } else if (historyItem.path === 'This PC') {
        setCurrentView('thispc');
      } else if (historyItem.path === 'Desktop') {
        setCurrentView('desktop');
      } else if (historyItem.path === 'Documents') {
        setCurrentView('documents');
      } else if (historyItem.path === 'Pictures') {
        setCurrentView('pictures');
      } else if (historyItem.path === 'Music') {
        setCurrentView('music');
      } else if (historyItem.path === 'Videos') {
        setCurrentView('videos');
      } else if (historyItem.directoryId?.startsWith('drive-')) {
        setCurrentView('drive');
      } else {
        setCurrentView('folder');
      }
    }
  };

  const navigateUp = () => {
    if (currentDirectory) {
      const currentFile = getFileById(currentDirectory);
      if (currentFile?.parentId) {
        const parent = getFileById(currentFile.parentId);
        navigateTo(currentFile.parentId, parent?.name || 'Home');
      } else {
        navigateTo(null, 'Home');
        setCurrentView('home');
      }
    } else {
      navigateTo(null, 'Home');
      setCurrentView('home');
    }
  };

  const navigateHome = () => {
    navigateTo(null, 'Home');
    setCurrentView('home');
  };

  const navigateToThisPC = () => {
    setCurrentView('thispc');
    setCurrentPath('This PC');
    setCurrentDirectory(null);
    // Add to history
    const newHistory = navigationHistory.slice(0, historyIndex + 1);
    newHistory.push({ path: 'This PC', directoryId: null });
    setNavigationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleQuickAccessClick = (item: typeof fileExplorerConfig.quickAccessItems[0]) => {
    if (item.type === 'app') {
      // Launch app
      const app = appConfig.taskbarApps.find((a) => a.id === item.id);
      if (app) {
        if (item.id === 'Terminal') {
          addWindow('Terminal', <Terminal />, 800, 500, app.icon);
        } else if (item.id === 'Mail') {
          addWindow('Mail', <Mail />, 1200, 800, app.icon);
        } else if (item.id === 'Music') {
          addWindow('Music', <MusicPlayer />, 900, 600, app.icon);
        } else if (item.id === 'aboutMe') {
          addWindow('aboutMe', <AboutMe />, 1000, 700, app.icon);
        } else if (item.id === 'GoogleChrome') {
          addWindow('GoogleChrome', <Chrome />, 1200, 800, app.icon);
        } else if (item.id === 'Photos') {
          addWindow('Photos', <Photos />, 1000, 700, app.icon);
        } else {
          addWindow(
            item.id,
            <div className="p-4 flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">{app.name}</h2>
                <p className="text-sm text-gray-500">App component coming soon</p>
              </div>
            </div>,
            800,
            600,
            app.icon
          );
        }
      }
    } else if (item.id === 'desktop') {
      // Navigate to desktop view
      setCurrentView('desktop');
      setCurrentPath('Desktop');
      setCurrentDirectory(null);
      // Add to history
      const newHistory = navigationHistory.slice(0, historyIndex + 1);
      newHistory.push({ path: 'Desktop', directoryId: null });
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } else if (item.id === 'downloads') {
      // Navigate to Downloads folder (always empty)
      const folder = files.find((f) => f.name === 'Downloads' && f.type === 'folder');
      if (folder) {
        navigateTo(folder.id, 'Downloads');
      } else {
        // Create Downloads folder if it doesn't exist
        addFile({
          name: 'Downloads',
          type: 'folder',
          parentId: null,
        });
        // Navigate after creation
        setTimeout(() => {
          const newFolder = files.find((f) => f.name === 'Downloads' && f.type === 'folder');
          if (newFolder) {
            navigateTo(newFolder.id, 'Downloads');
          }
        }, 100);
      }
    } else if (item.id === 'documents') {
      // Navigate to Documents view
      setCurrentView('documents');
      setCurrentPath('Documents');
      setCurrentDirectory(null);
      // Add to history
      const newHistory = navigationHistory.slice(0, historyIndex + 1);
      newHistory.push({ path: 'Documents', directoryId: null });
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } else if (item.id === 'pictures') {
      // Navigate to Pictures view
      setCurrentView('pictures');
      setCurrentPath('Pictures');
      setCurrentDirectory(null);
      // Add to history
      const newHistory = navigationHistory.slice(0, historyIndex + 1);
      newHistory.push({ path: 'Pictures', directoryId: null });
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } else if (item.id === 'music') {
      // Navigate to Music view
      setCurrentView('music');
      setCurrentPath('Music');
      setCurrentDirectory(null);
      // Add to history
      const newHistory = navigationHistory.slice(0, historyIndex + 1);
      newHistory.push({ path: 'Music', directoryId: null });
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } else if (item.id === 'videos') {
      // Navigate to Videos view
      setCurrentView('videos');
      setCurrentPath('Videos');
      setCurrentDirectory(null);
      // Add to history
      const newHistory = navigationHistory.slice(0, historyIndex + 1);
      newHistory.push({ path: 'Videos', directoryId: null });
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } else if (item.type === 'folder' || item.type === 'drive') {
      // Navigate to folder
      const folder = files.find((f) => f.name === item.path?.split('\\').pop() && f.type === 'folder');
      if (folder) {
        navigateTo(folder.id, item.path || item.name);
      } else {
        // Create folder if it doesn't exist
        const folderName = item.path?.split('\\').pop() || item.name;
        addFile({
          name: folderName,
          type: 'folder',
          parentId: null,
        });
        // Navigate after creation
        setTimeout(() => {
          const newFolder = files.find((f) => f.name === folderName && f.type === 'folder');
          if (newFolder) {
            navigateTo(newFolder.id, item.path || item.name);
          }
        }, 100);
      }
    }
  };

  const handleFileClick = (file: File) => {
    if (file.type === 'folder') {
      navigateTo(file.id, file.name);
      // Update last accessed
      updateFile(file.id, { lastAccessed: new Date() });
    } else {
      // Open file (placeholder for now)
      updateFile(file.id, { lastAccessed: new Date() });
    }
  };

  const handleNewFolder = () => {
    const folderName = `New Folder${files.filter((f) => f.name.startsWith('New Folder')).length > 0 ? ` (${files.filter((f) => f.name.startsWith('New Folder')).length})` : ''}`;
    addFile({
      name: folderName,
      type: 'folder',
      parentId: currentDirectory,
    });
  };

  const handleNewFile = () => {
    const fileName = `New File${files.filter((f) => f.name.startsWith('New File')).length > 0 ? ` (${files.filter((f) => f.name.startsWith('New File')).length})` : ''}.txt`;
    addFile({
      name: fileName,
      type: 'file',
      parentId: currentDirectory,
      content: '',
    });
  };

  const handleDelete = () => {
    selectedItems.forEach((id) => {
      deleteFile(id);
    });
    setSelectedItems(new Set());
  };

  const handleCopy = () => {
    const itemsToCopy = Array.from(selectedItems)
      .map((id) => getFileById(id))
      .filter((f): f is File => f !== undefined);
    setCopiedItems(itemsToCopy);
    setIsCutting(false);
  };

  const handleCut = () => {
    const itemsToCut = Array.from(selectedItems)
      .map((id) => getFileById(id))
      .filter((f): f is File => f !== undefined);
    setCopiedItems(itemsToCut);
    setIsCutting(true);
  };

  const handlePaste = () => {
    copiedItems.forEach((file) => {
      if (isCutting) {
        updateFile(file.id, { parentId: currentDirectory });
      } else {
        addFile({
          name: `${file.name} (copy)`,
          type: file.type,
          parentId: currentDirectory,
          content: file.content,
        });
      }
    });
    setCopiedItems([]);
    setIsCutting(false);
  };

  const currentFiles = currentView === 'home' || currentView === 'drive' || currentView === 'thispc' || currentView === 'desktop' || currentView === 'documents' || currentView === 'pictures' || currentView === 'music' || currentView === 'videos' ? [] : getChildren(currentDirectory);
  const filteredFiles = currentFiles.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < navigationHistory.length - 1;

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] dark:bg-[#1a1a1a] text-white overflow-hidden">
      {/* Navigation Bar */}
      <div className="flex items-center gap-0.5 md:gap-1 px-1 md:px-2 py-1 md:py-1.5 border-b border-[#3a3a3a] dark:border-[#3a3a3a] bg-[#252525] dark:bg-[#252525]">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-2 rounded hover:bg-[rgba(255,255,255,0.1)] active:bg-[rgba(255,255,255,0.15)] transition-colors touch-manipulation"
          aria-label="Toggle Sidebar"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          onClick={navigateBack}
          disabled={!canGoBack}
          className={`p-2 md:p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] active:bg-[rgba(255,255,255,0.15)] transition-colors touch-manipulation ${
            !canGoBack ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Back"
        >
          <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
        <button
          onClick={navigateForward}
          disabled={!canGoForward}
          className={`p-2 md:p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] active:bg-[rgba(255,255,255,0.15)] transition-colors touch-manipulation ${
            !canGoForward ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Forward"
        >
          <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
        <button
          onClick={navigateUp}
          className="hidden sm:block p-1 md:p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors"
          aria-label="Up"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            // Refresh current view
            setCurrentDirectory(currentDirectory);
          }}
          className="p-1 md:p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors"
          aria-label="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
        <div className="hidden md:flex items-center gap-1 px-2 flex-1 min-w-0">
          <Home className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-300"> &gt; </span>
          <input
            ref={addressBarRef}
            type="text"
            value={currentPath}
            onChange={(e) => setCurrentPath(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                // Handle path navigation
                addressBarRef.current?.blur();
              }
            }}
            className="flex-1 bg-transparent text-sm text-white outline-none px-1"
          />
        </div>
        <div className="relative flex items-center flex-1 md:flex-none min-w-0">
          <Search className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 absolute left-2 pointer-events-none flex-shrink-0" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-48 h-8 sm:h-7 pl-7 md:pl-8 pr-2 rounded bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] focus:bg-[rgba(255,255,255,0.15)] border border-transparent focus:border-[rgba(255,255,255,0.2)] text-white placeholder-gray-400 text-sm outline-none transition-all touch-manipulation"
          />
        </div>
      </div>

      {/* Toolbar - scroll horizontally on mobile */}
      <div className="flex items-center gap-0.5 sm:gap-1 px-2 py-1 border-b border-[#3a3a3a] dark:border-[#3a3a3a] bg-[#252525] dark:bg-[#252525] overflow-x-auto overflow-y-hidden min-h-[40px] touch-manipulation">
        <div className="flex items-center flex-nowrap gap-0.5 sm:gap-1">
        <div className="relative group flex-shrink-0">
          <button className="px-2 sm:px-3 py-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] active:bg-[rgba(255,255,255,0.15)] transition-colors flex items-center gap-1 text-xs sm:text-sm">
            New
            <ChevronDown className="w-3 h-3" />
          </button>
          <div className="absolute top-full left-0 mt-1 bg-[#2d2d2d] border border-[#3a3a3a] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[150px]">
            <button
              onClick={handleNewFolder}
              className="w-full px-3 py-2 text-left text-sm hover:bg-[rgba(255,255,255,0.1)] flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              Folder
            </button>
            <button
              onClick={handleNewFile}
              className="w-full px-3 py-2 text-left text-sm hover:bg-[rgba(255,255,255,0.1)] flex items-center gap-2"
            >
              <FilePlus className="w-4 h-4" />
              File
            </button>
          </div>
        </div>
        <div className="w-px h-5 sm:h-6 bg-[#3a3a3a] mx-0.5 sm:mx-1 flex-shrink-0" />
        <button
          onClick={handleCut}
          disabled={selectedItems.size === 0}
          className={`p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] active:bg-[rgba(255,255,255,0.15)] transition-colors flex-shrink-0 touch-manipulation ${
            selectedItems.size === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Cut"
        >
          <Scissors className="w-4 h-4" />
        </button>
        <button
          onClick={handleCopy}
          disabled={selectedItems.size === 0}
          className={`p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] active:bg-[rgba(255,255,255,0.15)] transition-colors flex-shrink-0 ${
            selectedItems.size === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Copy"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={handlePaste}
          disabled={copiedItems.length === 0}
          className={`p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] active:bg-[rgba(255,255,255,0.15)] transition-colors flex-shrink-0 ${
            copiedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Paste"
        >
          <Clipboard className="w-4 h-4" />
        </button>
        <button
          disabled={selectedItems.size === 0}
          className={`p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors flex-shrink-0 ${
            selectedItems.size === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Rename"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          disabled={selectedItems.size === 0}
          className={`p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors flex-shrink-0 hidden sm:flex ${
            selectedItems.size === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Share"
        >
          <Share2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          disabled={selectedItems.size === 0}
          className={`p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] active:bg-[rgba(255,255,255,0.15)] transition-colors flex-shrink-0 ${
            selectedItems.size === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <div className="w-px h-5 sm:h-6 bg-[#3a3a3a] mx-0.5 sm:mx-1 flex-shrink-0" />
        <div className="relative group flex-shrink-0 hidden sm:block">
          <button className="px-2 sm:px-3 py-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors flex items-center gap-1 text-xs sm:text-sm">
            Sort
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
        <div className="relative group flex-shrink-0">
          <button className="px-2 sm:px-3 py-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] active:bg-[rgba(255,255,255,0.15)] transition-colors flex items-center gap-1 text-xs sm:text-sm">
            View
            <ChevronDown className="w-3 h-3" />
          </button>
          <div className="absolute top-full left-0 mt-1 bg-[#2d2d2d] border border-[#3a3a3a] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[120px]">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-[rgba(255,255,255,0.1)] flex items-center gap-2 ${
                viewMode === 'grid' ? 'bg-[rgba(0,120,212,0.2)]' : ''
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-[rgba(255,255,255,0.1)] flex items-center gap-2 ${
                viewMode === 'list' ? 'bg-[rgba(0,120,212,0.2)]' : ''
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setViewMode('details')}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-[rgba(255,255,255,0.1)] flex items-center gap-2 ${
                viewMode === 'details' ? 'bg-[rgba(0,120,212,0.2)]' : ''
              }`}
            >
              <ArrowUpDown className="w-4 h-4" />
              Details
            </button>
          </div>
        </div>
        <div className="relative group flex-shrink-0 hidden sm:block">
          <button className="px-2 sm:px-3 py-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors flex items-center gap-1 text-xs sm:text-sm">
            Filter
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
        <button className="p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] active:bg-[rgba(255,255,255,0.15)] transition-colors flex-shrink-0 touch-manipulation" aria-label="More">
          <MoreHorizontal className="w-4 h-4" />
        </button>
        <button className="px-2 sm:px-3 py-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] active:bg-[rgba(255,255,255,0.15)] transition-colors text-xs sm:text-sm flex-shrink-0">
          Details
        </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Navigation Pane - overlay on mobile, inline on md+ */}
        <div className={`absolute md:relative z-20 w-[min(16rem,85vw)] md:w-64 h-full border-r border-[#3a3a3a] dark:border-[#3a3a3a] bg-[#1a1a1a] dark:bg-[#1a1a1a] flex flex-col transition-transform duration-300 shadow-xl md:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          {/* Mobile Close Button */}
          <div className="md:hidden flex items-center justify-between p-3 border-b border-[#3a3a3a] flex-shrink-0">
            <span className="text-sm text-white font-medium">Navigation</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded hover:bg-[rgba(255,255,255,0.1)] active:bg-[rgba(255,255,255,0.15)] touch-manipulation"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {/* Pinned Items */}
            <div className="space-y-0.5">
              {fileExplorerConfig.pinnedNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'desktop') {
                      // Navigate to desktop view
                      setCurrentView('desktop');
                      setCurrentPath('Desktop');
                      setCurrentDirectory(null);
                      // Add to history
                      const newHistory = navigationHistory.slice(0, historyIndex + 1);
                      newHistory.push({ path: 'Desktop', directoryId: null });
                      setNavigationHistory(newHistory);
                      setHistoryIndex(newHistory.length - 1);
                    } else if (item.id === 'downloads') {
                      // Navigate to Downloads folder (always empty)
                      const folder = files.find((f) => f.name === 'Downloads' && f.type === 'folder');
                      if (folder) {
                        navigateTo(folder.id, 'Downloads');
                      } else {
                        // Create Downloads folder if it doesn't exist
                        addFile({
                          name: 'Downloads',
                          type: 'folder',
                          parentId: null,
                        });
                        // Navigate after creation
                        setTimeout(() => {
                          const newFolder = files.find((f) => f.name === 'Downloads' && f.type === 'folder');
                          if (newFolder) {
                            navigateTo(newFolder.id, 'Downloads');
                          }
                        }, 100);
                      }
                    } else if (item.id === 'documents') {
                      // Navigate to Documents view
                      setCurrentView('documents');
                      setCurrentPath('Documents');
                      setCurrentDirectory(null);
                      // Add to history
                      const newHistory = navigationHistory.slice(0, historyIndex + 1);
                      newHistory.push({ path: 'Documents', directoryId: null });
                      setNavigationHistory(newHistory);
                      setHistoryIndex(newHistory.length - 1);
                    } else if (item.id === 'pictures') {
                      // Navigate to Pictures view
                      setCurrentView('pictures');
                      setCurrentPath('Pictures');
                      setCurrentDirectory(null);
                      // Add to history
                      const newHistory = navigationHistory.slice(0, historyIndex + 1);
                      newHistory.push({ path: 'Pictures', directoryId: null });
                      setNavigationHistory(newHistory);
                      setHistoryIndex(newHistory.length - 1);
                    } else if (item.id === 'music') {
                      // Navigate to Music view
                      setCurrentView('music');
                      setCurrentPath('Music');
                      setCurrentDirectory(null);
                      // Add to history
                      const newHistory = navigationHistory.slice(0, historyIndex + 1);
                      newHistory.push({ path: 'Music', directoryId: null });
                      setNavigationHistory(newHistory);
                      setHistoryIndex(newHistory.length - 1);
                    } else if (item.id === 'videos') {
                      // Navigate to Videos view
                      setCurrentView('videos');
                      setCurrentPath('Videos');
                      setCurrentDirectory(null);
                      // Add to history
                      const newHistory = navigationHistory.slice(0, historyIndex + 1);
                      newHistory.push({ path: 'Videos', directoryId: null });
                      setNavigationHistory(newHistory);
                      setHistoryIndex(newHistory.length - 1);
                    } else if (item.type === 'folder' || item.type === 'drive') {
                      const folder = files.find((f) => f.name === item.name && f.type === 'folder');
                      if (folder) {
                        navigateTo(folder.id, item.name);
                      }
                    }
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-2.5 sm:py-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] active:bg-[rgba(255,255,255,0.15)] transition-colors group touch-manipulation ${
                    (currentView === 'desktop' && item.id === 'desktop') || 
                    (currentView === 'documents' && item.id === 'documents') ||
                    (currentView === 'pictures' && item.id === 'pictures') ||
                    (currentView === 'music' && item.id === 'music') ||
                    (currentView === 'videos' && item.id === 'videos') ? 'bg-[rgba(0,120,212,0.2)]' : ''
                  }`}
                >
                  {item.type === 'drive' ? (
                    <Image
                      src="/icons/drives/c.png"
                      alt={item.name}
                      width={16}
                      height={16}
                      className="flex-shrink-0"
                      unoptimized
                    />
                  ) : (
                    <Image
                      src={item.icon || '/icons/folder/folder.png'}
                      alt={item.name}
                      width={16}
                      height={16}
                      className="flex-shrink-0"
                      unoptimized
                    />
                  )}
                  <span className="text-sm text-gray-300 flex-1 text-left truncate">{item.name}</span>
                </button>
              ))}
            </div>

            {/* Expandable Sections */}
            <div className="mt-4 space-y-0.5">
              <button
                onClick={() => {
                  // Navigate to This PC view
                  navigateToThisPC();
                }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors ${
                  currentView === 'thispc' ? 'bg-[rgba(0,120,212,0.2)]' : ''
                }`}
              >
                <ChevronRight
                  className={`w-3 h-3 text-gray-400 transition-transform cursor-pointer ${
                    expandedSections.has('thispc') ? 'rotate-90' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const newExpanded = new Set(expandedSections);
                    if (newExpanded.has('thispc')) {
                      newExpanded.delete('thispc');
                    } else {
                      newExpanded.add('thispc');
                    }
                    setExpandedSections(newExpanded);
                  }}
                />
                <Image
                  src="/icons/this-pc/this-pc.png"
                  alt="This PC"
                  width={16}
                  height={16}
                  className="w-4 h-4 object-contain flex-shrink-0"
                  unoptimized
                />
                <span className="text-sm text-gray-300 flex-1 text-left">This PC</span>
              </button>
              {/* Drive items under This PC */}
              {expandedSections.has('thispc') && (
                <div className="ml-4 space-y-0.5">
                  {drives.map((drive) => (
                    <button
                      key={drive.id}
                      onClick={() => {
                        setCurrentView('drive');
                        setCurrentPath(drive.name);
                        setCurrentDirectory(`drive-${drive.id}`);
                        // Add to history
                        const newHistory = navigationHistory.slice(0, historyIndex + 1);
                        newHistory.push({ path: drive.name, directoryId: `drive-${drive.id}` });
                        setNavigationHistory(newHistory);
                        setHistoryIndex(newHistory.length - 1);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                    >
                      <ChevronRight className="w-3 h-3 text-gray-400 opacity-0" />
                      <Image
                        src={drive.icon}
                        alt={drive.name}
                        width={16}
                        height={16}
                        className="w-4 h-4 object-contain flex-shrink-0"
                        unoptimized
                      />
                      <span className="text-sm text-gray-300 flex-1 text-left truncate">{drive.name}</span>
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => {
                  const newExpanded = new Set(expandedSections);
                  if (newExpanded.has('network')) {
                    newExpanded.delete('network');
                  } else {
                    newExpanded.add('network');
                  }
                  setExpandedSections(newExpanded);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors"
              >
                <ChevronRight
                  className={`w-3 h-3 text-gray-400 transition-transform ${
                    expandedSections.has('network') ? 'rotate-90' : ''
                  }`}
                />
                <Network className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Network</span>
              </button>
            </div>
          </div>
          <div className="px-2 py-1 border-t border-[#3a3a3a] dark:border-[#3a3a3a] bg-[#1a1a1a] dark:bg-[#1a1a1a] flex-shrink-0">
            <span className="text-xs text-gray-400">
              {currentView === 'home'
                ? fileExplorerConfig.quickAccessItems.length
                : currentView === 'thispc'
                ? drives.length
                : currentView === 'drive'
                ? getDriveContents(currentDirectory?.replace('drive-', '') || 'c').length
                : currentView === 'desktop'
                ? getDesktopApplications().length
                : currentView === 'documents'
                ? getDocumentsContents().length
                : currentView === 'pictures'
                ? 0 // Pictures shows Photos component, no file count
                : currentView === 'music'
                ? 0 // Music shows Music component, no file count
                : currentView === 'videos'
                ? 0 // Videos shows Video component, no file count
                : filteredFiles.length}{' '}
              items
            </span>
          </div>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-10"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-[#1a1a1a] dark:bg-[#1a1a1a]">
          {currentView === 'thispc' ? (
            <div className="p-2 md:p-4">
              {/* Devices and drives section */}
              <div className="mb-4">
                <button
                  onClick={() => {
                    const newExpanded = new Set(expandedSections);
                    if (newExpanded.has('devices')) {
                      newExpanded.delete('devices');
                    } else {
                      newExpanded.add('devices');
                    }
                    setExpandedSections(newExpanded);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 mb-2 hover:bg-[rgba(255,255,255,0.05)] rounded transition-colors"
                >
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      expandedSections.has('devices') ? '' : '-rotate-90'
                    }`}
                  />
                  <span className="text-sm font-semibold text-gray-300">Devices and drives</span>
                </button>
                {expandedSections.has('devices') && (
                  <div className="pl-4 sm:pl-6 flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6">
                    {drives.map((drive) => {
                      const usedGB = drive.totalGB - drive.freeGB;
                      const usedPercent = (usedGB / drive.totalGB) * 100;
                      return (
                        <div
                          key={drive.id}
                          onClick={() => {
                            setCurrentView('drive');
                            setCurrentPath(drive.name);
                            setCurrentDirectory(`drive-${drive.id}`);
                            // Add to history
                            const newHistory = navigationHistory.slice(0, historyIndex + 1);
                            newHistory.push({ path: drive.name, directoryId: `drive-${drive.id}` });
                            setNavigationHistory(newHistory);
                            setHistoryIndex(newHistory.length - 1);
                          }}
                          className="flex items-start gap-3 py-3 px-1 rounded hover:bg-[rgba(255,255,255,0.05)] active:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer group touch-manipulation min-w-0 sm:min-w-[280px] sm:flex-[0_1_auto]"
                        >
                          <div className="flex flex-col items-center flex-shrink-0 w-12 sm:w-14">
                            <div className="relative">
                              <Image
                                src={drive.icon}
                                alt={drive.name}
                                width={48}
                                height={48}
                                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                                unoptimized
                              />
                              {drive.hasWindowsLogo && (
                                <div className="absolute -top-0.5 -left-0.5 w-3.5 h-3.5 bg-[#0078D4] rounded-sm flex items-center justify-center shadow-sm">
                                  <span className="text-[7px] text-white font-bold leading-none">W</span>
                                </div>
                              )}
                            </div>
                            <div className="w-2 h-2 bg-green-500 rounded-full border border-[#1a1a1a] mt-0.5"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-200 mb-2 truncate">{drive.name}</div>
                            <div className="w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden mb-1.5">
                              <div
                                className="h-full bg-[#0078D4] transition-all duration-300"
                                style={{ width: `${usedPercent}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-400">
                              {drive.freeGB.toFixed(1)} GB free of {drive.totalGB} GB
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : currentView === 'drive' ? (
            <div className="p-2 md:p-4">
              {/* Drive contents in details view */}
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full min-w-[320px]">
                  <thead>
                    <tr className="border-b border-[#3a3a3a]">
                      <th className="text-left py-2 px-2 sm:px-4 text-xs font-semibold text-gray-400 cursor-pointer hover:bg-[rgba(255,255,255,0.05)] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          Name
                          <ChevronUp className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="text-left py-2 px-2 sm:px-4 text-xs font-semibold text-gray-400 cursor-pointer hover:bg-[rgba(255,255,255,0.05)] whitespace-nowrap hidden sm:table-cell">Date modified</th>
                      <th className="text-left py-2 px-2 sm:px-4 text-xs font-semibold text-gray-400 cursor-pointer hover:bg-[rgba(255,255,255,0.05)] whitespace-nowrap hidden md:table-cell">Type</th>
                      <th className="text-left py-2 px-2 sm:px-4 text-xs font-semibold text-gray-400 cursor-pointer hover:bg-[rgba(255,255,255,0.05)] whitespace-nowrap hidden lg:table-cell">Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getDriveContents(currentDirectory?.replace('drive-', '') || 'c').map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-[rgba(255,255,255,0.05)] active:bg-[rgba(255,255,255,0.08)] cursor-pointer touch-manipulation"
                        onClick={() => {
                          if (item.type === 'Application' && item.id) {
                            // Launch application
                            const app = appConfig.taskbarApps.find((a) => a.id === item.id);
                            if (app) {
                              if (item.id === 'Terminal') {
                                addWindow('Terminal', <Terminal />, 800, 500, app.icon);
                              } else if (item.id === 'Mail') {
                                addWindow('Mail', <Mail />, 1200, 800, app.icon);
                              } else if (item.id === 'Music') {
                                addWindow('Music', <MusicPlayer />, 900, 600, app.icon);
                              } else if (item.id === 'aboutMe') {
                                addWindow('aboutMe', <AboutMe />, 1000, 700, app.icon);
                              } else if (item.id === 'GoogleChrome') {
                                addWindow('GoogleChrome', <Chrome />, 1200, 800, app.icon);
                              } else if (item.id === 'Photos') {
                                addWindow('Photos', <Photos />, 1000, 700, app.icon);
                              } else {
                                addWindow(
                                  item.id,
                                  <div className="p-4 flex items-center justify-center h-full">
                                    <div className="text-center">
                                      <h2 className="text-xl font-semibold mb-2">{app.name}</h2>
                                      <p className="text-sm text-gray-500">App component coming soon</p>
                                    </div>
                                  </div>,
                                  800,
                                  600,
                                  app.icon
                                );
                              }
                            }
                          }
                        }}
                      >
                        <td className="py-2 px-2 sm:px-4 flex items-center gap-2 min-w-0">
                          {item.type === 'File folder' ? (
                            <Image
                              src="/icons/folder/folder.png"
                              alt={item.name}
                              width={16}
                              height={16}
                              className="w-4 h-4 object-contain flex-shrink-0"
                              unoptimized
                            />
                          ) : item.type === 'Application' && item.icon ? (
                            <Image
                              src={item.icon}
                              alt={item.name}
                              width={16}
                              height={16}
                              className="w-4 h-4 object-contain flex-shrink-0"
                              unoptimized
                            />
                          ) : (
                            <FileText className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-sm text-gray-300 truncate">{item.name}</span>
                        </td>
                        <td className="py-2 px-2 sm:px-4 text-sm text-gray-400 hidden sm:table-cell whitespace-nowrap">{item.dateModified}</td>
                        <td className="py-2 px-2 sm:px-4 text-sm text-gray-400 hidden md:table-cell">{item.type}</td>
                        <td className="py-2 px-2 sm:px-4 text-sm text-gray-400 hidden lg:table-cell">{item.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : currentView === 'desktop' ? (
            <div className="p-2 md:p-4">
              {/* Desktop applications in details view */}
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full min-w-[320px]">
                  <thead>
                    <tr className="border-b border-[#3a3a3a]">
                      <th className="text-left py-2 px-2 sm:px-4 text-xs font-semibold text-gray-400 cursor-pointer hover:bg-[rgba(255,255,255,0.05)] whitespace-nowrap">Name</th>
                      <th className="text-left py-2 px-2 sm:px-4 text-xs font-semibold text-gray-400 cursor-pointer hover:bg-[rgba(255,255,255,0.05)] whitespace-nowrap hidden sm:table-cell">Date modified</th>
                      <th className="text-left py-2 px-2 sm:px-4 text-xs font-semibold text-gray-400 cursor-pointer hover:bg-[rgba(255,255,255,0.05)] hidden md:table-cell">Type</th>
                      <th className="text-left py-2 px-2 sm:px-4 text-xs font-semibold text-gray-400 cursor-pointer hover:bg-[rgba(255,255,255,0.05)] hidden lg:table-cell">Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getDesktopApplications().map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-[rgba(255,255,255,0.05)] active:bg-[rgba(255,255,255,0.08)] cursor-pointer touch-manipulation"
                        onClick={() => {
                          if (item.type === 'Application' && item.id) {
                            // Launch application
                            const app = appConfig.taskbarApps.find((a) => a.id === item.id);
                            if (app) {
                              if (item.id === 'Terminal') {
                                addWindow('Terminal', <Terminal />, 800, 500, app.icon);
                              } else if (item.id === 'Mail') {
                                addWindow('Mail', <Mail />, 1200, 800, app.icon);
                              } else if (item.id === 'Music') {
                                addWindow('Music', <MusicPlayer />, 900, 600, app.icon);
                              } else if (item.id === 'aboutMe') {
                                addWindow('aboutMe', <AboutMe />, 1000, 700, app.icon);
                              } else if (item.id === 'GoogleChrome') {
                                addWindow('GoogleChrome', <Chrome />, 1200, 800, app.icon);
                              } else if (item.id === 'Photos') {
                                addWindow('Photos', <Photos />, 1000, 700, app.icon);
                              } else {
                                addWindow(
                                  item.id,
                                  <div className="p-4 flex items-center justify-center h-full">
                                    <div className="text-center">
                                      <h2 className="text-xl font-semibold mb-2">{app.name}</h2>
                                      <p className="text-sm text-gray-500">App component coming soon</p>
                                    </div>
                                  </div>,
                                  800,
                                  600,
                                  app.icon
                                );
                              }
                            }
                          }
                        }}
                      >
                        <td className="py-2 px-2 sm:px-4 flex items-center gap-2 min-w-0">
                          {item.type === 'Application' && item.icon ? (
                            <Image
                              src={item.icon}
                              alt={item.name}
                              width={16}
                              height={16}
                              className="w-4 h-4 object-contain flex-shrink-0"
                              unoptimized
                            />
                          ) : (
                            <FileText className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-sm text-gray-300 truncate">{item.name}</span>
                        </td>
                        <td className="py-2 px-2 sm:px-4 text-sm text-gray-400 hidden sm:table-cell whitespace-nowrap">{item.dateModified}</td>
                        <td className="py-2 px-2 sm:px-4 text-sm text-gray-400 hidden md:table-cell">{item.type}</td>
                        <td className="py-2 px-2 sm:px-4 text-sm text-gray-400 hidden lg:table-cell">{item.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : currentView === 'documents' ? (
            <div className="p-2 md:p-4">
              {/* Documents folder contents in details view */}
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full min-w-[280px]">
                  <thead>
                    <tr className="border-b border-[#3a3a3a]">
                      <th className="text-left py-2 px-2 sm:px-4 text-xs font-semibold text-gray-400 cursor-pointer hover:bg-[rgba(255,255,255,0.05)] whitespace-nowrap">Name</th>
                      <th className="text-left py-2 px-2 sm:px-4 text-xs font-semibold text-gray-400 cursor-pointer hover:bg-[rgba(255,255,255,0.05)] whitespace-nowrap hidden sm:table-cell">Date modified</th>
                      <th className="text-left py-2 px-2 sm:px-4 text-xs font-semibold text-gray-400 cursor-pointer hover:bg-[rgba(255,255,255,0.05)] hidden md:table-cell">Type</th>
                      <th className="text-left py-2 px-2 sm:px-4 text-xs font-semibold text-gray-400 cursor-pointer hover:bg-[rgba(255,255,255,0.05)] hidden lg:table-cell">Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getDocumentsContents().map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-[rgba(255,255,255,0.05)] active:bg-[rgba(255,255,255,0.08)] cursor-pointer touch-manipulation"
                        onClick={() => {
                          // Open PDF in Chrome browser
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
                      >
                        <td className="py-2 px-2 sm:px-4 flex items-center gap-2 min-w-0">
                          {item.icon ? (
                            <Image
                              src={item.icon}
                              alt={item.name}
                              width={16}
                              height={16}
                              className="w-4 h-4 object-contain flex-shrink-0"
                              unoptimized
                            />
                          ) : (
                            <FileText className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-sm text-gray-300 truncate">{item.name}</span>
                        </td>
                        <td className="py-2 px-2 sm:px-4 text-sm text-gray-400 hidden sm:table-cell whitespace-nowrap">{item.dateModified}</td>
                        <td className="py-2 px-2 sm:px-4 text-sm text-gray-400 hidden md:table-cell">{item.type}</td>
                        <td className="py-2 px-2 sm:px-4 text-sm text-gray-400 hidden lg:table-cell">{item.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : currentView === 'pictures' ? (
            <div className="w-full h-full">
              <Photos />
            </div>
          ) : currentView === 'music' ? (
            <div className="w-full h-full">
              <MusicPlayer />
            </div>
          ) : currentView === 'videos' ? (
            <div className="w-full h-full">
              <VideoPlayer />
            </div>
          ) : currentView === 'home' ? (
            <div className="p-2 md:p-4">
              {/* Quick Access Section */}
              <div className="mb-4">
                <h2 className="text-xs md:text-sm font-semibold text-gray-300 mb-2 md:mb-3">Quick access</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 md:gap-2">
                  {fileExplorerConfig.quickAccessItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleQuickAccessClick(item)}
                      className="flex flex-col items-center gap-1 p-2 rounded hover:bg-[rgba(255,255,255,0.1)] active:bg-[rgba(255,255,255,0.15)] transition-colors group touch-manipulation"
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center overflow-hidden border border-[rgba(255,255,255,0.1)]">
                        {item.type === 'app' ? (
                          <Image
                            src={item.icon}
                            alt={item.name}
                            width={40}
                            height={40}
                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                            unoptimized
                          />
                        ) : item.type === 'drive' ? (
                          <Image
                            src="/icons/drives/c.png"
                            alt={item.name}
                            width={32}
                            height={32}
                            className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                            unoptimized
                          />
                        ) : (
                          <Image
                            src={item.icon || '/icons/folder/folder.png'}
                            alt={item.name}
                            width={32}
                            height={32}
                            className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                            unoptimized
                          />
                        )}
                      </div>
                      <div className="text-center min-w-0 w-full">
                        <div className="text-[10px] sm:text-xs text-gray-300 group-hover:text-white transition-colors truncate w-full">
                          {item.name}
                        </div>
                        {item.location && (
                          <div className="text-[10px] text-gray-500 mt-0.5">{item.location}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-0.5 sm:gap-1 border-b border-[#3a3a3a] mb-4 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('recent')}
                  className={`px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 sm:gap-2 flex-shrink-0 touch-manipulation ${
                    activeTab === 'recent'
                      ? 'text-white border-b-2 border-[#0078D4]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Recent
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 sm:gap-2 flex-shrink-0 touch-manipulation ${
                    activeTab === 'favorites'
                      ? 'text-white border-b-2 border-[#0078D4]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Favorites
                </button>
                <button
                  onClick={() => setActiveTab('shared')}
                  className={`px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 sm:gap-2 flex-shrink-0 touch-manipulation ${
                    activeTab === 'shared'
                      ? 'text-white border-b-2 border-[#0078D4]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Shared
                </button>
              </div>

              {/* Recent Files List */}
              {activeTab === 'recent' && (
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <table className="w-full min-w-[280px]">
                    <thead>
                      <tr className="border-b border-[#3a3a3a]">
                        <th className="text-left py-2 px-2 sm:px-4 text-xs font-semibold text-gray-400 whitespace-nowrap">Name</th>
                        <th className="text-left py-2 px-2 sm:px-4 text-xs font-semibold text-gray-400 whitespace-nowrap hidden sm:table-cell">Date accessed</th>
                        <th className="text-left py-2 px-2 sm:px-4 text-xs font-semibold text-gray-400 hidden md:table-cell">Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentFiles.slice(0, 10).map((file) => (
                        <tr
                          key={file.id}
                          className="border-b border-[#3a3a3a] hover:bg-[rgba(255,255,255,0.05)] active:bg-[rgba(255,255,255,0.08)] cursor-pointer touch-manipulation"
                          onClick={() => handleFileClick(file)}
                        >
                          <td className="py-2 px-2 sm:px-4 flex items-center gap-2 min-w-0">
                            {file.type === 'folder' ? (
                              <Image
                                src="/icons/folder/folder.png"
                                alt={file.name}
                                width={16}
                                height={16}
                                className="w-4 h-4 object-contain flex-shrink-0"
                                unoptimized
                              />
                            ) : (
                              <FileText className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="text-sm text-gray-300 truncate">{file.name}</span>
                          </td>
                          <td className="py-2 px-2 sm:px-4 text-sm text-gray-400 hidden sm:table-cell whitespace-nowrap">
                            {new Date(file.lastAccessed).toLocaleString()}
                          </td>
                          <td className="py-2 px-2 sm:px-4 text-sm text-gray-400 hidden md:table-cell">-</td>
                        </tr>
                      ))}
                      {recentFiles.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-8 px-4 text-center text-sm text-gray-400">
                            No recent files
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'favorites' && (
                <div className="py-8 text-center text-sm text-gray-400">No favorites yet</div>
              )}

              {activeTab === 'shared' && (
                <div className="py-8 text-center text-sm text-gray-400">No shared items</div>
              )}
            </div>
          ) : (
            <div className="p-2 md:p-4">
              {/* File List View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 sm:gap-2 md:gap-4">
                  {filteredFiles.map((file) => (
                    <button
                      key={file.id}
                      onClick={(e) => {
                        if (e.ctrlKey || e.metaKey) {
                          // Multi-select
                          const newSelected = new Set(selectedItems);
                          if (newSelected.has(file.id)) {
                            newSelected.delete(file.id);
                          } else {
                            newSelected.add(file.id);
                          }
                          setSelectedItems(newSelected);
                        } else if (e.shiftKey) {
                          // Range select
                          // For simplicity, just add to selection
                          const newSelected = new Set(selectedItems);
                          newSelected.add(file.id);
                          setSelectedItems(newSelected);
                        } else {
                          // Single select and open
                          setSelectedItems(new Set([file.id]));
                          handleFileClick(file);
                        }
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setSelectedItems(new Set([file.id]));
                      }}
                      className={`flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded transition-colors touch-manipulation active:bg-[rgba(255,255,255,0.15)] ${
                        selectedItems.has(file.id)
                          ? 'bg-[rgba(0,120,212,0.2)]'
                          : 'hover:bg-[rgba(255,255,255,0.1)]'
                      }`}
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center overflow-hidden border border-[rgba(255,255,255,0.1)] flex-shrink-0">
                        {file.type === 'folder' ? (
                          <Image
                            src="/icons/folder/folder.png"
                            alt={file.name}
                            width={32}
                            height={32}
                            className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                            unoptimized
                          />
                        ) : (
                          <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        )}
                      </div>
                      <span className="text-[10px] sm:text-xs text-gray-300 text-center truncate w-full">
                        {file.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {viewMode === 'list' && (
                <div className="space-y-1">
                  {filteredFiles.map((file) => (
                    <button
                      key={file.id}
                      onClick={(e) => {
                        if (e.ctrlKey || e.metaKey) {
                          const newSelected = new Set(selectedItems);
                          if (newSelected.has(file.id)) {
                            newSelected.delete(file.id);
                          } else {
                            newSelected.add(file.id);
                          }
                          setSelectedItems(newSelected);
                        } else {
                          setSelectedItems(new Set([file.id]));
                          handleFileClick(file);
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded transition-colors touch-manipulation active:bg-[rgba(255,255,255,0.15)] ${
                        selectedItems.has(file.id)
                          ? 'bg-[rgba(0,120,212,0.2)]'
                          : 'hover:bg-[rgba(255,255,255,0.1)]'
                      }`}
                    >
                      {file.type === 'folder' ? (
                        <Image
                          src="/icons/folder/folder.png"
                          alt={file.name}
                          width={20}
                          height={20}
                          className="w-5 h-5 object-contain flex-shrink-0"
                          unoptimized
                        />
                      ) : (
                        <FileText className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-300 truncate min-w-0">{file.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {viewMode === 'details' && (
                <>
                  {filteredFiles.length > 0 ? (
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                      <table className="w-full min-w-[280px]">
                        <thead>
                          <tr className="border-b border-[#3a3a3a]">
                            <th className="text-left py-2 px-2 sm:px-4 text-xs font-semibold text-gray-400 whitespace-nowrap">Name</th>
                            <th className="text-left py-2 px-2 sm:px-4 text-xs font-semibold text-gray-400 whitespace-nowrap hidden sm:table-cell">Date modified</th>
                            <th className="text-left py-2 px-2 sm:px-4 text-xs font-semibold text-gray-400 hidden md:table-cell">Type</th>
                            <th className="text-left py-2 px-2 sm:px-4 text-xs font-semibold text-gray-400 hidden lg:table-cell">Size</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredFiles.map((file) => (
                            <tr
                              key={file.id}
                              className={`border-b border-[#3a3a3a] hover:bg-[rgba(255,255,255,0.05)] active:bg-[rgba(255,255,255,0.08)] cursor-pointer touch-manipulation ${
                                selectedItems.has(file.id) ? 'bg-[rgba(0,120,212,0.2)]' : ''
                              }`}
                              onClick={(e) => {
                                if (e.ctrlKey || e.metaKey) {
                                  const newSelected = new Set(selectedItems);
                                  if (newSelected.has(file.id)) {
                                    newSelected.delete(file.id);
                                  } else {
                                    newSelected.add(file.id);
                                  }
                                  setSelectedItems(newSelected);
                                } else {
                                  setSelectedItems(new Set([file.id]));
                                  handleFileClick(file);
                                }
                              }}
                            >
                              <td className="py-2 px-2 sm:px-4 flex items-center gap-2 min-w-0">
                                {file.type === 'folder' ? (
                                  <Image
                                    src="/icons/folder/folder.png"
                                    alt={file.name}
                                    width={16}
                                    height={16}
                                    className="w-4 h-4 object-contain flex-shrink-0"
                                    unoptimized
                                  />
                                ) : (
                                  <FileText className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-sm text-gray-300 truncate">{file.name}</span>
                              </td>
                              <td className="py-2 px-2 sm:px-4 text-sm text-gray-400 hidden sm:table-cell whitespace-nowrap">
                                {new Date(file.lastAccessed).toLocaleString()}
                              </td>
                              <td className="py-2 px-2 sm:px-4 text-sm text-gray-400 hidden md:table-cell">
                                {file.type === 'folder' ? 'File folder' : 'File'}
                              </td>
                              <td className="py-2 px-2 sm:px-4 text-sm text-gray-400 hidden lg:table-cell">-</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-16 text-center text-sm text-gray-400">
                      {searchQuery ? 'No files match your search' : 'This folder is empty'}
                    </div>
                  )}
                </>
              )}

              {viewMode !== 'details' && filteredFiles.length === 0 && (
                <div className="py-16 text-center text-sm text-gray-400">
                  {searchQuery ? 'No files match your search' : 'This folder is empty'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

