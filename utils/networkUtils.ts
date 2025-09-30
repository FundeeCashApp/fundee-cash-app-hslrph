
import { Alert } from 'react-native';

export interface NetworkTimeoutOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class NetworkTimeoutError extends Error {
  constructor(message: string, public readonly operation: string) {
    super(message);
    this.name = 'NetworkTimeoutError';
  }
}

export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number = 30000,
  operation: string = 'Network operation'
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new NetworkTimeoutError(`${operation} timed out after ${timeoutMs}ms`, operation));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (error) {
    if (error instanceof NetworkTimeoutError) {
      console.error(`⏰ Timeout: ${error.message}`);
      throw error;
    }
    throw error;
  }
};

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: NetworkTimeoutOptions = {}
): Promise<T> => {
  const {
    timeout = 30000,
    retries = 3,
    retryDelay = 1000
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${retries}`);
      return await withTimeout(operation(), timeout, `Attempt ${attempt}`);
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Attempt ${attempt} failed:`, error);

      if (attempt < retries) {
        console.log(`⏳ Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  // All retries failed
  console.error(`🚫 All ${retries} attempts failed`);
  throw lastError!;
};

export const handleNetworkError = (error: Error, operation: string) => {
  console.error(`Network error in ${operation}:`, error);

  if (error instanceof NetworkTimeoutError) {
    Alert.alert(
      'Connection Timeout',
      `The ${operation} request timed out. Please check your internet connection and try again.`,
      [{ text: 'OK' }]
    );
  } else if (error.message.includes('fetch')) {
    Alert.alert(
      'Network Error',
      `Unable to connect to the server. Please check your internet connection and try again.`,
      [{ text: 'OK' }]
    );
  } else {
    Alert.alert(
      'Error',
      `An error occurred during ${operation}. Please try again.`,
      [{ text: 'OK' }]
    );
  }
};

export const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    // Try to fetch a small resource to test connectivity
    const response = await fetch('https://httpbin.org/status/200', {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    console.error('Network connectivity check failed:', error);
    return false;
  }
};

export const logNetworkStatus = async () => {
  console.log('🌐 Checking network connectivity...');
  const isConnected = await checkNetworkConnection();
  
  if (isConnected) {
    console.log('✅ Network connection is working');
  } else {
    console.error('❌ Network connection failed');
    Alert.alert(
      'Network Issue',
      'Unable to connect to the internet. Please check your connection and try again.',
      [{ text: 'OK' }]
    );
  }
  
  return isConnected;
};
