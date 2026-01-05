import Taskbar from '@/components/system/Taskbar';

export default function DesktopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen overflow-hidden">
      <main className="flex-grow overflow-hidden relative">
        {children}
      </main>
      <Taskbar />
    </div>
  );
}

