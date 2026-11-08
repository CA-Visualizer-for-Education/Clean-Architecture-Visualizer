import { describe, expect, it } from '@jest/globals';
import { UseCaseGraph } from '../../../src/entity/useCaseGraph.js';

describe('useCaseGraph edge types', () => {
  it('defaults to dependency when no type was set', () => {
    const graph = new UseCaseGraph('login');
    expect(graph.getEdgeType('controller', 'inputBoundary')).toBe('dependency');
  });

  it('does not downgrade implements to dependency', () => {
    const graph = new UseCaseGraph('login');
    graph.setEdgeType('presenter', 'outputBoundary', 'implements');
    graph.setEdgeType('presenter', 'outputBoundary', 'dependency');
    expect(graph.getEdgeType('presenter', 'outputBoundary')).toBe('implements');
  });

  it('upgrades dependency to implements', () => {
    const graph = new UseCaseGraph('login');
    graph.setEdgeType('presenter', 'outputBoundary', 'dependency');
    graph.setEdgeType('presenter', 'outputBoundary', 'implements');
    expect(graph.getEdgeType('presenter', 'outputBoundary')).toBe('implements');
  });
});
