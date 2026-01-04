'use client';

import * as React from 'react';
import { WindowProvider } from '@/Context/windowContext';

export interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <WindowProvider>{children}</WindowProvider>;
}

