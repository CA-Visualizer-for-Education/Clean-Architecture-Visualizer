import { CANode } from '../../../lib/types';

export function mapNodeToVisual(node: CANode) {
  const layerColorMap = {
    EnterpriseBusinessRules: 'entities',
    ApplicationBusinessRules: 'useCases',
    InterfaceAdapters: 'adapters',
    Frameworks: 'drivers',
  };

  const statusStyles = {
    VALID: {},
    MISSING: { borderStyle: 'dashed', opacity: 0.6 },
    VIOLATION: { borderColor: 'error.main', borderWidth: 2 },
  };

  return {
    title: node.name ?? node.id,
    layerColor: layerColorMap[node.layer],
    statusStyle: statusStyles[node.status],
  };
}