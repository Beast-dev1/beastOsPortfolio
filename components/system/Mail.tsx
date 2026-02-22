'use client';

import { useState, useEffect, Suspense } from 'react';
import { Box, styled, useTheme, useMediaQuery } from '@mui/material';
import Header from '../mail/Header';
import SideBar from '../mail/SideBar';
import Emails from '../mail/Emails';
import ViewEmail from '../mail/ViewEmail';
import SuspenseLoader from '../mail/SuspenseLoader';
import ComposeMail from '../mail/ComposeMail';
import { Email } from '@/types/mail';

const Wrapper = styled(Box)`
  display: flex;
  height: 100%;
  flex-direction: column;
`;

const ContentWrapper = styled(Box)`
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
`;

const MAIL_FIRST_VISIT_KEY = 'beastOs_mailFirstVisitDone';

export default function Mail() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [openDrawer, setOpenDrawer] = useState(true);

  useEffect(() => {
    if (isMobile) setOpenDrawer(false);
  }, [isMobile]);
  const [currentType, setCurrentType] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showFirstTimeCompose, setShowFirstTimeCompose] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem(MAIL_FIRST_VISIT_KEY)) {
      setShowFirstTimeCompose(true);
    }
  }, []);

  const handleFirstTimeComposeClose = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(MAIL_FIRST_VISIT_KEY, 'true');
    }
    setShowFirstTimeCompose(false);
  };

  const toggleDrawer = () => {
    setOpenDrawer((prevState) => !prevState);
  };

  const handleTypeChange = (type: string) => {
    setCurrentType(type);
    setSelectedEmail(null);
  };

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
  };

  const handleBackToList = () => {
    setSelectedEmail(null);
  };

  const handleEmailSent = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Wrapper>
      {showFirstTimeCompose && (
        <ComposeMail
          open={true}
          setOpenDrawer={handleFirstTimeComposeClose}
          onEmailSent={handleEmailSent}
          initialTo="prakashrai1900@gmail.com"
        />
      )}
      <Header toggleDrawer={toggleDrawer} />
      <ContentWrapper>
        <SideBar
          toggleDrawer={toggleDrawer}
          openDrawer={openDrawer}
          currentType={currentType}
          onTypeChange={handleTypeChange}
          onEmailSent={handleEmailSent}
        />
        <Suspense fallback={<SuspenseLoader />}>
          {selectedEmail ? (
            <ViewEmail
              email={selectedEmail}
              openDrawer={openDrawer}
              onBack={handleBackToList}
            />
          ) : (
            <Emails
              type={currentType}
              openDrawer={openDrawer}
              onEmailClick={handleEmailClick}
              refreshTrigger={refreshTrigger}
            />
          )}
        </Suspense>
      </ContentWrapper>
    </Wrapper>
  );
}
