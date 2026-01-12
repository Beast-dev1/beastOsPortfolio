'use client';

import { Checkbox } from '@mui/material';
import { StarBorder, Star } from '@mui/icons-material';
import useMailApi, { API_URLS } from '@/hooks/useMailApi';
import { Email as EmailType } from '@/types/mail';

interface EmailItemProps {
  email: EmailType;
  setStarredEmail: React.Dispatch<React.SetStateAction<boolean>>;
  selectedEmails: string[];
  setSelectedEmails: React.Dispatch<React.SetStateAction<string[]>>;
  onEmailClick: (email: EmailType) => void;
}

const EmailItem = ({
  email,
  setStarredEmail,
  selectedEmails,
  setSelectedEmails,
  onEmailClick,
}: EmailItemProps) => {
  const toggleStarredEmailService = useMailApi(API_URLS.toggleStarredMails);

  const toggleStarredEmail = async () => {
    const emailId = email._id || email.id;
    if (!emailId) return;

    await toggleStarredEmailService.call({
      id: emailId,
      value: !email.starred,
    });
    setStarredEmail((prevState) => !prevState);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const emailId = email._id || email.id;
    if (!emailId) return;

    if (selectedEmails.includes(emailId)) {
      setSelectedEmails((prevState) => prevState.filter((id) => id !== emailId));
    } else {
      setSelectedEmails((prevState) => [...prevState, emailId]);
    }
  };

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStarredEmail();
  };

  const emailId = email._id || email.id || '';
  const emailDate = new window.Date(email.date);
  const isSelected = selectedEmails.includes(emailId);
  const hasAnySelection = selectedEmails.length > 0;

  return (
    <li 
      className={`group pl-2.5 cursor-pointer flex items-center py-2 transition-colors ${
        isSelected 
          ? 'bg-[#e8eef5]' 
          : hasAnySelection 
            ? 'bg-white hover:bg-gray-50' 
            : 'bg-[#f2f6fc] hover:bg-[#e8eef5]'
      }`}
      onMouseEnter={(e) => {
        if (!hasAnySelection && !isSelected) {
          const checkbox = e.currentTarget.querySelector('.email-checkbox') as HTMLElement;
          if (checkbox) checkbox.style.opacity = '1';
        }
      }}
      onMouseLeave={(e) => {
        if (!hasAnySelection && !isSelected) {
          const checkbox = e.currentTarget.querySelector('.email-checkbox') as HTMLElement;
          if (checkbox) checkbox.style.opacity = '0';
        }
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          size="small"
          checked={isSelected}
          onChange={handleChange}
          className="email-checkbox"
          sx={{ 
            opacity: hasAnySelection || isSelected ? 1 : 0,
            transition: 'opacity 0.2s',
          }}
        />
      </div>
      <div 
        className="mr-2.5 cursor-pointer flex items-center min-w-[24px] justify-center hover:bg-gray-200 rounded transition-colors p-0.5" 
        onClick={handleStarClick}
        title={email.starred ? 'Unstar' : 'Star'}
      >
        {email.starred ? (
          <Star fontSize="small" sx={{ color: '#fbbc04', fontSize: '20px' }} />
        ) : (
          <StarBorder fontSize="small" sx={{ color: '#5F6368', fontSize: '20px' }} />
        )}
      </div>
      <div 
        onClick={(e) => {
          if (hasAnySelection) {
            e.stopPropagation();
            const emailId = email._id || email.id;
            if (emailId) {
              if (isSelected) {
                setSelectedEmails((prevState) => prevState.filter((id) => id !== emailId));
              } else {
                setSelectedEmails((prevState) => [...prevState, emailId]);
              }
            }
          } else {
            onEmailClick(email);
          }
        }} 
        className="flex items-center flex-1 w-full min-w-0"
      >
        <p className="text-sm text-[#5F6368] min-w-[120px] max-w-[200px] truncate">To:{email.to.split('@')[0]}</p>
        <span className="text-xs bg-[#ddd] text-[#222] rounded px-1.5 py-0.5 mr-2 whitespace-nowrap">Inbox</span>
        <p className="text-sm text-[#202124] flex-1 min-w-0 truncate">
          {email.subject || '(No subject)'}
        </p>
        <p className="text-xs text-[#5F6368] mr-5 whitespace-nowrap">
          {emailDate.getDate()}&nbsp;
          {emailDate.toLocaleString('default', { month: 'long' })}
        </p>
      </div>
    </li>
  );
};

export default EmailItem;

