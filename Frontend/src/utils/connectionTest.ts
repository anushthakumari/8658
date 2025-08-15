import { healthAPI } from '../services/api';

export const testConnection = async (): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    const healthData = await healthAPI.check();
    return {
      success: true,
      message: 'Successfully connected to backend API',
      data: healthData
    };
  } catch (error: any) {
    let message = 'Failed to connect to backend API';
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      message = 'Backend server is not running. Please start the backend server.';
    } else if (error.response?.status === 404) {
      message = 'API endpoint not found. Check backend configuration.';
    } else if (error.response?.status >= 500) {
      message = 'Backend server error. Check backend logs.';
    } else if (error.message) {
      message = error.message;
    }
    
    return {
      success: false,
      message,
      data: error.response?.data
    };
  }
};

export const testAuth = async (email: string, password: string): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    // First test a login attempt
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: 'Authentication test successful',
        data
      };
    } else {
      return {
        success: false,
        message: data.message || 'Authentication failed',
        data
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Authentication test failed: ${error.message}`,
      data: error
    };
  }
};

export const testDataFlow = async (token: string): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    // Test fetching projects
    const response = await fetch('/api/v1/projects?limit=5', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: 'Data flow test successful',
        data
      };
    } else {
      return {
        success: false,
        message: data.message || 'Data flow test failed',
        data
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Data flow test failed: ${error.message}`,
      data: error
    };
  }
};
