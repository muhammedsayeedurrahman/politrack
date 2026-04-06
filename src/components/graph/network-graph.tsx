'use client';

import { useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useGraphStore } from '@/stores/graph-store';
import { getRiskColor } from '@/lib/constants';
import { GraphNode, GraphEdge } from '@/types';
import cytoscape from 'cytoscape';

// Register fcose layout
// @ts-expect-error - cytoscape-fcose types not fully compatible
import fcose from 'cytoscape-fcose';
if (typeof cytoscape === 'function') {
  try { cytoscape.use(fcose); } catch (e) { /* already registered */ }
}

const CytoscapeComponent = dynamic(() => import('react-cytoscapejs'), { ssr: false });

const ENTITY_SHAPES: Record<string, string> = {
  person: 'ellipse',
  company: 'round-rectangle',
  official: 'diamond',
  contract: 'rectangle',
};

interface NetworkGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function NetworkGraph({ nodes, edges }: NetworkGraphProps) {
  const cyRef = useRef<cytoscape.Core | null>(null);
  const { layout, selectNode, selectEdge, selectedNodeId, searchQuery, entityTypeFilters, riskScoreRange } = useGraphStore();

  const filteredElements = useMemo(() => {
    const filteredNodes = nodes
      .filter(n => entityTypeFilters.includes(n.data.type))
      .filter(n => n.data.riskScore >= riskScoreRange[0] && n.data.riskScore <= riskScoreRange[1])
      .filter(n => !searchQuery || n.data.label.toLowerCase().includes(searchQuery.toLowerCase()));

    const nodeIds = new Set(filteredNodes.map(n => n.data.id));
    const filteredEdges = edges.filter(e => nodeIds.has(e.data.source) && nodeIds.has(e.data.target));

    return [
      ...filteredNodes.map(n => ({
        data: {
          ...n.data,
          color: getRiskColor(n.data.riskScore),
          shape: ENTITY_SHAPES[n.data.type] || 'ellipse',
          size: Math.max(30, Math.min(60, n.data.connectionCount * 5 + 20)),
        },
      })),
      ...filteredEdges.map(e => ({
        data: {
          ...e.data,
          lineStyle: e.data.isInferred ? 'dashed' : 'solid',
          width: Math.max(1, e.data.confidence * 4),
        },
      })),
    ];
  }, [nodes, edges, entityTypeFilters, riskScoreRange, searchQuery]);

  const stylesheet = useMemo<cytoscape.CytoscapeOptions['style']>(() => [
    {
      selector: 'node',
      style: {
        'background-color': 'data(color)',
        'label': 'data(label)',
        'width': 'data(size)',
        'height': 'data(size)',
        'font-size': '10px',
        'text-valign': 'bottom',
        'text-margin-y': 8,
        'color': '#666',
        'text-outline-width': 2,
        'text-outline-color': '#fff',
        'shape': 'data(shape)',
        'border-width': 2,
        'border-color': 'data(color)',
        'border-opacity': 0.8,
        'background-opacity': 0.7,
      } as any,
    },
    {
      selector: 'node:selected',
      style: {
        'border-width': 4,
        'border-color': '#3b82f6',
        'background-opacity': 1,
      } as any,
    },
    {
      selector: 'edge',
      style: {
        'width': 'data(width)',
        'line-color': '#94a3b8',
        'target-arrow-color': '#94a3b8',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'label': 'data(label)',
        'font-size': '8px',
        'text-rotation': 'autorotate',
        'color': '#94a3b8',
        'line-style': 'data(lineStyle)',
        'opacity': 0.6,
      } as any,
    },
    {
      selector: 'edge:selected',
      style: {
        'line-color': '#3b82f6',
        'target-arrow-color': '#3b82f6',
        'opacity': 1,
        'width': 3,
      } as any,
    },
  ], []);

  const layoutConfig = useMemo(() => {
    if (layout === 'fcose') {
      return { name: 'fcose', animate: true, animationDuration: 500, randomize: true, quality: 'proof' };
    }
    return { name: layout, animate: true, animationDuration: 500 };
  }, [layout]);

  const handleCyInit = useCallback((cy: cytoscape.Core) => {
    cyRef.current = cy;
    cy.on('tap', 'node', (evt) => {
      selectNode(evt.target.id());
    });
    cy.on('tap', 'edge', (evt) => {
      selectEdge(evt.target.id());
    });
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        selectNode(null);
        selectEdge(null);
      }
    });
  }, [selectNode, selectEdge]);

  // Highlight selected node
  useEffect(() => {
    if (!cyRef.current) return;
    cyRef.current.nodes().unselect();
    if (selectedNodeId) {
      cyRef.current.getElementById(selectedNodeId).select();
    }
  }, [selectedNodeId]);

  return (
    <div
      className="h-full w-full bg-muted/30 rounded-lg border"
      role="img"
      aria-label={`Network relationship graph displaying ${filteredElements.filter(e => !('source' in e.data)).length} entities and their connections. Click on nodes or edges to view details.`}
    >
      <span className="sr-only">
        Interactive network graph visualization. Use mouse to pan and zoom. Click on nodes to select entities.
      </span>
      {typeof window !== 'undefined' && (
        <CytoscapeComponent
          elements={filteredElements}
          stylesheet={stylesheet}
          layout={layoutConfig as any}
          cy={handleCyInit}
          style={{ width: '100%', height: '100%' }}
          className="rounded-lg"
        />
      )}
    </div>
  );
}
