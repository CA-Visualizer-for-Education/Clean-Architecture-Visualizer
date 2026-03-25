import { useState } from 'react';
import { useFileTree } from '../../../actions/useCodebase';
import { TreeNode } from './TreeNode';
import { FileNode } from '../../../lib';

type FileExplorerProps = {
  onSelect: (path: string) => void;
  activeFilePath: string | null;
};

const normalizeFolderPath = (path: string): string => 
  path && !path.endsWith('/') ? `${path}/` : path;

export const FileExplorer = ({ onSelect, activeFilePath }: FileExplorerProps) => {
  const { data: fileTree, isLoading, isFetching } = useFileTree();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  
  const [lastAutoExpandedPath, setLastAutoExpandedPath] = useState<string | null>(null);

  if (activeFilePath && activeFilePath !== lastAutoExpandedPath) {
    const parts = activeFilePath.split('/');
    const newPaths = new Set(expandedFolders);
    let changed = false;

    for (let i = 1; i < parts.length; i++) {
      const folderPath = normalizeFolderPath(parts.slice(0, i).join('/'));
      if (!newPaths.has(folderPath)) {
        newPaths.add(folderPath);
        changed = true;
      }
    }

    if (changed) {
      setExpandedFolders(newPaths);
    }

    setLastAutoExpandedPath(activeFilePath);
  }

  const toggleFolder = (path: string) => {
    const normalized = normalizeFolderPath(path);
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(normalized)) {
        newSet.delete(normalized);
      } else {
        newSet.add(normalized);
      }
      return newSet;
    });
  };

  if (isLoading && !fileTree) return <div>Loading project structure...</div>;

  return (
    <div style={{ opacity: isFetching ? 0.7 : 1, transition: 'opacity 0.2s' }}>
      {fileTree?.children?.map((node: FileNode) => (
        <TreeNode
          key={node.id}
          node={node}
          onSelect={onSelect}
          activeFilePath={activeFilePath}
          expandedFolders={expandedFolders}
          toggleFolder={toggleFolder}
          depth={0}
        />
      ))}
    </div>
  );
};