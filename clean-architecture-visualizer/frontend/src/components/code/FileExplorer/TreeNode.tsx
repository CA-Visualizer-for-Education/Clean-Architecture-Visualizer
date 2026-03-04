import { styled } from '@mui/material/styles';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import { FileNode } from '../../../lib';

interface NodeContainerProps {
  isActive?: boolean;
  depth: number;
}

interface TreeNodeProps {
  node: FileNode;
  onSelect: (path: string) => void;
  activeFilePath: string | null;
  expandedFolders: Set<string>;
  toggleFolder: (path: string) => void;
  depth: number;
}


const NodeContainer = styled('div')<NodeContainerProps>(({ isActive, depth, theme }) => ({
  display: 'flex',
  alignItems: 'center',
  paddingTop: 4,
  paddingBottom: 4,
  paddingLeft: depth * 16,
  fontWeight: isActive ? 600 : 400,
  cursor: 'pointer',
  backgroundColor: isActive ? theme.palette.action.selected : 'transparent',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

export const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  onSelect,
  activeFilePath,
  expandedFolders,
  toggleFolder,
  depth,
}) => {
  const isDir = node.type === 'directory';
  const isExpanded = expandedFolders.has(node.path);
  const isActive = node.path === activeFilePath;

  return (
    <>
      <NodeContainer
        isActive={isActive}
        depth={depth}
        onClick={() => (isDir ? toggleFolder(node.path) : onSelect(node.path))}
      >
        <span style={{ width: 16 }}>{isDir ? (isExpanded ? '▾' : '▸') : ''}</span>
        <span style={{ marginLeft: 4 }}>
          {isDir ? <FolderIcon fontSize="small" /> : <DescriptionIcon fontSize="small" />} {node.name}
        </span>
      </NodeContainer>

      {isDir &&
        isExpanded &&
        node.children?.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            onSelect={onSelect}
            activeFilePath={activeFilePath}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
            depth={depth + 1}
          />
        ))}
    </>
  );
};