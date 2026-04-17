import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../test-utils';
import UseCaseInteractionCode from '@/pages/UseCaseInteractionCode';
import { useParams, useNavigate } from 'react-router-dom';

// Mock React Router hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
  };
});

describe('UseCaseInteractionCode Page', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
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
});