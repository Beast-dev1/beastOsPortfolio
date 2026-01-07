'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface File {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  content?: string;
  lastAccessed: Date;
}

interface FileSystemContextType {
  files: File[];
  addFile: (file: Omit<File, 'id' | 'lastAccessed'>) => void;
  deleteFile: (id: string) => void;
  updateFile: (id: string, updates: Partial<File>) => void;
  getChildren: (parentId: string | null) => File[];
  currentDirectory: string | null;
  setCurrentDirectory: React.Dispatch<React.SetStateAction<string | null>>;
  getFileById: (id: string) => File | undefined;
  getFileByName: (name: string, parentId: string | null) => File | undefined;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};

export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [currentDirectory, setCurrentDirectory] = useState<string | null>(null);

  const addFile = useCallback((newFile: Omit<File, 'id' | 'lastAccessed'>) => {
    const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const file: File = {
      ...newFile,
      id,
      lastAccessed: new Date(),
    };
    setFiles((prev) => [...prev, file]);
  }, []);

  const deleteFile = useCallback((id: string) => {
    setFiles((prev) => {
      // Also delete all children if it's a folder
      const fileToDelete = prev.find((f) => f.id === id);
      if (fileToDelete?.type === 'folder') {
        const children = prev.filter((f) => f.parentId === id);
        const childrenIds = children.map((f) => f.id);
        return prev.filter((f) => f.id !== id && !childrenIds.includes(f.id));
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const updateFile = useCallback((id: string, updates: Partial<File>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  }, []);

  const getChildren = useCallback(
    (parentId: string | null) => {
      return files.filter((file) => file.parentId === parentId);
    },
    [files]
  );

  const getFileById = useCallback(
    (id: string) => {
      return files.find((f) => f.id === id);
    },
    [files]
  );

  const getFileByName = useCallback(
    (name: string, parentId: string | null) => {
      return files.find((f) => f.name === name && f.parentId === parentId);
    },
    [files]
  );

  return (
    <FileSystemContext.Provider
      value={{
        files,
        addFile,
        deleteFile,
        updateFile,
        getChildren,
        currentDirectory,
        setCurrentDirectory,
        getFileById,
        getFileByName,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
};




