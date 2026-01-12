'use client';

import { useState, Suspense } from 'react';
import { Box, styled } from '@mui/material';
import Header from '../mail/Header';
import SideBar from '../mail/SideBar';
import Emails from '../mail/Emails';
import ViewEmail from '../mail/ViewEmail';
import SuspenseLoader from '../mail/SuspenseLoader';
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
`;

export default function Mail() {
  const [openDrawer, setOpenDrawer] = useState(true);
  const [currentType, setCurrentType] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
