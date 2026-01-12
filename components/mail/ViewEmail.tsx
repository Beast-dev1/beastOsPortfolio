'use client';

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
    <div className={`w-full transition-all duration-300 bg-white ${openDrawer ? 'ml-[250px]' : 'ml-[72px]'}`}>
      <div className="p-4 border-b border-gray-200">
        <ArrowBack className="text-[#5F6368] hover:text-[#202124] cursor-pointer transition-colors" fontSize="small" onClick={onBack} />
        <Delete className="text-[#5F6368] hover:text-[#202124] cursor-pointer ml-10 transition-colors" fontSize="small" />
      </div>
      <div className="px-4 pt-4 pb-2">
        <div className="text-xl font-normal text-[#202124] my-2.5 ml-[75px] flex items-center">
          {email.subject || '(No subject)'}{' '}
          <span className="text-xs bg-[#e8eaed] text-[#5F6368] rounded px-1.5 ml-1.5 py-0.5 self-center">
            Inbox
          </span>
        </div>
        <div className="flex mt-4">
          <img
            src={emptyProfilePic}
            alt="profile"
            className="rounded-full w-10 h-10 my-1 mx-2.5 bg-[#cccccc]"
          />
          <div className="ml-4 w-full">
            <div className="flex items-center">
              <p className="text-sm text-[#202124] font-medium">
                {email.to.split('@')[0]}
                <span className="text-xs text-[#5F6368] font-normal">&nbsp;&#60;{email.to}&#62;</span>
              </p>
              <p className="text-xs text-[#5F6368] ml-auto mr-12">
                {emailDate.getDate()}&nbsp;
                {emailDate.toLocaleString('default', { month: 'long' })}&nbsp;
                {emailDate.getFullYear()}
              </p>
            </div>
            <div className="mt-5 text-[#202124] text-sm leading-relaxed whitespace-pre-wrap">
              {email.body}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEmail;

