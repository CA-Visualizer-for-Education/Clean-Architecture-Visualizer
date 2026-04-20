import { test, expect } from '@playwright/test';

test.describe('Learning Mode E2E', () => {
  test('renders learning diagram and starts with sidebar closed', async ({ page }) => {
    await page.goto('/learning');

    await expect(page).toHaveURL(/\/learning$/);

    await expect(page.getByText('Interface Adapters')).toBeVisible();
    await expect(page.getByText('Application Business Rules')).toBeVisible();
    await expect(page.getByText('Enterprise Business Rules')).toBeVisible();
    await expect(page.getByText('Frameworks and Drivers')).toBeVisible();

    await expect(page.locator('[data-ca-node-id="controller-learning"]')).toBeVisible();
    await expect(page.locator('[data-ca-node-id="interactor-learning"]')).toBeVisible();
    await expect(page.locator('[data-ca-node-id="database-learning"]')).toBeVisible();

    await expect(page.getByLabel('Expand sidebar')).toBeVisible();
    await expect(page.getByLabel('Collapse sidebar')).toHaveCount(0);
  });

  test('opens sidebar when clicking a node and keeps selected content when toggling sidebar', async ({ page }) => {
    await page.goto('/learning');

    const controllerNode = page.locator('[data-ca-node-id="controller-learning"]');
    const sidebar = page.locator('aside');
    await expect(controllerNode).toBeVisible();
    await controllerNode.click();

    await expect(page.getByLabel('Collapse sidebar')).toBeVisible();
    await expect(sidebar.getByRole('heading', { name: 'components.controller.name' })).toBeVisible();
    await expect(sidebar.getByText('components.controller.description')).toBeVisible();

    await page.getByLabel('Collapse sidebar').click();
    await expect(page.getByLabel('Expand sidebar')).toBeVisible();

    await page.getByLabel('Expand sidebar').click();
    await expect(page.getByLabel('Collapse sidebar')).toBeVisible();
    await expect(sidebar.getByRole('heading', { name: 'components.controller.name' })).toBeVisible();
  });

  test('switches sidebar content when different nodes are clicked', async ({ page }) => {
    await page.goto('/learning');

    const sidebar = page.locator('aside');
    const cases = [
      { nodeId: 'controller-learning', nameKey: 'components.controller.name', descriptionKey: 'components.controller.description' },
      { nodeId: 'presenter-learning', nameKey: 'components.presenter.name', descriptionKey: 'components.presenter.description' },
      { nodeId: 'interactor-learning', nameKey: 'components.interactor.name', descriptionKey: 'components.interactor.description' },
      { nodeId: 'database-learning', nameKey: 'components.database.name', descriptionKey: 'components.database.description' },
    ];

    for (const testCase of cases) {
      const node = page.locator(`[data-ca-node-id="${testCase.nodeId}"]`);
      await expect(node).toBeVisible();
      await node.click();

      await expect(page.getByLabel('Collapse sidebar')).toBeVisible();
      await expect(sidebar.getByRole('heading', { name: testCase.nameKey })).toBeVisible();
      await expect(sidebar.getByText(testCase.descriptionKey)).toBeVisible();
    }
  });

});
