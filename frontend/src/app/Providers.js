'use client';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from '@/redux/store';
import HydrationHandler from '@/components/common/HydrationHandler';

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <HydrationHandler>
        {children}
      </HydrationHandler>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--bs)',
            color: '#fff',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '10px'
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' }
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' }
          }
        }}
      />
    </Provider>
  );
}
