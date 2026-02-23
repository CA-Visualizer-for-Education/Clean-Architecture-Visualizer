import apiClient from './apiClient';

/**
 * Fetches CA definitions and layer info for Learning Mode.
 */
export const getLearningDefinitions = async () => {
  const { data } = await apiClient.get('/learning-mode/'); 
  return data;
};