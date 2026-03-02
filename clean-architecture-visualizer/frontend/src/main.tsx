import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  try {
    const { worker } = await import('./mocks/browser');
    // `worker.start()` returns a promise; we await it to ensure 
    // mocks are ready before the app fetches data.
    await worker.start({
      onUnhandledRequest: 'warn', 
    });
  } catch (error) {
    console.error('MSW failed to initialize:', error);
    // don't throw here so the app can still try to load 
    // (perhaps connecting to a local backend instead).
  }
}

const rootElement = document.getElementById('root')!;

enableMocking().then(() => {
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  );
});