import { useQuery } from '@tanstack/react-query';
import { getLearningDefinitions } from '../api/learning.api';

export const useLearningMode = () => {
  return useQuery({
    queryKey: ['learning-definitions'],
    queryFn: getLearningDefinitions,
  });
};