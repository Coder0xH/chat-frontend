import React from 'react';
import { RecoilRoot } from 'recoil';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ChatRoute } from './routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './hooks';
import { ToastProvider } from './Providers';
import Toast from './components/ui/Toast';
import { FileMapContext } from './Providers/FileMapContext';
import { AuthContextProvider } from './hooks/AuthContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// 创建无需身份验证的简化路由
const router = createBrowserRouter([
  {
    path: '/',
    element: <ChatRoute />,
  },
  {
    path: '/c/:conversationId',
    element: <ChatRoute />,
  },
  {
    path: '/chat/:conversationId',
    element: <ChatRoute />,
  },
  {
    path: '*',
    element: <ChatRoute />,
  }
]);

const queryClient = new QueryClient();

// 创建一个空的文件映射
const fileMap = new Map();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <DndProvider backend={HTML5Backend}>
          <ThemeProvider>
            <AuthContextProvider>
              <ToastProvider>
                <FileMapContext.Provider value={fileMap}>
                  <RouterProvider router={router} />
                  <Toast />
                </FileMapContext.Provider>
              </ToastProvider>
            </AuthContextProvider>
          </ThemeProvider>
        </DndProvider>
      </RecoilRoot>
    </QueryClientProvider>
  );
};

export default App;
