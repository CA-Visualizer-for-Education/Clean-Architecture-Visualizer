import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateProject, createUseCase } from '../api/template.api.ts';

export const useGenerateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateProject,
    onSuccess: () => {
      // invalidate data here
      queryClient.invalidateQueries({ queryKey: ['file-tree'] });
    },
  });
};

export const useCreateUseCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (useCaseName: string) => createUseCase(useCaseName),
    onSuccess: () => {
      // Refresh codebase view after adding new files
      queryClient.invalidateQueries({ queryKey: ['file-tree'] });
      queryClient.invalidateQueries({ queryKey: ['relations'] });
      queryClient.invalidateQueries({ queryKey: ['analysis_summary'] });
      queryClient.invalidateQueries({ queryKey: ['violations'] });
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
    },
  });
};