import { useQuery } from '@tanstack/react-query';
import { getFileTree, getFileContent, getComponentRelations } from '../api/codebase.api';

export const useFileTree = () => {
  return useQuery({
    queryKey: ['file-tree'],
    queryFn: getFileTree,
  });
};

export const useFileViewer = (interactionId: string, filePath: string | null) => {
  return useQuery({
    queryKey: ['file-content', interactionId, filePath],
    queryFn: () => getFileContent(interactionId, filePath!),
    enabled: !!interactionId && !!filePath, // Only fetch if both are provided
  });
};

export const useComponentRelations = (interactionId: string, componentId: string | null) => {
  return useQuery({
    queryKey: ['relations', interactionId, componentId],
    queryFn: () => getComponentRelations(interactionId, componentId!),
    enabled: !!interactionId && !!componentId,
  });
};