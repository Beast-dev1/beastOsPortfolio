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
  Pin,
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

type ViewMode = 'grid' | 'list' | 'details';
type TabType = 'recent' | 'favorites' | 'shared';
type CurrentView = 'home' | 'folder';

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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [currentPath, setCurrentPath] = useState<string>('Home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const addressBarRef = useRef<HTMLInputElement>(null);

  // Initialize navigation history
  useEffect(() => {
    if (currentView === 'home') {
      setNavigationHistory([{ path: 'Home', directoryId: null }]);
      setHistoryIndex(0);
    }
  }, []);

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

  const handleQuickAccessClick = (item: typeof fileExplorerConfig.quickAccessItems[0]) => {
    if (item.type === 'app') {
      // Launch app
      const app = appConfig.taskbarApps.find((a) => a.id === item.id);
      if (app) {
        if (item.id === 'Terminal') {
          addWindow('Terminal', <Terminal />, 800, 500, app.icon);
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

  const currentFiles = currentView === 'home' ? [] : getChildren(currentDirectory);
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
          className="md:hidden p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors"
          aria-label="Toggle Sidebar"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          onClick={navigateBack}
          disabled={!canGoBack}
          className={`p-1 md:p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors ${
            !canGoBack ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Back"
        >
          <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
        <button
          onClick={navigateForward}
          disabled={!canGoForward}
          className={`p-1 md:p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors ${
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
        <div className="relative flex items-center flex-1 md:flex-none">
          <Search className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 absolute left-2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Home"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-48 h-6 md:h-7 pl-7 md:pl-8 pr-2 rounded bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] focus:bg-[rgba(255,255,255,0.15)] border border-transparent focus:border-[rgba(255,255,255,0.2)] text-white placeholder-gray-400 text-xs md:text-sm outline-none transition-all"
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-[#3a3a3a] dark:border-[#3a3a3a] bg-[#252525] dark:bg-[#252525]">
        <div className="relative group">
          <button className="px-3 py-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors flex items-center gap-1 text-sm">
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
        <div className="w-px h-6 bg-[#3a3a3a] mx-1" />
        <button
          onClick={handleCut}
          disabled={selectedItems.size === 0}
          className={`p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors ${
            selectedItems.size === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Cut"
        >
          <Scissors className="w-4 h-4" />
        </button>
        <button
          onClick={handleCopy}
          disabled={selectedItems.size === 0}
          className={`p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors ${
            selectedItems.size === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Copy"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={handlePaste}
          disabled={copiedItems.length === 0}
          className={`p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors ${
            copiedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Paste"
        >
          <Clipboard className="w-4 h-4" />
        </button>
        <button
          disabled={selectedItems.size === 0}
          className={`p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors ${
            selectedItems.size === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Rename"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          disabled={selectedItems.size === 0}
          className={`p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors ${
            selectedItems.size === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Share"
        >
          <Share2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          disabled={selectedItems.size === 0}
          className={`p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors ${
            selectedItems.size === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-[#3a3a3a] mx-1" />
        <div className="relative group">
          <button className="px-3 py-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors flex items-center gap-1 text-sm">
            Sort
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
        <div className="relative group">
          <button className="px-3 py-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors flex items-center gap-1 text-sm">
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
        <div className="relative group">
          <button className="px-3 py-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors flex items-center gap-1 text-sm">
            Filter
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
        <button className="p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors ml-auto">
          <MoreHorizontal className="w-4 h-4" />
        </button>
        <button className="px-3 py-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors text-sm">
          Details
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Navigation Pane */}
        <div className={`absolute md:relative z-20 w-64 h-full border-r border-[#3a3a3a] dark:border-[#3a3a3a] bg-[#1a1a1a] dark:bg-[#1a1a1a] flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          {/* Mobile Close Button */}
          <div className="md:hidden flex items-center justify-between p-2 border-b border-[#3a3a3a]">
            <span className="text-sm text-white font-medium">Navigation</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded hover:bg-[rgba(255,255,255,0.1)]"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {/* Pinned Items */}
            <div className="space-y-0.5">
              {fileExplorerConfig.pinnedNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.type === 'folder' || item.type === 'drive') {
                      const folder = files.find((f) => f.name === item.name && f.type === 'folder');
                      if (folder) {
                        navigateTo(folder.id, item.name);
                      }
                    }
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors group"
                >
                  {item.pinned && <Pin className="w-3 h-3 text-gray-400 flex-shrink-0" />}
                  {item.type === 'drive' ? (
                    <HardDrive className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <Folder className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  )}
                  <span className="text-sm text-gray-300 flex-1 text-left truncate">{item.name}</span>
                </button>
              ))}
            </div>

            {/* Expandable Sections */}
            <div className="mt-4 space-y-0.5">
              <button
                onClick={() => {
                  const newExpanded = new Set(expandedSections);
                  if (newExpanded.has('thispc')) {
                    newExpanded.delete('thispc');
                  } else {
                    newExpanded.add('thispc');
                  }
                  setExpandedSections(newExpanded);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors"
              >
                <ChevronRight
                  className={`w-3 h-3 text-gray-400 transition-transform ${
                    expandedSections.has('thispc') ? 'rotate-90' : ''
                  }`}
                />
                <HardDrive className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">This PC</span>
              </button>
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
          {currentView === 'home' ? (
            <div className="p-2 md:p-4">
              {/* Quick Access Section */}
              <div className="mb-4">
                <h2 className="text-xs md:text-sm font-semibold text-gray-300 mb-2 md:mb-3">Quick access</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
                  {fileExplorerConfig.quickAccessItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleQuickAccessClick(item)}
                      className="flex flex-col items-center gap-2 p-3 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors group"
                    >
                      <div className="w-16 h-16 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center overflow-hidden border border-[rgba(255,255,255,0.1)]">
                        {item.type === 'app' ? (
                          <Image
                            src={item.icon}
                            alt={item.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 object-contain"
                            unoptimized
                          />
                        ) : item.type === 'drive' ? (
                          <HardDrive className="w-8 h-8 text-gray-400" />
                        ) : (
                          <Folder className="w-8 h-8 text-blue-400" />
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-300 group-hover:text-white transition-colors truncate w-full">
                          {item.name}
                        </div>
                        {item.location && (
                          <div className="text-[10px] text-gray-500 mt-0.5">{item.location}</div>
                        )}
                        {item.pinned && (
                          <Pin className="w-3 h-3 text-gray-400 mx-auto mt-1" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 border-b border-[#3a3a3a] mb-4">
                <button
                  onClick={() => setActiveTab('recent')}
                  className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeTab === 'recent'
                      ? 'text-white border-b-2 border-[#0078D4]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Recent
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeTab === 'favorites'
                      ? 'text-white border-b-2 border-[#0078D4]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  Favorites
                </button>
                <button
                  onClick={() => setActiveTab('shared')}
                  className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeTab === 'shared'
                      ? 'text-white border-b-2 border-[#0078D4]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Shared
                </button>
              </div>

              {/* Recent Files List */}
              {activeTab === 'recent' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#3a3a3a]">
                        <th className="text-left py-2 px-4 text-xs font-semibold text-gray-400">Name</th>
                        <th className="text-left py-2 px-4 text-xs font-semibold text-gray-400">
                          Date accessed
                        </th>
                        <th className="text-left py-2 px-4 text-xs font-semibold text-gray-400">Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentFiles.slice(0, 10).map((file) => (
                        <tr
                          key={file.id}
                          className="border-b border-[#3a3a3a] hover:bg-[rgba(255,255,255,0.05)] cursor-pointer"
                          onClick={() => handleFileClick(file)}
                        >
                          <td className="py-2 px-4 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-gray-300">{file.name}</span>
                          </td>
                          <td className="py-2 px-4 text-sm text-gray-400">
                            {new Date(file.lastAccessed).toLocaleString()}
                          </td>
                          <td className="py-2 px-4 text-sm text-gray-400">-</td>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
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
                      className={`flex flex-col items-center gap-2 p-3 rounded transition-colors ${
                        selectedItems.has(file.id)
                          ? 'bg-[rgba(0,120,212,0.2)]'
                          : 'hover:bg-[rgba(255,255,255,0.1)]'
                      }`}
                    >
                      <div className="w-16 h-16 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center overflow-hidden border border-[rgba(255,255,255,0.1)]">
                        {file.type === 'folder' ? (
                          <Folder className="w-8 h-8 text-blue-400" />
                        ) : (
                          <FileText className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <span className="text-xs text-gray-300 text-center truncate w-full">
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
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                        selectedItems.has(file.id)
                          ? 'bg-[rgba(0,120,212,0.2)]'
                          : 'hover:bg-[rgba(255,255,255,0.1)]'
                      }`}
                    >
                      {file.type === 'folder' ? (
                        <Folder className="w-5 h-5 text-blue-400" />
                      ) : (
                        <FileText className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-300">{file.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {viewMode === 'details' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#3a3a3a]">
                        <th className="text-left py-2 px-4 text-xs font-semibold text-gray-400">Name</th>
                        <th className="text-left py-2 px-4 text-xs font-semibold text-gray-400">Date modified</th>
                        <th className="text-left py-2 px-4 text-xs font-semibold text-gray-400">Type</th>
                        <th className="text-left py-2 px-4 text-xs font-semibold text-gray-400">Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFiles.map((file) => (
                        <tr
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
                          className={`border-b border-[#3a3a3a] hover:bg-[rgba(255,255,255,0.05)] cursor-pointer ${
                            selectedItems.has(file.id) ? 'bg-[rgba(0,120,212,0.2)]' : ''
                          }`}
                        >
                          <td className="py-2 px-4 flex items-center gap-2">
                            {file.type === 'folder' ? (
                              <Folder className="w-4 h-4 text-blue-400" />
                            ) : (
                              <FileText className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="text-sm text-gray-300">{file.name}</span>
                          </td>
                          <td className="py-2 px-4 text-sm text-gray-400">
                            {new Date(file.lastAccessed).toLocaleString()}
                          </td>
                          <td className="py-2 px-4 text-sm text-gray-400">
                            {file.type === 'folder' ? 'File folder' : 'File'}
                          </td>
                          <td className="py-2 px-4 text-sm text-gray-400">-</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {filteredFiles.length === 0 && (
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

