import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { MenuIcon, XIcon, BellIcon, UserIcon, LogOutIcon, TicketIcon, CalendarIcon, HomeIcon } from 'lucide-react';
const Layout: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const {
    user,
    logout
  } = useAuth();
  const {
    unreadCount
  } = useNotifications();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return <div className="min-h-screen bg-gray-50 flex flex-col" >
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center">
                  <TicketIcon className="h-8 w-8 text-indigo-600" />
                  <span className="ml-2 text-xl font-bold text-gray-900">
                    EventTix
                  </span>
                </Link>
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Home
                </Link>
                <Link to="/events" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Events
                </Link>
                {user?.role === 'admin' && <Link to="/admin" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Admin
                  </Link>}
              </nav>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {user ? <>
                  <Link to="/notifications" className="p-1 rounded-full text-gray-400 hover:text-gray-500 relative">
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" />
                    {unreadCount > 0 && <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-xs text-white text-center">
                        {unreadCount}
                      </span>}
                  </Link>
                  <div className="ml-3 relative">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-700">
                        {user.name}
                      </span>
                      <button onClick={handleLogout} className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                        <span className="sr-only">Log out</span>
                        <LogOutIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                </> : <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-gray-500 hover:text-gray-700 font-medium">
                    Log in
                  </Link>
                  <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                    Sign up
                  </Link>
                </div>}
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none">
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? <XIcon className="block h-6 w-6" /> : <MenuIcon className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        {isMobileMenuOpen && <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link to="/" className="bg-indigo-50 border-indigo-500 text-indigo-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="flex items-center">
                  <HomeIcon className="h-5 w-5 mr-2" />
                  Home
                </div>
              </Link>
              <Link to="/events" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Events
                </div>
              </Link>
              {user?.role === 'admin' && <Link to="/admin" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                  Admin Dashboard
                </Link>}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              {user ? <>
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <UserIcon className="h-10 w-10 text-gray-400 bg-gray-100 rounded-full p-2" />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        {user.name}
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        {user.email}
                      </div>
                    </div>
                    <Link to="/notifications" className="ml-auto flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 relative" onClick={() => setIsMobileMenuOpen(false)}>
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" />
                      {unreadCount > 0 && <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-xs text-white text-center">
                          {unreadCount}
                        </span>}
                    </Link>
                  </div>
                  <div className="mt-3 space-y-1">
                    <button onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }} className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                      <div className="flex items-center">
                        <LogOutIcon className="h-5 w-5 mr-2" />
                        Sign out
                      </div>
                    </button>
                  </div>
                </> : <div className="mt-3 space-y-1">
                  <Link to="/login" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
                    Log in
                  </Link>
                  <Link to="/register" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign up
                  </Link>
                </div>}
            </div>
          </div>}
      </header>
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow content-center w-full">
        {children}
      </main>
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start">
              <Link to="/" className="flex items-center">
                <TicketIcon className="h-6 w-6 text-indigo-600" />
                <span className="ml-2 text-lg font-semibold text-gray-900">
                  EventTix
                </span>
              </Link>
            </div>
            <div className="mt-8 md:mt-0">
              <p className="text-center text-sm text-gray-500">
                &copy; 2023 EventTix. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Layout;