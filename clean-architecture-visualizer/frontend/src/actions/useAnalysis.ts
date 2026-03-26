import { useQuery } from '@tanstack/react-query';
import { getAnalysisSummary, getInteractionDetails, getViolations } from '../api/analysis.api.ts';
import type { AnalysisSummary, InteractionDetail, Violation } from '../lib/types.ts';

export const useAnalysisSummary = () => {
  return useQuery<AnalysisSummary, Error>({
    queryKey: ['analysis-summary'],
    queryFn: getAnalysisSummary,
  });
};

export const useInteraction = (interactionId: string) => {
  return useQuery<InteractionDetail, Error>({
    queryKey: ['interaction', interactionId],
    queryFn: () => getInteractionDetails(interactionId),
    enabled: !!interactionId,
  });
};

export const useInteractionViolations = (interactionId: string) => {
  return useQuery<Violation[], Error>({
    queryKey: ['violations', interactionId],
    queryFn: () => getViolations(interactionId),
    enabled: !!interactionId,
  });
};
