'use client';

import {
  Menu as MenuIcon,
  Tune,
  HelpOutlineOutlined,
  SettingsOutlined,
  AppsOutlined,
  AccountCircleOutlined,
  Search,
} from '@mui/icons-material';
import { Icon } from '@iconify/react';

interface HeaderProps {
  toggleDrawer: () => void;
}

const Header = ({ toggleDrawer }: HeaderProps) => {
  return (
    <header className="bg-[#f5F5F5] shadow-none sticky top-0 z-10">
      <div className="flex items-center px-4 py-2">
        <MenuIcon className="text-gray-600 cursor-pointer" onClick={toggleDrawer} />
        <Icon icon="logos:google-gmail" className="w-[120px] h-[35px] ml-4" />
        <span className="text-gray-600 text-2xl  ml-4">Gmail</span>
        <div className="bg-[#EAF1FB] ml-[86px] rounded-2xl min-w-[690px] max-w-[720px] h-10 flex items-center justify-between px-5">
          <Search className="text-gray-600" />
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none px-2 text-sm"
            placeholder="Search mail"
          />
          <Tune className="text-gray-600" />
        </div>

        <div className="w-full flex justify-end">
          <HelpOutlineOutlined className="text-gray-600 ml-5 cursor-pointer" />
          <SettingsOutlined className="text-gray-600 ml-5 cursor-pointer" />
          <AppsOutlined className="text-gray-600 ml-5 cursor-pointer" />
          <AccountCircleOutlined className="text-gray-600 ml-5 cursor-pointer" />
        </div>
      </div>
    </header>
  );
};

export default Header;


