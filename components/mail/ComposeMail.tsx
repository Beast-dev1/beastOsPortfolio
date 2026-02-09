'use client';

import { useState, useEffect } from 'react';
import { Dialog, IconButton } from '@mui/material';
import { 
  Close, 
  DeleteOutline, 
  Minimize, 
  Fullscreen, 
  ArrowDropDown,
  FormatBold,
  AttachFile,
  InsertLink,
  InsertEmoticon,
  DriveFolderUpload,
  InsertPhoto,
  Lock,
  Create,
  MoreVert
} from '@mui/icons-material';
import useMailApi, { API_URLS } from '@/hooks/useMailApi';
import { Email } from '@/types/mail';

interface ComposeMailProps {
  open: boolean;
  setOpenDrawer: (open: boolean) => void;
  onEmailSent?: () => void;
  initialTo?: string;
}

const ComposeMail = ({ open, setOpenDrawer, onEmailSent, initialTo }: ComposeMailProps) => {
  const [data, setData] = useState<{ to?: string; subject?: string; body?: string }>({});

  useEffect(() => {
    if (open && initialTo) {
      setData((prev) => ({ ...prev, to: initialTo }));
    }
  }, [open, initialTo]);
  const sentEmailService = useMailApi(API_URLS.saveSentEmails);
  const saveDraftService = useMailApi(API_URLS.saveDraftEmails);

  const onValueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      to: data.to,
      from: 'prakashrai1900@gmail.com',
      subject: data.subject,
      body: data.body,
      date: new Date(),
      image: '',
      name: 'Prakash Rai',
      starred: false,
      type: 'sent',
    };

    await sentEmailService.call(payload);

    if (!sentEmailService.error) {
      setOpenDrawer(false);
      setData({});
      if (onEmailSent) {
        onEmailSent();
      }
    }
  };

  const handleClose = () => {
    // Save as draft if there's content
    if (data.to || data.subject || data.body) {
      const payload = {
        to: data.to,
        from: 'prakashrai1900@gmail.com',
        subject: data.subject,
        body: data.body,
        date: new Date(),
        image: '',
        name: 'Prakash Rai',
        starred: false,
        type: 'drafts',
      };
      saveDraftService.call(payload);
    }
    setOpenDrawer(false);
    setData({});
    if (onEmailSent) {
      onEmailSent();
    }
  };

  const handleDiscard = () => {
    setOpenDrawer(false);
    setData({});
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          height: '600px',
          width: '600px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          boxShadow: '0 8px 10px 1px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12), 0 5px 5px -3px rgba(0,0,0,0.2)',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center py-2.5 px-4 bg-[#f2f6fc] border-b border-gray-200">
        <p className="text-sm font-medium text-[#202124]">New Message</p>
        <div className="flex items-center gap-1">
          <IconButton size="small" className="text-[#5F6368] hover:bg-gray-200" onClick={() => {}}>
            <Minimize fontSize="small" />
          </IconButton>
          <IconButton size="small" className="text-[#5F6368] hover:bg-gray-200" onClick={() => {}}>
            <Fullscreen fontSize="small" />
          </IconButton>
          <IconButton size="small" className="text-[#5F6368] hover:bg-gray-200" onClick={handleClose}>
            <Close fontSize="small" />
          </IconButton>
        </div>
      </div>

      {/* To and Subject Fields */}
      <div className="flex flex-col px-4 border-b border-gray-200">
        <div className="flex items-center border-b border-gray-200 py-2">
          <span className="text-sm text-[#5F6368] min-w-[60px]">To</span>
          <input
            type="text"
            placeholder=""
            name="to"
            onChange={onValueChange}
            value={data.to || ''}
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#202124]"
          />
          <div className="flex items-center gap-2 ml-4">
            <button className="text-xs text-[#1a73e8] hover:underline">Cc</button>
            <span className="text-[#5F6368]">|</span>
            <button className="text-xs text-[#1a73e8] hover:underline">Bcc</button>
          </div>
        </div>
        <div className="flex items-center border-b border-gray-200 py-2">
          <span className="text-sm text-[#5F6368] min-w-[60px]">Subject</span>
          <input
            type="text"
            placeholder=""
            name="subject"
            onChange={onValueChange}
            value={data.subject || ''}
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#202124]"
          />
        </div>
      </div>

      {/* Body Text Area */}
      <textarea
        name="body"
        onChange={onValueChange}
        value={data.body || ''}
        className="flex-1 w-full border-none outline-none p-4 resize-none text-sm text-[#202124]"
        placeholder=""
      />

      {/* Footer Toolbar */}
      <div className="flex justify-between items-center py-2.5 px-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-1">
          <button
            onClick={sendEmail}
            className="bg-[#0B57D0] text-white font-medium rounded-[24px] px-6 py-2 hover:bg-[#0a4db8] transition-colors flex items-center gap-1"
          >
            Send
            <ArrowDropDown fontSize="small" />
          </button>
          <div className="flex items-center gap-1 ml-2">
            <IconButton size="small" className="text-[#5F6368] hover:bg-gray-100" title="Formatting options">
              <FormatBold fontSize="small" />
            </IconButton>
            <IconButton size="small" className="text-[#5F6368] hover:bg-gray-100" title="Attach files">
              <AttachFile fontSize="small" />
            </IconButton>
            <IconButton size="small" className="text-[#5F6368] hover:bg-gray-100" title="Insert link">
              <InsertLink fontSize="small" />
            </IconButton>
            <IconButton size="small" className="text-[#5F6368] hover:bg-gray-100" title="Insert emoji">
              <InsertEmoticon fontSize="small" />
            </IconButton>
            <IconButton size="small" className="text-[#5F6368] hover:bg-gray-100" title="Insert from Drive">
              <DriveFolderUpload fontSize="small" />
            </IconButton>
            <IconButton size="small" className="text-[#5F6368] hover:bg-gray-100" title="Insert photo">
              <InsertPhoto fontSize="small" />
            </IconButton>
            <IconButton size="small" className="text-[#5F6368] hover:bg-gray-100" title="Confidential mode">
              <Lock fontSize="small" />
            </IconButton>
            <IconButton size="small" className="text-[#5F6368] hover:bg-gray-100" title="Insert signature">
              <Create fontSize="small" />
            </IconButton>
            <IconButton size="small" className="text-[#5F6368] hover:bg-gray-100" title="More options">
              <MoreVert fontSize="small" />
            </IconButton>
          </div>
        </div>
        <IconButton 
          size="small" 
          className="text-[#5F6368] hover:bg-gray-100" 
          onClick={handleDiscard}
          title="Discard draft"
        >
          <DeleteOutline fontSize="small" />
        </IconButton>
      </div>
    </Dialog>
  );
};

export default ComposeMail;

