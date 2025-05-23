import React, { createContext, useContext, useState, useEffect } from "react";
import { notification } from "antd";
import {
  CheckCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  SoundOutlined,
} from "@ant-design/icons";

const NotificationContext = createContext();

// Load notifications from localStorage
const loadNotifications = () => {
  try {
    const savedNotifications = localStorage.getItem("notifications");
    return savedNotifications ? JSON.parse(savedNotifications) : [];
  } catch (error) {
    console.error("Error loading notifications:", error);
    return [];
  }
};

// Save notifications to localStorage
const saveNotifications = (notifications) => {
  try {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  } catch (error) {
    console.error("Error saving notifications:", error);
  }
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(loadNotifications);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Calculate unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter((notif) => !notif.read).length;
    setUnreadCount(count);
    saveNotifications(notifications);
  }, [notifications]);

  // Play notification sound
  const playNotificationSound = () => {
    if (soundEnabled) {
      try {
        // Use a simple beep sound using the Web Audio API
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch (error) {
        console.warn("Could not play notification sound:", error);
        // Silently fail - sound is not critical
      }
    }
  };

  const addNotification = (type, title, message, category = "general") => {
    const newNotification = {
      id: Date.now(),
      type,
      title,
      message,
      category,
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);
    playNotificationSound();

    // Show notification in top-right corner with animation
    notification[type]({
      message: title,
      description: message,
      placement: "topRight",
      duration: 4.5,
      icon:
        type === "success" ? (
          <CheckCircleOutlined style={{ color: "#52c41a" }} />
        ) : type === "warning" ? (
          <WarningOutlined style={{ color: "#faad14" }} />
        ) : (
          <InfoCircleOutlined style={{ color: "#1890ff" }} />
        ),
      className: "notification-animation",
    });
  };

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const getNotificationsByCategory = (category) => {
    return notifications.filter((notif) => notif.category === category);
  };

  const clearNotificationsByCategory = (category) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.category !== category)
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        soundEnabled,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAllNotifications,
        toggleSound,
        getNotificationsByCategory,
        clearNotificationsByCategory,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
