import { useState, useEffect, useMemo } from 'react';
import { useFileTree } from '../../../actions/useCodebase';
import { TreeNode } from './TreeNode';
import { FileNode } from '../../../lib';

type FileExplorerProps = {
  onSelect: (path: string) => void;
  activeFilePath: string | null;
};

export const FileExplorer = ({ onSelect, activeFilePath }: FileExplorerProps) => {
  const { data: fileTree, isLoading } = useFileTree();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const pathsToExpand = useMemo(() => {
    if (!activeFilePath) return [];
    const parts = activeFilePath.split('/');
    const result: string[] = [];
    for (let i = 1; i < parts.length; i++) {
      result.push(parts.slice(0, i).join('/'));
    }
    return result;
  }, [activeFilePath]);

  useEffect(() => {
    if (pathsToExpand.length === 0) return;
    const id = setTimeout(() => {
      setExpandedFolders((prev) => {
        const newSet = new Set(prev);
        pathsToExpand.forEach((p) => newSet.add(p));
        return newSet;
      });
    }, 0);

    return () => clearTimeout(id);
  }, [pathsToExpand]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) newSet.delete(path);
      else newSet.add(path);
      return newSet;
    });
  };

  if (isLoading) return <div>Loading project structure...</div>;

  return (
    <div>
      {fileTree?.children.map((node: FileNode) => (
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