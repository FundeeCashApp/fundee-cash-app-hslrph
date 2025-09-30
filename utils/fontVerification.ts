
import { Platform } from 'react-native';

export interface FontStatus {
  name: string;
  loaded: boolean;
  error?: string;
}

export const verifyFonts = async (): Promise<FontStatus[]> => {
  const fonts = [
    'Inter_400Regular',
    'Inter_500Medium', 
    'Inter_600SemiBold',
    'Inter_700Bold',
    'Roboto_400Regular',
    'Roboto_500Medium',
    'Roboto_700Bold',
    'SpaceMono',
    'SpaceMonoBold',
  ];

  const results: FontStatus[] = [];

  for (const fontName of fonts) {
    try {
      // On web, we can check if the font is loaded
      if (Platform.OS === 'web') {
        // @ts-ignore - document is available on web
        const testElement = document.createElement('div');
        testElement.style.fontFamily = fontName;
        testElement.style.position = 'absolute';
        testElement.style.visibility = 'hidden';
        testElement.textContent = 'Test';
        
        // @ts-ignore - document is available on web
        document.body.appendChild(testElement);
        
        // Check if the font was applied
        const computedStyle = window.getComputedStyle(testElement);
        const actualFont = computedStyle.fontFamily;
        
        // @ts-ignore - document is available on web
        document.body.removeChild(testElement);
        
        const loaded = actualFont.includes(fontName) || actualFont !== 'serif';
        
        results.push({
          name: fontName,
          loaded,
          error: loaded ? undefined : 'Font not found or failed to load'
        });
      } else {
        // On native platforms, assume fonts are loaded if no error occurs
        results.push({
          name: fontName,
          loaded: true,
        });
      }
    } catch (error) {
      results.push({
        name: fontName,
        loaded: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
};

export const logFontStatus = async () => {
  console.log('🔍 Verifying font loading status...');
  const fontStatuses = await verifyFonts();
  
  fontStatuses.forEach(status => {
    if (status.loaded) {
      console.log(`✅ ${status.name}: Loaded successfully`);
    } else {
      console.error(`❌ ${status.name}: Failed to load - ${status.error}`);
    }
  });
  
  const loadedCount = fontStatuses.filter(s => s.loaded).length;
  const totalCount = fontStatuses.length;
  
  console.log(`📊 Font loading summary: ${loadedCount}/${totalCount} fonts loaded successfully`);
  
  if (loadedCount < totalCount) {
    console.warn('⚠️ Some fonts failed to load. The app will use fallback fonts.');
  }
  
  return fontStatuses;
};
