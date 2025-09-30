
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#bb86fc',    // Fundee Cash primary color
  secondary: '#9c64f7',  // Darker purple
  accent: '#d4b3ff',     // Light purple
  background: '#ffffff', // White background for light theme
  backgroundAlt: '#f8f9fa', // Light gray background
  text: '#1a1a1a',       // Dark text for light theme
  textSecondary: '#6c757d', // Secondary text color
  grey: '#e9ecef',       // Light grey
  card: '#ffffff',       // White card background
  success: '#28a745',    // Green for success
  warning: '#ffc107',    // Yellow for warning
  danger: '#dc3545',     // Red for danger
  border: '#dee2e6',     // Border color
};

// Font families with fallbacks
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  robotoRegular: 'Roboto_400Regular',
  robotoMedium: 'Roboto_500Medium',
  robotoBold: 'Roboto_700Bold',
  // Fallback fonts
  fallbackRegular: 'SpaceMono',
  fallbackBold: 'SpaceMonoBold',
  // System fallbacks
  systemRegular: 'System',
  systemBold: 'System',
};

// Helper function to get font with fallbacks
export const getFontFamily = (fontWeight: 'regular' | 'medium' | 'semiBold' | 'bold' = 'regular') => {
  const fontMap = {
    regular: [fonts.regular, fonts.robotoRegular, fonts.fallbackRegular, fonts.systemRegular],
    medium: [fonts.medium, fonts.robotoMedium, fonts.fallbackRegular, fonts.systemRegular],
    semiBold: [fonts.semiBold, fonts.robotoBold, fonts.fallbackBold, fonts.systemBold],
    bold: [fonts.bold, fonts.robotoBold, fonts.fallbackBold, fonts.systemBold],
  };
  
  // Return the first available font, with system font as ultimate fallback
  return fontMap[fontWeight][0] || 'System';
};

export const buttonStyles = StyleSheet.create({
  instructionsButton: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    backgroundColor: colors.backgroundAlt,
    alignSelf: 'center',
    width: '100%',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: getFontFamily('bold'),
    textAlign: 'center',
    color: colors.text,
    marginBottom: 16
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: getFontFamily('semiBold'),
    textAlign: 'center',
    color: colors.text,
    marginBottom: 12
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: getFontFamily('regular'),
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'center',
  },
  textSecondary: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: getFontFamily('regular'),
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: getFontFamily('regular'),
    color: colors.text,
    width: '100%',
    marginBottom: 16,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: colors.text,
  },
  iconLarge: {
    width: 48,
    height: 48,
    tintColor: colors.primary,
  },
});
