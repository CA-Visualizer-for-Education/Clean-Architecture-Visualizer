import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test-utils';
import { CodeViewer } from '@/components/code/CodeViewer';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';

vi.mock('@monaco-editor/react', () => ({
  default: () => <div data-testid="mock-monaco-editor" />,
}));

describe('CodeViewer Component', () => {
  const defaultProps = {
    interactionId: 'int-123',
    filePath: 'src/entities/User.ts',
    onFileChange: vi.fn(),
  };

  it('renders a prompt when no filePath is provided', () => {
    render(<CodeViewer {...defaultProps} filePath={null} />);
    expect(screen.getByText('selectFile')).toBeInTheDocument();
  });

  it('shows loading state while fetching file content', () => {
    render(<CodeViewer {...defaultProps} />);
    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('renders breadcrumbs correctly for a given path', async () => {
    server.use(
      http.get('*/api/codebase/interactions/int-123/files/*', () => {
        return HttpResponse.json({
          content: 'class User {}',
          language: 'typescript',
          layer: 'entities',
        });
      })
    );

    render(<CodeViewer {...defaultProps} />);

    const breadcrumbParts = await screen.findAllByText(/src|entities|User.ts/);
    expect(breadcrumbParts).toHaveLength(3);
  });

  it('shows an error state if the API fails', async () => {
    server.use(
      http.get('*/api/codebase/interactions/int-123/files/*', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(<CodeViewer {...defaultProps} />);

    const errorMessage = await screen.findByText('errorLoading');
    expect(errorMessage).toBeInTheDocument();
  });

  it('renders the editor once data is loaded', async () => {
    server.use(
      http.get('*/api/codebase/interactions/int-123/files/*', () => {
        return HttpResponse.json({
          content: 'const x = 10;',
          language: 'typescript',
        });
      })
    );

    render(<CodeViewer {...defaultProps} />);

    const editor = await screen.findByTestId('mock-monaco-editor');
    expect(editor).toBeInTheDocument();
  });
});