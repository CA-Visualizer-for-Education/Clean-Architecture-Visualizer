import { useQuery } from '@tanstack/react-query';
import { getFileTree, getFileContent, getFileRelations } from '../api/codebase.api';

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

export const useFileRelations = (interactionId: string, filePath: string | null) => {
  return useQuery({
    queryKey: ['relations', interactionId, filePath],
    queryFn: () => getFileRelations(interactionId, filePath!),
    enabled: !!interactionId && !!filePath,
  });
};