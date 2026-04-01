import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FileNode } from '../../../lib';
import { 
  NodeContainer, 
  ExpandIconWrapper, 
  NodeLabel, 
  NodeText,
  StyledFolderIcon,
  StyledFolderOpenIcon,
  StyledFileIcon 
} from './styles';

interface TreeNodeProps {
  node: FileNode;
  onSelect: (path: string) => void;
  activeFilePath: string | null;
  expandedFolders: Set<string>;
  toggleFolder: (path: string) => void;
  depth: number;
}

export const TreeNode = ({
  node,
  onSelect,
  activeFilePath,
  expandedFolders,
  toggleFolder,
  depth,
}: TreeNodeProps) => {
  const isDir = node.type === 'directory';
  const isExpanded = expandedFolders.has(node.path);
  const isActive = node.path === activeFilePath;

  const handleToggle = () => {
    if (isDir) toggleFolder(node.path);
    else onSelect(node.path);
  };

  return (
    <>
      <NodeContainer isActive={isActive} depth={depth} onClick={handleToggle}>
        <ExpandIconWrapper>
          {isDir && (isExpanded ? <ExpandMoreIcon sx={{ fontSize: 18 }} /> : <ChevronRightIcon sx={{ fontSize: 18 }} />)}
        </ExpandIconWrapper>
        
        <NodeLabel>
          {isDir ? (
            isExpanded ? <StyledFolderOpenIcon color="primary" /> : <StyledFolderIcon color="action" />
          ) : (
            <StyledFileIcon color={isActive ? "primary" : "action"} />
          )} 
          
          <NodeText variant="body2" isActive={isActive}>
            {node.name}
          </NodeText>
        </NodeLabel>
      </NodeContainer>

      {isDir && isExpanded && node.children?.map((child) => (
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