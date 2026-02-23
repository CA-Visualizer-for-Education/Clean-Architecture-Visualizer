import apiClient from './apiClient';

/**
 * Fetches the full project directory structure.
 */
export const getFileTree = async () => {
  const { data } = await apiClient.get('/codebase/file-tree');
  return data;
};

/**
 * Fetches specific file content and violation highlights.
 * @param interactionId - The active interaction flow
 * @param path - The specific file path (e.g., src/entities/User.java)
 */
export const getFileContent = async (interactionId: string, path: string) => {
  const { data } = await apiClient.get(`/codebase/interactions/${interactionId}/files/${path}`); 
  return data;
};

/**
 * Fetches cross-file relations for a specific component.
 */
export const getComponentRelations = async (interactionId: string, componentId: string) => {
  const { data } = await apiClient.get(`/codebase/interactions/${interactionId}/relations/${componentId}`); 
  return data;
};