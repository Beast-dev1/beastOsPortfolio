'use client';

import { useEffect, useState } from 'react';
import { Checkbox, IconButton } from '@mui/material';
import { DeleteOutline, Refresh, MoreVert, ArrowDropDown } from '@mui/icons-material';
import useMailApi, { API_URLS } from '@/hooks/useMailApi';
import EmailItem from './Email';
import NoMails from './NoMails';
import { Email } from '@/types/mail';

const EMPTY_TABS: Record<string, { heading: string; subHeading: string }> = {
  inbox: {
    heading: 'Your inbox is empty',
    subHeading: "Mails that don't appear in other tabs will be shown here.",
  },
  drafts: {
    heading: "You don't have any saved drafts.",
    subHeading: "Saving a draft allows you to keep a message you aren't ready to send yet.",
  },
  starred: {
    heading: 'No starred messages',
    subHeading:
      'Stars let you give messages a special status to make them easier to find. To star a message, click on the star outline beside any message or conversation.',
  },
  sent: {
    heading: 'No sent messages!',
    subHeading: 'Send one now!',
  },
  bin: {
    heading: 'No conversations in Bin.',
    subHeading: '',
  },
  allmail: {
    heading: 'No messages',
    subHeading: 'All your messages will appear here.',
  },
};

interface EmailsProps {
  type: string;
  openDrawer: boolean;
  onEmailClick: (email: Email) => void;
  refreshTrigger?: number;
}

const Emails = ({ type, openDrawer, onEmailClick, refreshTrigger = 0 }: EmailsProps) => {
  const [starredEmail, setStarredEmail] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  const getEmailsService = useMailApi(API_URLS.getEmailFromType);
  const deleteEmailsService = useMailApi(API_URLS.deleteEmails);
  const moveEmailsToBin = useMailApi(API_URLS.moveEmailsToBin);

  useEffect(() => {
    getEmailsService.call({}, type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, starredEmail, refreshTrigger]);

  const selectAllEmails = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const emails = getEmailsService?.response?.map((email: Email) => email._id || email.id) || [];
      setSelectedEmails(emails);
    } else {
      setSelectedEmails([]);
    }
  };

  const deleteSelectedEmails = async () => {
    if (type === 'bin') {
      await deleteEmailsService.call(selectedEmails);
    } else {
      await moveEmailsToBin.call(selectedEmails);
    }
    setSelectedEmails([]);
    setStarredEmail((prevState) => !prevState);
  };

  const handleRefresh = () => {
    getEmailsService.call({}, type);
  };

  const hasSelectedEmails = selectedEmails.length > 0;
  const totalEmails = getEmailsService?.response?.length || 0;
  const allSelected = selectedEmails.length === totalEmails && totalEmails > 0;

  return (
    <div className={`w-full min-w-0 transition-all duration-300 ml-0 ${openDrawer ? 'md:ml-[250px]' : 'md:ml-[72px]'}`}>
      <div className={`pt-3 px-2 sm:px-2.5 flex items-center flex-wrap gap-0 ${hasSelectedEmails ? 'bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm' : ''}`}>
        <Checkbox 
          size="small" 
          checked={allSelected}
          indeterminate={selectedEmails.length > 0 && selectedEmails.length < totalEmails}
          onChange={selectAllEmails} 
        />
        {!hasSelectedEmails && (
          <>
            <IconButton 
              size="small" 
              className="ml-1 text-gray-600 hover:bg-gray-100"
              onClick={() => {}}
              title="Select"
            >
              <ArrowDropDown fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              className="ml-1 text-gray-600 hover:bg-gray-100"
              onClick={handleRefresh}
              title="Refresh"
            >
              <Refresh fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              className="ml-1 text-gray-600 hover:bg-gray-100"
              onClick={() => {}}
              title="More"
            >
              <MoreVert fontSize="small" />
            </IconButton>
          </>
        )}
        {hasSelectedEmails && (
          <>
            <IconButton 
              size="small" 
              className="ml-1 text-gray-600 hover:bg-gray-100"
              onClick={deleteSelectedEmails}
              title="Delete"
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
            <span className="text-sm text-gray-600 ml-2 md:ml-4">
              {selectedEmails.length} selected
            </span>
          </>
        )}
      </div>
      {getEmailsService?.response && getEmailsService.response.length > 0 ? (
        <ul className="list-none p-0 m-0">
          {getEmailsService.response.map((email: Email) => (
            <EmailItem
              email={email}
              key={email._id || email.id}
              setStarredEmail={setStarredEmail}
              selectedEmails={selectedEmails}
              setSelectedEmails={setSelectedEmails}
              onEmailClick={onEmailClick}
            />
          ))}
        </ul>
      ) : (
        !getEmailsService?.isLoading && (
          <NoMails message={EMPTY_TABS[type] || EMPTY_TABS.inbox} />
        )
      )}
    </div>
  );
};

export default Emails;

