'use client';

import { useState } from 'react';
import ComposeMail from './ComposeMail';
import {
  Photo,
  StarOutline,
  SendOutlined,
  InsertDriveFileOutlined,
  DeleteOutlined,
  MailOutlined,
} from '@mui/icons-material';
import { CreateOutlined } from '@mui/icons-material';

const SIDEBAR_DATA = [
  {
    name: 'inbox',
    title: 'Inbox',
    icon: Photo,
  },
  {
    name: 'starred',
    title: 'Starred',
    icon: StarOutline,
  },
  {
    name: 'sent',
    title: 'Sent',
    icon: SendOutlined,
  },
  {
    name: 'drafts',
    title: 'Drafts',
    icon: InsertDriveFileOutlined,
  },
  {
    name: 'bin',
    title: 'Bin',
    icon: DeleteOutlined,
  },
  {
    name: 'allmail',
    title: 'All Mail',
    icon: MailOutlined,
  },
];

interface SideBarContentProps {
  currentType?: string;
  onTypeChange: (type: string) => void;
  onEmailSent?: () => void;
  isCollapsed?: boolean;
  isMobile?: boolean;
  onNavigate?: () => void;
}

const SideBarContent = ({ currentType, onTypeChange, onEmailSent, isCollapsed = false, isMobile, onNavigate }: SideBarContentProps) => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const expanded = isMobile || !isCollapsed;

  const onComposeClick = () => {
    setOpenDrawer(true);
  };

  const handleTypeChange = (name: string) => {
    onTypeChange(name);
    if (onNavigate) onNavigate();
  };

  return (
    <div className={`p-2 md:mt-0 pt-4 md:pt-2 transition-all duration-300 ${isCollapsed && !isMobile ? 'px-2' : ''}`}>
      <button
        onClick={onComposeClick}
        className={`bg-[#c2e7ff] text-[#001d35] rounded-2xl py-3 sm:py-3.5 flex items-center justify-center hover:bg-[#b0d9f0] transition-all duration-300 ${
          isCollapsed && !isMobile
            ? 'px-3 min-w-[48px] w-[48px]' 
            : 'px-4 min-w-[140px]'
        }`}
        title={isCollapsed && !isMobile ? 'Compose' : ''}
      >
        <CreateOutlined fontSize="small" className={isCollapsed && !isMobile ? '' : 'mr-2.5'} />
        {expanded && <span className="whitespace-nowrap">Compose</span>}
      </button>
      <ul className={`pt-2.5 text-sm font-medium cursor-pointer`}>
        {SIDEBAR_DATA.map((data) => {
          const isSelected = currentType === data.name.toLowerCase();
          return (
            <li
              key={data.name}
              onClick={() => handleTypeChange(data.name)}
              className={`flex items-center py-2.5 sm:py-2 rounded-r-2xl transition-all duration-300 ${
                isCollapsed && !isMobile
                  ? 'px-3 justify-center' 
                  : isSelected 
                    ? 'pl-2 pr-3 -ml-2' 
                    : 'pl-3 pr-3'
              } ${
                isSelected
                  ? 'bg-[#d3e3fd]'
                  : 'hover:bg-gray-100'
              }`}
              title={isCollapsed && !isMobile ? data.title : ''}
            >
              <data.icon fontSize="small" className={isCollapsed && !isMobile ? '' : 'mr-5'} />
              {expanded && (
                <span className="whitespace-nowrap transition-opacity duration-300 opacity-100">
                  {data.title}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <ComposeMail open={openDrawer} setOpenDrawer={setOpenDrawer} onEmailSent={onEmailSent} />
    </div>
  );
};

export default SideBarContent;

