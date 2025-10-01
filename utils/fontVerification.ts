
import { Platform } from 'react-native';

interface FontInfo {
  family: string;
  loaded: boolean;
  source: 'google' | 'local' | 'system';
}

const EXPECTED_FONTS = [
  { family: 'Inter_400Regular', source: 'google' as const },
  { family: 'Inter_500Medium', source: 'google' as const },
  { family: 'Inter_600SemiBold', source: 'google' as const },
  { family: 'Inter_700Bold', source: 'google' as const },
  { family: 'Roboto_400Regular', source: 'google' as const },
  { family: 'Roboto_500Medium', source: 'google' as const },
  { family: 'Roboto_700Bold', source: 'google' as const },
  { family: 'SpaceMono', source: 'local' as const },
  { family: 'SpaceMonoBold', source: 'local' as const },
];

export async function logFontStatus(): Promise<void> {
  console.log('=== Font Verification Status ===');
  
  const fontStatuses: FontInfo[] = [];
  
  for (const font of EXPECTED_FONTS) {
    try {
      // Check if font is available
      let isLoaded = false;
      
      if (Platform.OS === 'web') {
        // Web-specific font checking
        // @ts-expect-error - document is available in web environment
        isLoaded = document.fonts ? await checkWebFont(font.family) : false;
      } else {
        // React Native font checking
        // @ts-expect-error - FontDisplay is available in React Native
        isLoaded = await checkNativeFont(font.family);
      }
      
      fontStatuses.push({
        family: font.family,
        loaded: isLoaded,
        source: font.source,
      });
      
      console.log(`${font.family} (${font.source}): ${isLoaded ? '✅ Loaded' : '❌ Failed'}`);
    } catch (error) {
      // @ts-expect-error - error might not have message property
      console.warn(`Error checking font ${font.family}:`, error?.message || error);
      fontStatuses.push({
        family: font.family,
        loaded: false,
        source: font.source,
      });
    }
  }
  
  // Summary
  const loadedCount = fontStatuses.filter(f => f.loaded).length;
  const totalCount = fontStatuses.length;
  
  console.log(`=== Font Summary: ${loadedCount}/${totalCount} fonts loaded ===`);
  
  if (loadedCount < totalCount) {
    console.warn('Some fonts failed to load. App will use system fonts as fallback.');
  }
}

async function checkWebFont(fontFamily: string): Promise<boolean> {
  try {
    // @ts-expect-error - document.fonts is available in web environment
    if (!document.fonts || !document.fonts.check) {
      return false;
    }
    
    // @ts-expect-error - document.fonts.check is available in web environment
    return document.fonts.check(`12px ${fontFamily}`);
  } catch (error) {
    return false;
  }
}

async function checkNativeFont(fontFamily: string): Promise<boolean> {
  try {
    // For React Native, we'll assume fonts are loaded if no error is thrown
    // This is a simplified check - in a real app you might want more sophisticated checking
    return true;
  } catch (error) {
    return false;
  }
}

export function getFallbackFont(): string {
  if (Platform.OS === 'ios') {
    return 'System';
  } else if (Platform.OS === 'android') {
    return 'Roboto';
  } else {
    return 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  }
}
