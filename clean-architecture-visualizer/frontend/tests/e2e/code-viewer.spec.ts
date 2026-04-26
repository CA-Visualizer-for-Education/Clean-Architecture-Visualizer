import { test, expect, type Page } from '@playwright/test';

test.describe('Code Viewer E2E', () => {
  test.describe.configure({ mode: 'serial' });
  test.skip(({ browserName }) => browserName === 'firefox', 'Firefox is flaky in local dev server (NS_ERROR_NET_RESET).');

  const codeRoute = '/use-case/1/interaction/1/code';

  const loadingText = /^(loading|Loading\.\.\.)$/;
  const errorLoadingText = /(errorLoading|Error loading file:)/;

  const waitForCodeViewerToSettle = async (page: Page) => {
    const main = page.getByRole('main');
    await expect(main.getByText(loadingText)).not.toBeVisible({ timeout: 20000 });
  };

  test('should expand folders, open a file, and render in Monaco', async ({ page }) => {
    // Navigate to the Code View
    await page.goto(codeRoute, { waitUntil: 'domcontentloaded' });

    // Expand 'interface_adapter' layer
    const adapterFolder = page.getByText('interface_adapters', { exact: true });
    await expect(adapterFolder).toBeVisible({ timeout: 15000 });
    await adapterFolder.click();

    // Verify the file exists and the placeholder is still visible
    const fileNode = page.getByText('UserSignOutController.java', { exact: true });
    await expect(fileNode).toBeVisible();
    await expect(page.getByText('selectFile')).toBeVisible();

    // CLICK the file to open it
    await fileNode.click();
    await waitForCodeViewerToSettle(page);

    // Verify file viewer replaces the placeholder
    await expect(page.getByText('selectFile')).not.toBeVisible();
    
    // Verify breadcrumbs update
    await expect(page.getByText('UserSignOutController.java')).toHaveCount(2);
  });

  test('should navigate back using the diagram button', async ({ page }) => {
    await page.goto(codeRoute, { waitUntil: 'domcontentloaded' });
    await page.getByText('actions.backToDiagram').click();
    await expect(page).toHaveURL(/\/diagram/);
  });

  test('should deep-link to a file from URL query and load Monaco immediately', async ({ page }) => {
    await page.goto(`${codeRoute}?file=src%2Finterface_adapters%2FUserSignOutController.java`, { waitUntil: 'domcontentloaded' });
    await waitForCodeViewerToSettle(page);

    await expect(page.getByText('UserSignOutController.java')).toHaveCount(2);
    await expect(page).toHaveURL(/file=src%2Finterface_adapters%2FUserSignOutController.java/);
  });

  test('should update URL query when selecting files and when going back to previous file', async ({ page }) => {
    await page.goto(codeRoute, { waitUntil: 'domcontentloaded' });

    const adapterFolder = page.getByText('interface_adapters', { exact: true });
    await expect(adapterFolder).toBeVisible({ timeout: 15000 });
    await adapterFolder.click();

    const controllerFile = page.getByText('UserSignOutController.java', { exact: true });
    const presenterFile = page.getByText('UserSignOutPresenter.java', { exact: true });
    const backToPreviousButton = page.getByText('actions.backToPrevious');

    await controllerFile.click();
    await expect(page).toHaveURL(/file=src%2Finterface_adapters%2FUserSignOutController.java/);

    await presenterFile.click();
    await expect(page).toHaveURL(/file=src%2Finterface_adapters%2FUserSignOutPresenter.java/);

    await backToPreviousButton.click();
    await expect(page).toHaveURL(/file=src%2Finterface_adapters%2FUserSignOutController.java/);
  });

  test('should keep Back to Previous disabled at history boundary', async ({ page }) => {
    await page.goto(codeRoute, { waitUntil: 'domcontentloaded' });

    const adapterFolder = page.getByText('interface_adapters', { exact: true });
    await expect(adapterFolder).toBeVisible({ timeout: 15000 });
    await adapterFolder.click();

    const controllerFile = page.getByText('UserSignOutController.java', { exact: true });
    const presenterFile = page.getByText('UserSignOutPresenter.java', { exact: true });
    const backToPreviousButton = page.getByText('actions.backToPrevious');

    await expect(backToPreviousButton).toBeDisabled();

    await controllerFile.click();
    await expect(backToPreviousButton).toBeDisabled();

    await presenterFile.click();
    await expect(backToPreviousButton).toBeEnabled();

    await backToPreviousButton.click();
    await waitForCodeViewerToSettle(page);
    await expect(page.getByText('UserSignOutController.java')).toHaveCount(2);
    await expect(backToPreviousButton).toBeDisabled();
  });

  test('should show error state for an invalid file path from URL query', async ({ page }) => {
    await page.goto(`${codeRoute}?file=src%2Fnonexistent%2FFoo.java`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByText(errorLoadingText)).toBeVisible({ timeout: 20000 });
  });

  test('should navigate back to previous files after opening multiple files', async ({ page }) => {
    await page.goto(codeRoute, { waitUntil: 'domcontentloaded' });

    const adapterFolder = page.getByText('interface_adapters', { exact: true });
    await expect(adapterFolder).toBeVisible({ timeout: 15000 });
    await adapterFolder.click();

    const controllerFile = page.getByText('UserSignOutController.java', { exact: true });
    const presenterFile = page.getByText('UserSignOutPresenter.java', { exact: true });
    const viewModelFile = page.getByText('UserSignOutViewModel.java', { exact: true });
    const backToPreviousButton = page.getByText('actions.backToPrevious');

    await expect(backToPreviousButton).toBeDisabled();

    await controllerFile.click();
    await waitForCodeViewerToSettle(page);
    await expect(page).toHaveURL(/file=src%2Finterface_adapters%2FUserSignOutController.java/);

    await presenterFile.click();
    await waitForCodeViewerToSettle(page);
    await expect(page).toHaveURL(/file=src%2Finterface_adapters%2FUserSignOutPresenter.java/);
    await expect(backToPreviousButton).toBeEnabled();

    await viewModelFile.click();
    await waitForCodeViewerToSettle(page);
    await expect(page).toHaveURL(/file=src%2Finterface_adapters%2FUserSignOutViewModel.java/);

    await backToPreviousButton.click();
    await waitForCodeViewerToSettle(page);
    await expect(page).toHaveURL(/file=src%2Finterface_adapters%2FUserSignOutPresenter.java/);

    await backToPreviousButton.click();
    await waitForCodeViewerToSettle(page);
    await expect(page).toHaveURL(/file=src%2Finterface_adapters%2FUserSignOutController.java/);
    await expect(backToPreviousButton).toBeDisabled();
  });
});