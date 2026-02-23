import { useQuery } from '@tanstack/react-query';
import { getAnalysisSummary, getInteractionDetails, getViolations } from '../api/analysis.api.ts';

export const useAnalysisSummary = () => {
  return useQuery({
    queryKey: ['analysis-summary'],
    queryFn: getAnalysisSummary,
  });
};

export const useInteraction = (interactionId: string) => {
  return useQuery({
    queryKey: ['interaction', interactionId],
    queryFn: () => getInteractionDetails(interactionId),
    enabled: !!interactionId, // Only fetch if an ID is selected
  });
};

export const useInteractionViolations = (interactionId: string) => {
  return useQuery({
    queryKey: ['interaction', interactionId],
    queryFn: () => getViolations(interactionId),
    enabled: !!interactionId,
  });
};
