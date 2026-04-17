/* eslint-disable react-refresh/only-export-components */
import { render, RenderOptions, renderHook, RenderHookOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import React, { ReactElement } from 'react';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};


const customRenderHook = <Result, Props>(
  render: (props: Props) => Result,
  options?: RenderHookOptions<Props>,
) => {
  return renderHook(render, {
    wrapper: AllTheProviders, 
    ...options,
  });
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render, customRenderHook as renderHook };