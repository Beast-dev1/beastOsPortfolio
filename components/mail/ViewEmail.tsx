'use client';

import Image from 'next/image';
import { ArrowBack, Delete } from '@mui/icons-material';
import { Email } from '@/types/mail';

interface ViewEmailProps {
  email: Email;
  openDrawer: boolean;
  onBack: () => void;
}

const ViewEmail = ({ email, openDrawer, onBack }: ViewEmailProps) => {
  const emailDate = new window.Date(email.date);
  const emptyProfilePic =
    'https://ssl.gstatic.com/ui/v1/icons/mail/profile_mask2.png';

  return (
    <div className={`w-full min-w-0 transition-all duration-300 bg-white ml-0 ${openDrawer ? 'md:ml-[250px]' : 'md:ml-[72px]'}`}>
      <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center gap-2">
        <ArrowBack className="text-[#5F6368] hover:text-[#202124] cursor-pointer transition-colors flex-shrink-0" fontSize="small" onClick={onBack} />
        <Delete className="text-[#5F6368] hover:text-[#202124] cursor-pointer transition-colors flex-shrink-0" fontSize="small" />
      </div>
      <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2">
        <div className="text-base sm:text-xl font-normal text-[#202124] my-2 sm:my-2.5 md:ml-[75px] flex flex-wrap items-center gap-1.5">
          {email.subject || '(No subject)'}{' '}
          <span className="text-xs bg-[#e8eaed] text-[#5F6368] rounded px-1.5 py-0.5 self-center">
            Inbox
          </span>
        </div>
        <div className="flex mt-3 sm:mt-4 gap-3 sm:gap-0">
          <Image
            src={emptyProfilePic}
            alt="profile"
            width={40}
            height={40}
            className="rounded-full w-9 h-9 sm:w-10 sm:h-10 my-1 mx-0 sm:mx-2.5 bg-[#cccccc] flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <p className="text-sm text-[#202124] font-medium min-w-0 truncate">
                {email.to.split('@')[0]}
                <span className="text-xs text-[#5F6368] font-normal hidden sm:inline">&nbsp;&#60;{email.to}&#62;</span>
              </p>
              <p className="text-xs text-[#5F6368] sm:ml-auto sm:mr-12 flex-shrink-0">
                {emailDate.getDate()}&nbsp;
                {emailDate.toLocaleString('default', { month: 'long' })}&nbsp;
                {emailDate.getFullYear()}
              </p>
            </div>
            <div className="mt-3 sm:mt-5 text-[#202124] text-sm leading-relaxed whitespace-pre-wrap break-words overflow-x-auto">
              {email.body}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEmail;

