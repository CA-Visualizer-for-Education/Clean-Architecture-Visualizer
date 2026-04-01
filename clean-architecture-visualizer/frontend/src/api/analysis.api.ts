import apiClient from './apiClient';

export const getAnalysisSummary = async () => {
  const { data } = await apiClient.get('/analysis/summary'); 
  return data;
};

export const getInteractionDetails = async (id: string) => {
  const { data } = await apiClient.get(`/analysis/interaction/${id}`);
  return data;
};

export const getViolations = async (interactionId: string) => {
 const { data } = await apiClient.get(`/analysis/violations/${interactionId}`);
  return data;
}