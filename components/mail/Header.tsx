'use client';

import { useState } from 'react';
import {
  Menu as MenuIcon,
  Tune,
  HelpOutlineOutlined,
  SettingsOutlined,
  AppsOutlined,
  AccountCircleOutlined,
  Search,
  Close,
} from '@mui/icons-material';
import { Icon } from '@iconify/react';

interface HeaderProps {
  toggleDrawer: () => void;
}

const Header = ({ toggleDrawer }: HeaderProps) => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="bg-[#f5F5F5] shadow-none sticky top-0 z-10 relative">
      <div className="flex items-center px-2 sm:px-4 py-2 gap-1 sm:gap-0 min-h-12">
        <MenuIcon
          className="text-gray-600 cursor-pointer flex-shrink-0"
          onClick={toggleDrawer}
          fontSize="small"
        />
        <Icon
          icon="logos:google-gmail"
          className="w-[80px] h-[24px] sm:w-[100px] sm:h-[28px] md:w-[120px] md:h-[35px] ml-2 sm:ml-4 flex-shrink-0"
        />
        <span className="text-gray-600 text-lg sm:text-xl md:text-2xl ml-1 sm:ml-4 hidden sm:inline truncate">
          Gmail
        </span>
        {/* Desktop search */}
        <div className="hidden md:flex bg-[#EAF1FB] ml-4 lg:ml-[86px] rounded-2xl flex-1 min-w-0 max-w-[720px] h-9 lg:h-10 items-center justify-between px-4 lg:px-5">
          <Search className="text-gray-600 flex-shrink-0" fontSize="small" />
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none px-2 text-sm min-w-0"
            placeholder="Search mail"
          />
          <Tune className="text-gray-600 flex-shrink-0" fontSize="small" />
        </div>
        {/* Mobile search overlay */}
        {searchOpen && (
          <div className="md:hidden absolute inset-0 bg-[#f5F5F5] flex items-center px-2 py-2 gap-2 z-20">
            <MenuIcon
              className="text-gray-600 cursor-pointer flex-shrink-0"
              onClick={toggleDrawer}
              fontSize="small"
            />
            <div className="flex-1 bg-[#EAF1FB] rounded-2xl h-9 flex items-center px-3 gap-2">
              <Search className="text-gray-600 flex-shrink-0" fontSize="small" />
              <input
                type="text"
                className="flex-1 bg-transparent border-none outline-none text-sm min-w-0"
                placeholder="Search mail"
                autoFocus
              />
              <Tune className="text-gray-600 flex-shrink-0" fontSize="small" />
            </div>
            <Close
              className="text-gray-600 cursor-pointer flex-shrink-0"
              fontSize="small"
              onClick={() => setSearchOpen(false)}
            />
          </div>
        )}
        <div className="flex-1 md:flex-initial flex justify-end items-center gap-1 sm:gap-2 min-w-0">
          {!searchOpen && (
            <Search
              className="md:hidden text-gray-600 cursor-pointer flex-shrink-0"
              fontSize="small"
              onClick={() => setSearchOpen(true)}
            />
          )}
          <HelpOutlineOutlined className="hidden sm:block text-gray-600 cursor-pointer flex-shrink-0" fontSize="small" />
          <SettingsOutlined className="text-gray-600 cursor-pointer flex-shrink-0" fontSize="small" />
          <AppsOutlined className="hidden sm:block text-gray-600 cursor-pointer flex-shrink-0" fontSize="small" />
          <AccountCircleOutlined className="text-gray-600 cursor-pointer flex-shrink-0" fontSize="small" />
        </div>
      </div>
    </header>
  );
};

export default Header;


