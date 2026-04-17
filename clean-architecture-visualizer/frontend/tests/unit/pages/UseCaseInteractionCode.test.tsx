import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../test-utils';
import UseCaseInteractionCode from '@/pages/UseCaseInteractionCode';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

vi.mock('@/components/code/FileExplorer', () => ({
  FileExplorer: ({ onSelect }: { onSelect: (path: string) => void }) => (
    <button onClick={() => onSelect('src/views/UserSignOutView.java')}>
      pick-file
    </button>
  ),
}));

vi.mock('@/components/code/CodeViewer', () => ({
  CodeViewer: ({
    filePath,
    onFileChange,
  }: {
    filePath: string | null;
    onFileChange: (path: string) => void;
  }) => (
    <div>
      <span data-testid="active-file-path">{filePath ?? 'none'}</span>
      <button onClick={() => onFileChange('src/framework_drivers/Database.java')}>
        follow-relation
      </button>
    </div>
  ),
}));

// Mock React Router hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(),
  };
});

describe('UseCaseInteractionCode Page', () => {
  const mockNavigate = vi.fn();
  const mockSetSearchParams = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams(), mockSetSearchParams]);
  });

  it('renders error message when interactionId is missing', () => {
    vi.mocked(useParams).mockReturnValue({});

    render(<UseCaseInteractionCode />);

    expect(screen.getByText(/Error: Interaction ID is missing/i)).toBeInTheDocument();
  });

  it('renders the layout with correct action buttons', () => {
    vi.mocked(useParams).mockReturnValue({ 
      useCaseId: 'uc-123', 
      interactionId: 'int-456' 
    });

    render(<UseCaseInteractionCode />);

    expect(screen.getByText('actions.backToDiagram')).toBeInTheDocument();
    expect(screen.getByText('actions.backToPrevious')).toBeInTheDocument();
  });

  it('navigates back to the diagram view when the button is clicked', () => {
    vi.mocked(useParams).mockReturnValue({ 
      useCaseId: 'uc-123', 
      interactionId: 'int-456' 
    });

    render(<UseCaseInteractionCode />);

    const diagramBtn = screen.getByText('actions.backToDiagram');
    fireEvent.click(diagramBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/use-case/uc-123/interaction/int-456/diagram');
  });

  it('manages the "Back to Previous" button state correctly', () => {
    vi.mocked(useParams).mockReturnValue({ 
      useCaseId: 'uc-123', 
      interactionId: 'int-456' 
    });

    render(<UseCaseInteractionCode />);

    const backBtn = screen.getByText('actions.backToPrevious').closest('button');
    
    expect(backBtn).toBeDisabled();
  });

  it('initializes selected file from the file query param', () => {
    vi.mocked(useParams).mockReturnValue({
      useCaseId: 'uc-123',
      interactionId: 'int-456',
    });
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams('file=src%2Finterface_adapters%2FUserSignOutController.java'),
      mockSetSearchParams,
    ]);

    render(<UseCaseInteractionCode />);

    expect(screen.getByTestId('active-file-path')).toHaveTextContent(
      'src/interface_adapters/UserSignOutController.java',
    );
  });

  it('updates query param when selecting a file from explorer', () => {
    vi.mocked(useParams).mockReturnValue({
      useCaseId: 'uc-123',
      interactionId: 'int-456',
    });

    render(<UseCaseInteractionCode />);

    fireEvent.click(screen.getByText('pick-file'));

    expect(mockSetSearchParams).toHaveBeenCalledWith(expect.any(Function), { replace: true });

    const updateFn = mockSetSearchParams.mock.calls.at(-1)?.[0] as (prev: URLSearchParams) => URLSearchParams;
    const updated = updateFn(new URLSearchParams());
    expect(updated.get('file')).toBe('src/views/UserSignOutView.java');
  });

  it('updates query param when navigating via code relations', () => {
    vi.mocked(useParams).mockReturnValue({
      useCaseId: 'uc-123',
      interactionId: 'int-456',
    });

    render(<UseCaseInteractionCode />);

    fireEvent.click(screen.getByText('follow-relation'));

    expect(mockSetSearchParams).toHaveBeenCalledWith(expect.any(Function), { replace: true });

    const updateFn = mockSetSearchParams.mock.calls.at(-1)?.[0] as (prev: URLSearchParams) => URLSearchParams;
    const updated = updateFn(new URLSearchParams());
    expect(updated.get('file')).toBe('src/framework_drivers/Database.java');
  });
});