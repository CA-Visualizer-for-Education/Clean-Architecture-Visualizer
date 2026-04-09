import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { render, screen, fireEvent } from '../../test-utils';
import { FileExplorer } from '@/components/code/FileExplorer';
import { server } from '@/mocks/server';
import { FileNode } from '@/lib';

describe('FileExplorer Component', () => {
  const defaultProps = {
    onSelect: vi.fn(),
    activeFilePath: null,
  };

  const mockFileTree: FileNode = {
  id: 'root',
  name: 'root',
  type: 'directory',
  path: '/',
  children: [
    { id: '1', name: 'src', type: 'directory', path: 'src/', children: [] },
    { id: '2', name: 'package.json', type: 'file', path: 'package.json' },
  ],
};

it('toggles folder expansion when the icon is clicked', async () => {
  server.use(
    http.get('*/api/codebase/file-tree', () => HttpResponse.json(mockFileTree))
  );

  render(<FileExplorer {...defaultProps} />);

  await screen.findByText('src');
  const toggleIcon = screen.getByTestId('ChevronRightIcon');
  
  fireEvent.click(toggleIcon);

  const expandedIcon = await screen.findByTestId('ExpandMoreIcon');
  expect(expandedIcon).toBeInTheDocument();
});

it('auto-expands folders based on activeFilePath', async () => {
  server.use(
    http.get('*/api/codebase/file-tree', () => HttpResponse.json(mockFileTree))
  );

  render(
    <FileExplorer {...defaultProps} activeFilePath="src/App.tsx" />
  );

  await screen.findByText('src');
  
  const expandIcon = await screen.findByTestId('ExpandMoreIcon');
  expect(expandIcon).toBeInTheDocument();
});
});