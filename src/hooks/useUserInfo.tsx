import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useContext, ReactNode } from 'react';

export interface UserInfo {
  user_id: string;
  user_name: string;
  email: string;
  avatar: string;
}

// Initialize Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      staleTime: 1000 * 30, // 30 seconds (reduced from 5 minutes)
      cacheTime: 1000 * 60 * 5, // 5 minutes (reduced from 30 minutes)
    }
  }
});

// Create Context
const UserInfoContext = createContext<ReturnType<typeof useUserInfoQuery> | undefined>(undefined);

// Query function to fetch user info
const fetchUserInfo = async (): Promise<UserInfo> => {
  const response = await fetch('/api/user/info', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const result = await response.json();
  if (!result.data) {
    throw new Error(result.message || 'Failed to obtain user information');
  }

  return {
    user_id: result.data.user_id || '',
    user_name: result.data.username || result.data.user_name || '',
    email: result.data.email || '',
    avatar: result.data.avatar || ''
  };
};

// Hook to use the user info query
const useUserInfoQuery = () => {
  return useQuery({
    queryKey: ['userInfo'],
    queryFn: fetchUserInfo,
    retry: 1,
    refetchOnMount: true,
    refetchOnReconnect: true,
    onError: (error) => {
      console.error('Error fetching user info:', error);
    },
  });
};

// Provider component
export const UserInfoProvider = ({ children }: { children: ReactNode }) => {
  const queryInfo = useUserInfoQuery();

  return (
    <UserInfoContext.Provider value={queryInfo}>
      {children}
    </UserInfoContext.Provider>
  );
};

// Custom hook to use the user info context
export const useUserInfo = () => {
  const context = useContext(UserInfoContext);
  if (context === undefined) {
    throw new Error('useUserInfo must be used within a UserInfoProvider');
  }
  return context;
};

// Query client provider wrapper
export const ReactQueryProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}; 