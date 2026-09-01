// DashboardHeader.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, BellRing, ChevronDown, User } from 'lucide-react';
import { useNotifications } from '../../notifications/NotificationsContext';
import IssueDetailModal from '../../notifications/IssueDetailModal';

interface ProfileData {
  name: string;
  role: string;
  email: string;
  phone?: string;
  avatar?: string;
  employeeId?: string;
  [key: string]: any;
}

interface DashboardHeaderProps {
  title?: string;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  onProfileClick?: () => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

const DashboardHeader = ({
  title = 'DASHBOARD',
  userName,
  userRole,
  userAvatar,
  onProfileClick,
  notificationCount = 0,
  onNotificationClick,
}: DashboardHeaderProps) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [formattedTime, setFormattedTime] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);


  // NEW: profile dropdown open/close
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    getById,
  } = useNotifications();

  const fetchProfileData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token =
        localStorage.getItem('token') || sessionStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/employees/profile`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token.replace('Bearer ', '').trim()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch profile`);
      }

      const apiData = await response.json();
      console.log('DashboardHeader API response:', apiData);

      let actualData = apiData;
      if (apiData.data) actualData = apiData.data;
      else if (apiData.user) actualData = apiData.user;
      else if (apiData.employee) actualData = apiData.employee;
      else if (apiData.profile) actualData = apiData.profile;

      const transformedData: ProfileData = {
        name:
          actualData.name ||
          `${actualData.firstName || ''} ${actualData.lastName || ''}`.trim() ||
          'User',
        role:
          actualData.role ||
          actualData.designation ||
          'Partner',
        email:
          actualData.email ||
          actualData.emailAddress ||
          'Not provided',
        phone:
          actualData.phone ||
          actualData.phoneNumber ||
          actualData.contactNumber ||
          'Not provided',
        avatar:
          actualData.profilePicture ||
          actualData.avatar ||
          actualData.imageUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            actualData.name || 'User'
          )}&background=6938ef&color=fff&bold=true`,
        employeeId:
          actualData.employeeId ||
          actualData.id ||
          actualData.userId,
      };

      setProfileData(transformedData);
      localStorage.setItem('profileData', JSON.stringify(transformedData));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch profile'
      );
      console.error('DashboardHeader profile fetch error:', err);

      const savedProfile = localStorage.getItem('profileData');
      if (savedProfile) {
        try {
          setProfileData(JSON.parse(savedProfile));
        } catch (e) {
          console.error('Failed to parse saved profile:', e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      const date = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      const time = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      const displayTime = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      setCurrentDate(date);
      setCurrentTime(time);
      setFormattedTime(displayTime);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  // UPDATED: toggle profile menu instead of directly navigating
  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowProfileMenu((prev) => !prev);
  };

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    } else {
      setShowNotifications(!showNotifications);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleNotificationItemClick = async (id: number) => {
    await markAsRead(id);
    setSelectedNotificationId(id);
    setShowNotifications(false);
  };

  const displayCount =
    notificationCount > 0 ? notificationCount : unreadCount;

  const displayName = userName || profileData?.name || 'User';
  const displayRole = userRole || profileData?.role || 'Employee';
  const displayAvatar = userAvatar || profileData?.avatar;

  const getAvatarUrl = () => {
    if (displayAvatar) return displayAvatar;
    const nameToUse = displayName || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      nameToUse
    )}&background=6938ef&color=fff&bold=true`;
  };

  const avatarUrl = getAvatarUrl();

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = e.target as HTMLImageElement;
    const name = displayName || 'User';
    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=6938ef&color=fff&bold=true`;
  };

  const selectedNotification =
    selectedNotificationId !== null
      ? getById(selectedNotificationId)
      : undefined;

  // NEW: logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('profileData');
    setShowProfileMenu(false);
    navigate('/');
  };

  // OPTIONAL: close profile menu when clicking outside
  useEffect(() => {
    const onClickOutside = () => {
      setShowProfileMenu(false);
    };
    if (showProfileMenu) {
      window.addEventListener('click', onClickOutside);
    }
    return () => {
      window.removeEventListener('click', onClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-5 py-2 md:py-3 flex-shrink-0 shadow-sm">
        <div className="flex items-center justify-between w-full">
          {/* Left side - Title */}
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
              {title}
            </h1>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Date and Time */}
            <div className="hidden md:flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Date:</span>
                <span className="text-sm font-semibold text-gray-800">
                  {currentDate}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Time:</span>
                <span className="text-sm font-semibold text-gray-800">
                  {formattedTime}
                </span>
              </div>
            </div>

            {/* Mobile Date/Time */}
            <div className="md:hidden flex items-center gap-2">
              <div className="text-right">
                <div className="text-xs font-semibold text-gray-800">
                  {currentDate}
                </div>
                <div className="text-xs font-semibold text-gray-800">
                  {formattedTime}
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={handleNotificationClick}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#6938ef] focus:ring-offset-2"
                title="Notifications"
                aria-label={`Notifications ${displayCount > 0 ? `(${displayCount} unread)` : ''
                  }`}
              >
                {displayCount > 0 ? (
                  <BellRing className="w-5 h-5 text-gray-600 hover:text-[#6938ef] transition-colors" />
                ) : (
                  <Bell className="w-5 h-5 text-gray-600 hover:text-[#6938ef] transition-colors" />
                )}

                {displayCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {displayCount > 9 ? '9+' : displayCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-sm text-[#6938ef] hover:text-[#8b5cf6] font-medium"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {notifications.map((notification) => {
                            // Color coding: red = issue, green = approved, grey = other
                            const isIssue =
                              notification.issueType === 'InvoiceIssue' ||
                              notification.issueType === 'QuotationIssue';
                            const isApproved =
                              (notification.issueType === 'QuotationStatus' ||
                                notification.issueType === 'InvoiceStatus') &&
                              (notification.title.toLowerCase().includes('accepted') ||
                                notification.title.toLowerCase().includes('approved'));

                            const borderColor = isIssue
                              ? 'border-l-red-500'
                              : isApproved
                                ? 'border-l-green-500'
                                : 'border-l-gray-300';

                            return (
                              <div
                                key={notification.id}
                                onClick={() =>
                                  handleNotificationItemClick(notification.id)
                                }
                                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${borderColor} ${!notification.isRead ? 'bg-blue-50' : ''
                                  }`}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) =>
                                  e.key === 'Enter' &&
                                  handleNotificationItemClick(notification.id)
                                }
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p
                                      className={`text-sm font-semibold ${isIssue
                                          ? 'text-red-700'
                                          : isApproved
                                            ? 'text-green-700'
                                            : 'text-gray-900'
                                        }`}
                                    >
                                      {notification.title}
                                    </p>
                                    <p
                                      className={`text-xs mt-0.5 line-clamp-2 ${!notification.isRead
                                          ? 'text-gray-700'
                                          : 'text-gray-500'
                                        }`}
                                    >
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {new Date(
                                        notification.createdAt
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                  {!notification.isRead && (
                                    <div className="w-2 h-2 ml-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">
                            No notifications
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            You're all caught up!
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/notifications');
                        }}
                        className="w-full text-center text-sm text-[#6938ef] hover:text-[#8b5cf6] font-medium py-2"
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="hidden md:block h-8 w-px bg-gray-300"></div>

            {/* Profile Button + Dropdown */}
            <div className="relative">
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6938ef] focus:ring-offset-2 group relative"
                title="View Profile"
                aria-label={`Profile of ${displayName} - ${displayRole}`}
                disabled={isLoading}
              >
                <span className="sm:hidden absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Profile
                </span>

                <div className="hidden sm:flex flex-col items-end">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-semibold text-gray-800 group-hover:text-[#6938ef] transition-colors truncate max-w-[120px]">
                        {displayName}
                      </span>
                      <span className="text-xs text-gray-600 group-hover:text-[#8b5cf6] transition-colors truncate max-w-[120px]">
                        {displayRole}
                      </span>
                    </>
                  )}
                </div>

                <div className="relative">
                  {isLoading ? (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                  ) : (
                    <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-300 group-hover:border-[#6938ef] transition-colors">
                        <img
                          src={avatarUrl}
                          alt={`${displayName}'s avatar`}
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-green-500"></div>
                    </>
                  )}
                </div>

                <ChevronDown className="hidden lg:block w-4 h-4 text-gray-400 group-hover:text-[#6938ef] transition-colors" />
              </button>

              {/* Profile dropdown menu */}
              {showProfileMenu && !isLoading && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {selectedNotification && (
        <IssueDetailModal
          notification={selectedNotification}
          onClose={() => setSelectedNotificationId(null)}
        />
      )}
    </>
  );
};

export default DashboardHeader;
