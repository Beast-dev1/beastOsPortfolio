'use client';

import { Drawer } from '@mui/material';
import SideBarContent from './SideBarContent';

interface SideBarProps {
  toggleDrawer: () => void;
  openDrawer: boolean;
  currentType?: string;
  onTypeChange: (type: string) => void;
  onEmailSent?: () => void;
}

const SideBar = ({ toggleDrawer, openDrawer, currentType, onTypeChange, onEmailSent }: SideBarProps) => {
  const sidebarWidth = openDrawer ? 250 : 72;

  return (
    <Drawer
      anchor="left"
      open={true}
      onClose={toggleDrawer}
      hideBackdrop={true}
      ModalProps={{
        keepMounted: true,
      }}
      variant="persistent"
      sx={{
        '& .MuiDrawer-paper': {
          width: sidebarWidth,
          borderRight: 'none',
          background: '#f5F5F5',
          left: '0px',
          marginTop: '100px',
          height: 'calc(100vh - 64px)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
        },
      }}
    >
      <SideBarContent 
        currentType={currentType} 
        onTypeChange={onTypeChange} 
        onEmailSent={onEmailSent}
        isCollapsed={!openDrawer}
      />
    </Drawer>
  );
};

export default SideBar;
