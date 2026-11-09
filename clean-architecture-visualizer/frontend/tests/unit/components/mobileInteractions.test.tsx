import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { useLocation, useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NavBar from '../../../src/components/common/NavBar';
import { SideBar } from '../../../src/components/diagram/SideBar';
import { fireEvent, render, screen, waitFor } from '../../test-utils';

const viewport = vi.hoisted(() => ({ desktop: false }));
vi.mock('@mui/material', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@mui/material')>()),
  useMediaQuery: () => viewport.desktop,
}));

function NavigationHarness() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <NavBar />
      <output aria-label="Current route">{location.pathname}</output>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          navigate('/checker');
        }}
      >
        Navigate externally
      </button>
    </>
  );
}

beforeEach(() => {
  viewport.desktop = false;
});

describe('Mobile navigation', () => {
  it('opens and closes with the toggle and connects it to the navigation links', async () => {
    const user = userEvent.setup();
    render(<NavBar />);
    const toggle = screen.getByRole('button', { name: 'navBar.openMenu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const panel = document.getElementById(
      toggle.getAttribute('aria-controls') ?? ''
    );
    expect(panel).toContainElement(
      screen.getByRole('link', { name: 'navBar.checker' })
    );
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it.each([
    ['navBar.home', '/'],
    ['navBar.checker', '/checker'],
    ['navBar.start', '/project-starter'],
  ])('navigates through %s and closes the menu', async (name, path) => {
    const user = userEvent.setup();
    render(<NavigationHarness />);
    await user.click(screen.getByRole('button', { name: 'navBar.openMenu' }));
    await user.click(screen.getAllByRole('link', { name }).slice(-1)[0]);
    expect(screen.getByLabelText('Current route')).toHaveTextContent(path);
    expect(
      screen.getByRole('button', { name: 'navBar.openMenu' })
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape and restores focus to the toggle', async () => {
    const user = userEvent.setup();
    render(<NavBar />);
    const toggle = screen.getByRole('button', { name: 'navBar.openMenu' });
    await user.click(toggle);
    await user.tab();
    expect(
      screen.getAllByRole('link', { name: 'navBar.home' }).slice(-1)[0]
    ).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(toggle).toHaveFocus();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps Safari-style null-target blur from swallowing a navigation tap', async () => {
    const user = userEvent.setup();
    render(<NavigationHarness />);
    const toggle = screen.getByRole('button', { name: 'navBar.openMenu' });
    await user.click(toggle);
    fireEvent.blur(toggle, { relatedTarget: null });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('link', { name: 'navBar.checker' }));
    expect(screen.getByLabelText('Current route')).toHaveTextContent(
      '/checker'
    );
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes when focus moves outside the navigation', async () => {
    const user = userEvent.setup();
    render(<NavigationHarness />);
    const toggle = screen.getByRole('button', { name: 'navBar.openMenu' });
    await user.click(toggle);
    fireEvent.blur(toggle, {
      relatedTarget: screen.getByRole('button', {
        name: 'Navigate externally',
      }),
    });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes when clicking outside without a route change', async () => {
    const user = userEvent.setup();
    render(<NavigationHarness />);
    const toggle = screen.getByRole('button', { name: 'navBar.openMenu' });
    await user.click(toggle);
    await user.click(screen.getByLabelText('Current route'));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on programmatic navigation', async () => {
    const user = userEvent.setup();
    render(<NavigationHarness />);
    const toggle = screen.getByRole('button', { name: 'navBar.openMenu' });
    await user.click(toggle);
    // The harness stops propagation so click-away cannot hide a broken route effect.
    fireEvent.click(
      screen.getByRole('button', { name: 'Navigate externally' }),
      { detail: 0 }
    );
    expect(screen.getByLabelText('Current route')).toHaveTextContent(
      '/checker'
    );
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('links Learn to the external learning site in a separate tab', async () => {
    const user = userEvent.setup();
    render(<NavBar />);
    await user.click(screen.getByRole('button', { name: 'navBar.openMenu' }));
    const link = screen.getByRole('link', { name: 'navBar.learn' });
    expect(link).toHaveAttribute(
      'href',
      'https://ca-visualizer-for-education.github.io/cave-learn/'
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await user.click(link);
    expect(
      screen.getByRole('button', { name: 'navBar.openMenu' })
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('resets the disclosure state after desktop and mobile breakpoint changes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<NavBar />);
    const toggle = screen.getByRole('button', { name: 'navBar.openMenu' });
    await user.click(toggle);
    viewport.desktop = true;
    rerender(<NavBar />);
    viewport.desktop = false;
    rerender(<NavBar />);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Mobile violations drawer', () => {
  it.each(['close button', 'Escape'])(
    'opens the dialog and closes with %s, restoring focus',
    async (method) => {
      const user = userEvent.setup();
      render(
        <SideBar defaultOpen>
          <p>Violation details</p>
        </SideBar>
      );
      const toggle = screen.getByRole('button', { name: 'sidebar.open' });
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      await user.click(toggle);
      expect(
        screen.getByRole('dialog', { name: 'sidebar.title' })
      ).toHaveTextContent('Violation details');
      if (method === 'Escape') await user.keyboard('{Escape}');
      else
        await user.click(screen.getByRole('button', { name: 'sidebar.close' }));
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      );
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(toggle).toHaveFocus();
    }
  );

  it('restores the desktop preference and resets mobile state across breakpoint changes', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const sidebar = (
      <SideBar isOpen onOpenChange={onOpenChange}>
        <p>Violation details</p>
      </SideBar>
    );
    const { rerender } = render(sidebar);
    await user.click(screen.getByRole('button', { name: 'sidebar.open' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    viewport.desktop = true;
    rerender(
      <SideBar isOpen onOpenChange={onOpenChange}>
        <p>Violation details</p>
      </SideBar>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'sidebar.collapse' })
    ).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Violation details')).toBeVisible();
    viewport.desktop = false;
    rerender(sidebar);
    expect(
      screen.getByRole('button', { name: 'sidebar.open' })
    ).toHaveAttribute('aria-expanded', 'false');
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
