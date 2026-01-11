export type AppConfig = typeof appConfig;

export const appConfig = {
  taskbarApps: [
    { name: 'File Explorer', icon: '/icons/explorer/explorer.png', id: 'FileExplorer' },
    { name: 'Mail', icon: '/cursor/mail-svgrepo-com.svg', id: 'Mail' },
    { name: 'Music', icon: '/cursor/music.svg', id: 'Music' },
    { name: 'Photos', icon: '/icons/pictures/pictures.png', id: 'Photos' },
    { name: 'Terminal', icon: '/cursor/terminal-svgrepo-com (1).svg', id: 'Terminal' },
    { name: 'Google Chrome', icon: '/cursor/chrome.svg', id: 'GoogleChrome' },
    { name: 'About Me', icon: '/cursor/about.svg', id: 'aboutMe' },
  ],
  pinnedApps: [
    { name: 'Edge', icon: '/cursor/edge-svgrepo-com.svg', id: 'Edge' },
    { name: 'Microsoft Teams', icon: '/cursor/microsoft-teams-svgrepo-com.svg', id: 'MicrosoftTeams' },
    { name: 'Word', icon: '/cursor/word-svgrepo-com.svg', id: 'Word' },
    { name: 'PowerPoint', icon: '/cursor/file-type-powerpoint2.svg', id: 'PowerPoint' },
    { name: 'Excel', icon: '/cursor/excel.svg', id: 'Excel' },
    { name: 'Microsoft Store', icon: '/cursor/store.svg', id: 'MicrosoftStore' },
    { name: 'File Explorer', icon: '/icons/explorer/explorer.png', id: 'FileExplorer' },
    { name: 'Google Chrome', icon: '/cursor/chrome.svg', id: 'GoogleChrome' },
    { name: 'Google Play ', icon: '/cursor/googleplay.svg', id: 'GooglePlayBooks' },
    { name: 'WhatsApp', icon: '/cursor/whatsapp.svg', id: 'WhatsApp' },
    { name: 'Calculator', icon: '/cursor/calculator.svg', id: 'Calculator' },
    { name: 'Calendar', icon: '/cursor/calendar.svg', id: 'Calendar' },
  ],
  recommendedItems: [
    { name: 'Google Drive', description: 'Recently added', icon: '/cursor/drive.svg', id: 'GoogleDrive' },
    { name: 'VMware Workstation Pro', description: 'Frequently used app', icon: '/cursor/vmware1.svg', id: 'VMware' },
    { name: 'Amazon', description: 'From your browsing history', icon: '/cursor/amazon-.svg', id: 'Amazon' },
    { name: 'Photos', description: 'From your browsing history', icon: '/icons/pictures/pictures.png', id: 'Photos' },
    { name: 'Inbox (706)', description: 'From your browsing history', icon: '/cursor/terminal-svgrepo-com (1).svg', id: 'Inbox' },
    { name: 'YouTube', description: 'From your browsing history', icon: '/cursor/youtube.svg', id: 'YouTubeMusic' },
  ],
};

