import apiClient from './apiClient';

/**
 * Initiates the base folder structure for a Clean Architecture project.
 */
export const generateProject = async () => {
  const { data } = await apiClient.post<{ message: string }>(
    '/template/generate'
  );
  return data;
};

/**
 * Initiates the base folder structure for a Clean Architecture project packaged by module.
 */
export const generateModuleProject = async () => {
  const { data } = await apiClient.post<{ message: string }>(
    '/template/module_generate'
  );
  return data;
};

/**
 * Creates a new use case and its corresponding interface adapters.
 * @param useCaseName The name of the use case (e.g., "Add User")
 */
export const createUseCase = async (useCaseName: string) => {
  const { data } = await apiClient.post<{ message: string }>(
    `/template/add/${encodeURIComponent(useCaseName)}`
  );
  return data;
};

/**
 * Creates a new feature in the CA directory.
 * @param featureName The name of the feature.
 */
export const createFeature = async (featureName: string) => {
  const { data } = await apiClient.post<{ message: string }>(
    `/template/module_add/${encodeURIComponent(featureName)}`
  );
  return data;
};

/**
 * Creates a new use case in the specified CA directory.
 * @param featureName The name of the feature.
 */
export const createModuleUseCase = async (
  featureName: string,
  useCaseName: string
) => {
  const { data } = await apiClient.post<{ message: string }>(
    `/template/module_add/${encodeURIComponent(featureName)}/${encodeURIComponent(useCaseName)}`
  );
  return data;
};
