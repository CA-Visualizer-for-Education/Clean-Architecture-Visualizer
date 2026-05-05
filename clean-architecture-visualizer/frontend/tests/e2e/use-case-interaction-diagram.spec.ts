import { test, expect } from '@playwright/test';

const interactionDiagramPath = '/use-case/uc-2/interaction/uc2in1/diagram';
const alternateInteractionDiagramPath = '/use-case/uc-2/interaction/uc2in2/diagram';
const interactionCodePath = '/use-case/uc-2/interaction/uc2in1/code';

test.describe('Use Case Interaction Diagram E2E', () => {
	test('switches interactions from the header dropdown while preserving sidebar state', async ({ page }) => {
		await page.goto(interactionDiagramPath);

		const sidebar = page.locator('aside');
		const interactionButton = page.getByRole('button', { name: 'Sign Out: Logout Logic' });

		await expect(page.getByLabel('Collapse sidebar')).toBeVisible();
		await page.getByLabel('Collapse sidebar').click();
		await expect(page.getByLabel('Expand sidebar')).toBeVisible();
		await page.getByLabel('Expand sidebar').click();
		await expect(page.getByLabel('Collapse sidebar')).toBeVisible();

		await interactionButton.click();
		await page.getByRole('menuitem', { name: 'Sign Out: Session Invalidation' }).click();

		await expect(page).toHaveURL(alternateInteractionDiagramPath);
		await expect(page.getByRole('button', { name: 'Sign Out: Session Invalidation' })).toBeVisible();
		await expect(page.getByLabel('Collapse sidebar')).toBeVisible();
		await expect(sidebar).toBeVisible();
	});

	test('opens the use case code view from the action button and keeps the sidebar state', async ({ page }) => {
		await page.goto(interactionDiagramPath);

		const viewCodeButton = page.getByRole('button', { name: 'actions.viewUseCaseInteractionCode' });
		await expect(viewCodeButton).toBeVisible();
		await viewCodeButton.click();

		await expect(page).toHaveURL(interactionCodePath);
		await expect(page.getByRole('button', { name: 'actions.backToDiagram' })).toBeVisible();
		await expect(page.getByLabel('Collapse sidebar')).toBeVisible();
		await expect(page.getByText('selectFile')).toBeVisible();

		await page.getByLabel('Collapse sidebar').click();
		await expect(page.getByLabel('Expand sidebar')).toBeVisible();

		await page.getByRole('button', { name: 'actions.backToDiagram' }).click();
		await expect(page).toHaveURL(interactionDiagramPath);
		await expect(page.getByLabel('Expand sidebar')).toBeVisible();
	});

	test('opens code directly from a CANode and preserves the sidebar state when returning to the diagram', async ({ page }) => {
		await page.goto(interactionDiagramPath);

		await expect(page.getByLabel('Collapse sidebar')).toBeVisible();
		await page.locator('[data-ca-node-id="UserSignOutController"]').click();

		await expect(page).toHaveURL(/\/use-case\/uc-2\/interaction\/uc2in1\/code\?file=src%2Finterface_adapters%2FUserSignOutController\.java$/);
		await expect(page.getByRole('button', { name: 'actions.backToDiagram' })).toBeVisible();
		await expect(page.getByLabel('Collapse sidebar')).toBeVisible();
		await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 15000 });

		await page.getByRole('button', { name: 'actions.backToDiagram' }).click();
		await expect(page).toHaveURL(interactionDiagramPath);
		await expect(page.getByLabel('Collapse sidebar')).toBeVisible();
	});
});