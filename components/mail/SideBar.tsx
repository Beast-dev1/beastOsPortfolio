'use client';

import { useTheme, useMediaQuery, Drawer } from '@mui/material';
import SideBarContent from './SideBarContent';

interface SideBarProps {
  toggleDrawer: () => void;
  openDrawer: boolean;
  currentType?: string;
  onTypeChange: (type: string) => void;
  onEmailSent?: () => void;
}

const SideBar = ({ toggleDrawer, openDrawer, currentType, onTypeChange, onEmailSent }: SideBarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const sidebarWidth = openDrawer ? 250 : 72;

  const isTemporary = isMobile;
  const drawerOpen = isMobile ? openDrawer : true;

  return (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={toggleDrawer}
      hideBackdrop={!isMobile}
      variant={isTemporary ? 'temporary' : 'persistent'}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        display: { xs: 'block', md: 'block' },
        '& .MuiDrawer-paper': {
          width: isMobile ? 280 : sidebarWidth,
          maxWidth: isMobile ? '85vw' : 'none',
          borderRight: 'none',
          background: '#f5F5F5',
          left: '0px',
          marginTop: isMobile ? 0 : '100px',
          top: isMobile ? 0 : undefined,
          height: isMobile ? '100vh' : 'calc(100vh - 64px)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
          boxSizing: 'border-box',
        },
      }}
    >
      <SideBarContent 
        currentType={currentType} 
        onTypeChange={onTypeChange} 
        onEmailSent={onEmailSent}
        isCollapsed={!openDrawer && !isMobile}
        isMobile={isMobile}
        onNavigate={isMobile ? toggleDrawer : undefined}
      />
    </Drawer>
  );
};

export default SideBar;
