import { test, expect } from '@playwright/test';

test.describe('Code Viewer E2E', () => {

  test('should expand folders, open a file, and render in Monaco', async ({ page }) => {
    // 1. Navigate to the Code View
    await page.goto('/use-case/1/interaction/1/code');

    // 2. Expand 'interface_adapter' layer
    const adapterFolder = page.getByText('interface_adapter', { exact: true });
    await expect(adapterFolder).toBeVisible({ timeout: 15000 });
    await adapterFolder.click();

    // 3. Expand 'signup' subfolder
    const signUpFolder = page.getByText('signup', { exact: true });
    await expect(signUpFolder).toBeVisible();
    await signUpFolder.click();

    // 4. Verify the file exists and the placeholder is still visible
    const fileNode = page.getByText('SignupController.java', { exact: true });
    await expect(fileNode).toBeVisible();
    await expect(page.getByText('selectFile')).toBeVisible();

    // 5. CLICK the file to open it
    await fileNode.click();

    // 6. Verify Monaco Editor replaces the placeholder
    // 'selectFile' should now be gone
    await expect(page.getByText('selectFile')).not.toBeVisible();

    // Monaco creates a container with the class 'monaco-editor'
    const monacoEditor = page.locator('.monaco-editor');
    await expect(monacoEditor).toBeVisible();

    // 7. Verify the editor contains code
    // check for a common Java keyword that should be in the file
    await expect(monacoEditor).toContainText('public class');
    
    // 8. Verify breadcrumbs update
    await expect(page.getByText('SignupController.java')).toHaveCount(2);
  });

  test('should navigate back using the diagram button', async ({ page }) => {
    await page.goto('/use-case/1/interaction/1/code');
    await page.getByText('actions.backToDiagram').click();
    await expect(page).toHaveURL(/\/diagram/);
  });
});