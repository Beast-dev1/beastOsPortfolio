'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFileSystem } from '@/Context/FileSystemContext';

type TerminalLine = {
  text: string;
  type: 'input' | 'output' | 'error';
};

export default function Terminal() {
  const {
    files,
    addFile,
    deleteFile,
    updateFile,
    getChildren,
    currentDirectory,
    setCurrentDirectory,
    getFileByName,
    getFileById,
  } = useFileSystem();

  const [input, setInput] = useState('');
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      text: 'Windows PowerShell\nCopyright (C) Microsoft Corporation. All rights reserved.\n\nWelcome to Windows Terminal\nType "help" to see available commands.',
      type: 'output',
    },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  useEffect(() => {
    // Focus input when component mounts
    inputRef.current?.focus();
  }, []);

  const addLine = (text: string, type: TerminalLine['type'] = 'output') => {
    setLines((prev) => [...prev, { text, type }]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const prompt = currentDirectory
      ? `PS C:\\Users\\Prakash\\${currentDirectory}>`
      : 'PS C:\\Users\\Prakash>';
    addLine(`${prompt} ${input}`, 'input');
    setHistory((prev) => [...prev, input]);
    setHistoryIndex(-1);

    const [command, ...args] = input.split(' ');
    await executeCommand(command.toLowerCase(), args);

    setInput('');
  };

  const executeCommand = async (command: string, args: string[]) => {
    switch (command) {
      case 'ls':
      case 'dir':
        listDirectory();
        break;
      case 'cd':
        changeDirectory(args[0]);
        break;
      case 'mkdir':
        await makeDirectory(args[0]);
        break;
      case 'touch':
        await createFile(args[0]);
        break;
      case 'rm':
      case 'del':
        await removeFile(args[0]);
        break;
      case 'cat':
      case 'type':
        await catFile(args[0]);
        break;
      case 'pwd':
        printWorkingDirectory();
        break;
      case 'clear':
      case 'cls':
        setLines([]);
        break;
      case 'help':
        showHelp();
        break;
      case 'echo':
        addLine(args.join(' '));
        break;
      case 'date':
        addLine(new Date().toString());
        break;
      case 'whoami':
        addLine('Prakash Rai');
        break;
      default:
        addLine(
          `Command not found: ${command}. Type "help" to see available commands.`,
          'error'
        );
    }
  };

  const listDirectory = () => {
    const currentDirId = currentDirectory
      ? files.find((f) => f.name === currentDirectory && f.type === 'folder')
          ?.id ?? null
      : null;
    const children = getChildren(currentDirId);

    if (children.length === 0) {
      addLine('Directory is empty');
    } else {
      const folders = children.filter((f) => f.type === 'folder');
      const fileList = children.filter((f) => f.type === 'file');
      folders.forEach((file) => {
        addLine(`<span style="color: #58a6ff;">${file.name}</span>     &lt;DIR&gt;`);
      });
      fileList.forEach((file) => {
        addLine(file.name);
      });
    }
  };

  const changeDirectory = (path: string | undefined) => {
    if (!path) {
      setCurrentDirectory(null);
      return;
    }

    if (path === '..') {
      const currentDir = files.find(
        (f) => f.name === currentDirectory && f.type === 'folder'
      );
      if (currentDir?.parentId) {
        const parentDir = getFileById(currentDir.parentId);
        setCurrentDirectory(parentDir?.name ?? null);
      } else {
        setCurrentDirectory(null);
      }
      return;
    }

    if (path === '\\' || path === '/') {
      setCurrentDirectory(null);
      return;
    }

    const currentDirId = currentDirectory
      ? files.find((f) => f.name === currentDirectory && f.type === 'folder')
          ?.id ?? null
      : null;
    const targetDir = getFileByName(path, currentDirId);

    if (targetDir && targetDir.type === 'folder') {
      setCurrentDirectory(targetDir.name);
    } else {
      addLine(`cd: Cannot find path '${path}' because it does not exist.`, 'error');
    }
  };

  const makeDirectory = async (name: string | undefined) => {
    if (!name) {
      addLine('mkdir: missing operand', 'error');
      return;
    }

    try {
      const currentDirId = currentDirectory
        ? files.find((f) => f.name === currentDirectory && f.type === 'folder')
            ?.id ?? null
        : null;
      const existing = getFileByName(name, currentDirId);

      if (existing) {
        addLine(`mkdir: cannot create directory '${name}': File exists`, 'error');
        return;
      }

      addFile({
        parentId: currentDirId,
        name,
        type: 'folder',
      });
      addLine(`Directory '${name}' created`);
    } catch (error) {
      addLine(`mkdir: cannot create directory '${name}': An error occurred`, 'error');
    }
  };

  const createFile = async (name: string | undefined) => {
    if (!name) {
      addLine('touch: missing file operand', 'error');
      return;
    }

    try {
      const currentDirId = currentDirectory
        ? files.find((f) => f.name === currentDirectory && f.type === 'folder')
            ?.id ?? null
        : null;
      const existing = getFileByName(name, currentDirId);

      if (existing) {
        addLine(`touch: '${name}' already exists`);
        return;
      }

      addFile({
        parentId: currentDirId,
        name,
        type: 'file',
        content: '',
      });
      addLine(`File '${name}' created`);
    } catch (error) {
      addLine(`touch: cannot create file '${name}': An error occurred`, 'error');
    }
  };

  const removeFile = async (name: string | undefined) => {
    if (!name) {
      addLine('rm: missing operand', 'error');
      return;
    }

    const currentDirId = currentDirectory
      ? files.find((f) => f.name === currentDirectory && f.type === 'folder')
          ?.id ?? null
      : null;
    const file = getFileByName(name, currentDirId);

    if (!file) {
      addLine(`rm: cannot remove '${name}': No such file or directory`, 'error');
      return;
    }

    try {
      deleteFile(file.id);
      addLine(`Removed '${name}'`);
    } catch (error) {
      addLine(`rm: cannot remove '${name}': An error occurred`, 'error');
    }
  };

  const catFile = async (name: string | undefined) => {
    if (!name) {
      addLine('cat: missing file operand', 'error');
      return;
    }

    const currentDirId = currentDirectory
      ? files.find((f) => f.name === currentDirectory && f.type === 'folder')
          ?.id ?? null
      : null;
    const file = getFileByName(name, currentDirId);

    if (!file) {
      addLine(`cat: ${name}: No such file or directory`, 'error');
      return;
    }

    if (file.type === 'folder') {
      addLine(`cat: ${name}: Is a directory`, 'error');
      return;
    }

    addLine(`Contents of ${name}:`);
    addLine(file.content || '(File is empty)');
  };

  const printWorkingDirectory = () => {
    if (currentDirectory) {
      addLine(`C:\\Users\\Prakash\\${currentDirectory}`);
    } else {
      addLine('C:\\Users\\Prakash');
    }
  };

  const showHelp = () => {
    addLine('Available commands:');
    addLine('  help              - Show this help message');
    addLine('  clear, cls        - Clear the terminal screen');
    addLine('  echo <text>       - Echo text to terminal');
    addLine('  date              - Show current date and time');
    addLine('  whoami            - Show current user');
    addLine('  ls, dir           - List directory contents');
    addLine('  cd <path>         - Change directory');
    addLine('  pwd               - Print working directory');
    addLine('  mkdir <name>      - Create a new directory');
    addLine('  touch <name>      - Create a new file');
    addLine('  cat <file>        - Display file contents');
    addLine('  rm, del <name>    - Remove a file or directory');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      } else if (history.length > 0 && historyIndex === -1) {
        setHistoryIndex(0);
        setInput(history[history.length - 1]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple autocomplete - could be enhanced
      const lastWord = input.split(' ').pop() || '';
      const currentDirId = currentDirectory
        ? files.find((f) => f.name === currentDirectory && f.type === 'folder')
            ?.id ?? null
        : null;
      const matches = getChildren(currentDirId)
        .filter((f) => f.name.startsWith(lastWord))
        .map((f) => f.name);

      if (matches.length === 1) {
        setInput((prev) => prev.replace(new RegExp(`${lastWord}$`), matches[0]));
      } else if (matches.length > 1) {
        addLine(matches.join('  '));
      }
    }
  };

  const prompt = currentDirectory
    ? `PS C:\\Users\\Prakash\\${currentDirectory}>`
    : 'PS C:\\Users\\Prakash>';

  return (
    <div className="bg-[#0d1117] text-[#c9d1d9] font-mono text-sm w-full h-full flex flex-col overflow-hidden">
      {/* Terminal Content Area */}
      <div className="flex-grow overflow-y-auto p-4">
        {lines.map((line, index) => (
          <div
            key={index}
            className={`mb-1 ${
              line.type === 'input'
                ? 'text-[#58a6ff]'
                : line.type === 'error'
                  ? 'text-[#f85149]'
                  : 'text-[#c9d1d9]'
            }`}
          >
            <span dangerouslySetInnerHTML={{ __html: line.text }} />
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <form
        className="flex items-center bg-[#161b22] border-t border-[#30363d] px-4 py-2"
        onSubmit={handleSubmit}
      >
        <span className="text-[#58a6ff] mr-2 select-none">{prompt}</span>
        <input
          ref={inputRef}
          className="flex-grow bg-transparent outline-none text-[#c9d1d9] caret-[#58a6ff]"
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </form>
    </div>
  );
}

