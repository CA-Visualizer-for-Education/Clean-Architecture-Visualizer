import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '../../test-utils';
import ProjectStarter from '../../../src/pages/ProjectStarter';

const templateMock = vi.hoisted(() => ({
	generateMutation: vi.fn(),
	createMutation: vi.fn(),
	generatePending: false,
	createPending: false,
}));

vi.mock('@/actions/useTemplate', () => ({
	useGenerateProject: () => ({
		mutate: templateMock.generateMutation,
		isPending: templateMock.generatePending,
	}),
	useCreateUseCase: () => ({
		mutate: templateMock.createMutation,
		isPending: templateMock.createPending,
	}),
}));

describe('ProjectStarter Page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		templateMock.generatePending = false;
		templateMock.createPending = false;

		templateMock.generateMutation.mockImplementation((_payload, options) => {
			options?.onSuccess?.({ message: 'Project initiated successfully' });
		});

		templateMock.createMutation.mockImplementation((useCaseName, options) => {
			options?.onSuccess?.({ message: `Use case '${useCaseName}' created successfully` });
		});
	});

	it('renders the main Project Starter controls', () => {
		render(<ProjectStarter />);

		expect(screen.getByText('startNew.title')).toBeInTheDocument();
		expect(screen.getByText('addUseCase.title')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'startNew.button' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'addUseCase.button' })).toBeInTheDocument();
	});

	it('shows a success snackbar after generating a project', async () => {
		render(<ProjectStarter />);

		fireEvent.click(screen.getByRole('button', { name: 'startNew.button' }));

		expect(templateMock.generateMutation).toHaveBeenCalledWith(undefined, expect.any(Object));
		expect(await screen.findByText('Project initiated successfully')).toBeInTheDocument();
	});

	it('trims the use case name before creating files', async () => {
		render(<ProjectStarter />);

		const input = screen.getByLabelText('addUseCase.inputLabel');
		fireEvent.change(input, { target: { value: '  Add User  ' } });
		fireEvent.click(screen.getByRole('button', { name: 'addUseCase.button' }));

		expect(templateMock.createMutation).toHaveBeenCalledWith('Add User', expect.any(Object));
		expect(await screen.findByText("Use case 'Add User' created successfully")).toBeInTheDocument();
		expect(input).toHaveValue('');
	});

	it('does not submit when the use case name is blank', () => {
		render(<ProjectStarter />);

		const createButton = screen.getByRole('button', { name: 'addUseCase.button' });

		expect(createButton).toBeDisabled();
		expect(templateMock.createMutation).not.toHaveBeenCalled();
	});
});
