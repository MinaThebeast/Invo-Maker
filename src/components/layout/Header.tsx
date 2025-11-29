import { Menu, Bell, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [statusBarPadding, setStatusBarPadding] = useState(0);

  useEffect(() => {
    const calculateStatusBarPadding = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
          if (Capacitor.getPlatform() === 'android') {
            // Android: Status bar is typically 24dp (24px at mdpi)
            // On modern devices, it can be 24-48px depending on density
            // Use a fixed value that works for most devices
            setStatusBarPadding(24); // Standard Android status bar height in pixels
          } else {
            // iOS: Use CSS env() variable, no JS padding needed
            setStatusBarPadding(0);
          }
        } else {
          setStatusBarPadding(0);
        }
      } catch (error) {
        // Fallback for web or if Capacitor not available
        setStatusBarPadding(0);
      }
    };

    calculateStatusBarPadding();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header 
      className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between sticky top-0 z-30 safe-area-top"
      style={{
        paddingTop: statusBarPadding > 0 
          ? `calc(${statusBarPadding}px + 0.5rem)` 
          : undefined
      }}
    >
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <img src="/logo-icon.svg" alt="INVO Maker" className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">
            <span className="hidden sm:inline">INVO Maker</span>
            <span className="sm:hidden">INVO</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        <button
          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg relative flex-shrink-0"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[100px] md:max-w-none">
              {user?.email?.split('@')[0]}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap"
          >
            <span className="hidden sm:inline">Sign Out</span>
            <span className="sm:hidden">Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

