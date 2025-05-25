import { ConfigProvider } from "antd";

// Restaurant brand colors
const colors = {
  primary: {
    main: "#eb9532", // Warm orange
    light: "#ffb74d",
    dark: "#f57c00",
  },
  secondary: {
    main: "#2e7d32", // Fresh green
    light: "#4caf50",
    dark: "#1b5e20",
  },
  accent: {
    gold: "#ffd700",
    cream: "#fff8e1",
    brown: "#5d4037",
  },
  neutral: {
    white: "#ffffff",
    light: "#f5f5f5",
    medium: "#e0e0e0",
    dark: "#757575",
    black: "#212121",
  },
  status: {
    success: "#4caf50",
    warning: "#ff9800",
    error: "#f44336",
    info: "#2196f3",
  },
};

// Custom theme configuration
export const customTheme = {
  token: {
    // Brand colors
    colorPrimary: colors.primary.main,
    colorPrimaryHover: colors.primary.light,
    colorPrimaryActive: colors.primary.dark,

    // Secondary colors
    colorSuccess: colors.secondary.main,
    colorWarning: colors.status.warning,
    colorError: colors.status.error,
    colorInfo: colors.status.info,

    // Neutral colors
    colorBgContainer: colors.neutral.white,
    colorBgElevated: colors.neutral.light,
    colorBgLayout: colors.neutral.light,
    colorText: colors.neutral.black,
    colorTextSecondary: colors.neutral.dark,

    // Typography
    fontFamily:
      "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
    borderRadius: 8,

    // Spacing
    padding: 24,
    margin: 16,
  },
  components: {
    // Button customization
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      paddingContentHorizontal: 24,
      colorPrimary: colors.primary.main,
      colorPrimaryHover: colors.primary.light,
      colorPrimaryActive: colors.primary.dark,
    },

    // Card customization
    Card: {
      borderRadius: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },

    // Input customization
    Input: {
      borderRadius: 8,
      controlHeight: 40,
    },

    // Menu customization
    Menu: {
      itemBg: colors.neutral.white,
      itemSelectedBg: colors.primary.light,
      itemSelectedColor: colors.primary.main,
      itemHoverBg: colors.neutral.light,
    },

    // Layout customization
    Layout: {
      headerBg: colors.neutral.white,
      siderBg: colors.neutral.white,
      bodyBg: colors.neutral.light,
    },

    // Table customization
    Table: {
      headerBg: colors.neutral.light,
      headerColor: colors.neutral.black,
      rowHoverBg: colors.neutral.light,
    },

    // Modal customization
    Modal: {
      borderRadius: 12,
    },

    // Drawer customization
    Drawer: {
      borderRadius: 12,
    },
  },
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
  return (
    <ConfigProvider
      theme={customTheme}
      componentSize="middle"
      space={{ size: "middle" }}
    >
      {children}
    </ConfigProvider>
  );
};

// Custom styles for common components
export const styles = {
  // Card styles
  card: {
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
  },

  // Button styles
  button: {
    borderRadius: 8,
    height: 40,
    padding: "0 24px",
  },

  // Input styles
  input: {
    borderRadius: 8,
    height: 40,
  },

  // Container styles
  container: {
    padding: 24,
    background: colors.neutral.white,
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },

  // Header styles
  header: {
    background: colors.neutral.white,
    padding: "0 24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },

  // Sidebar styles
  sidebar: {
    background: colors.neutral.white,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
};

// Export theme utilities
export const themeUtils = {
  // Color utilities
  colors,

  // Spacing utilities
  spacing: {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  },

  // Breakpoint utilities
  breakpoints: {
    xs: "480px",
    sm: "576px",
    md: "768px",
    lg: "992px",
    xl: "1200px",
    xxl: "1600px",
  },

  // Typography utilities
  typography: {
    h1: {
      fontSize: 48,
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 36,
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: 24,
      fontWeight: 600,
      lineHeight: 1.2,
    },
    body1: {
      fontSize: 16,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: 14,
      lineHeight: 1.5,
    },
  },
};
