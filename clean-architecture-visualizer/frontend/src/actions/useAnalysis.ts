import { useQuery } from '@tanstack/react-query';
import { getAnalysisSummary, getInteractionDetails, getViolations } from '../api/analysis.api.ts';
import type { AnalysisSummary, InteractionDetail, Violation } from '../lib/types.ts';

export const useAnalysisSummary = () => {
  return useQuery<AnalysisSummary, Error>({
    queryKey: ['analysis-summary'],
    queryFn: getAnalysisSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnMount: false, // Don't refetch when hook mounts on a new route
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
