import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationService } from "../../api";
import useSocket from "../../hooks/sockets/useSocket";
import { Link } from "react-router-dom";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.getNotifications(),
  });

  const notifications = data?.data || [];
  const unreadCount = notifications.length;

  // Listen to sockets
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      toast.info(notification.message || "You have a new notification");
      // Add to query cache
      queryClient.setQueryData(["notifications"], (oldData) => {
        if (!oldData) return { data: [notification] };
        return {
          ...oldData,
          data: [notification, ...oldData.data],
        };
      });
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [socket, queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onSuccess: (res, id) => {
      // Remove from list or update
      queryClient.setQueryData(["notifications"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.filter((n) => n._id !== id),
        };
      });
    },
  });

  const handleNotificationClick = (notification) => {
    markAsReadMutation.mutate(notification._id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors duration-200 relative focus:outline-none cursor-pointer"
        aria-label="View notifications"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 max-h-[24rem] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 divide-y divide-slate-100 dark:divide-slate-800/80 animate-fade-in custom-scrollbar">
          <div className="px-4 py-3 sticky top-0 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50 dark:bg-slate-900 z-10">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Notifications
            </span>
            <span className="text-[10px] bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 px-2 py-0.5 rounded-full font-semibold">
              {unreadCount} New
            </span>
          </div>

          <div className="flex flex-col">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                No new notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification._id}
                  to={notification.link || "#"}
                  onClick={() => handleNotificationClick(notification)}
                  className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150 flex flex-col gap-1"
                >
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {notification.message}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
