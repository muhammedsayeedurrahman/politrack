declare module 'react-cytoscapejs' {
  import type { Core, CytoscapeOptions } from 'cytoscape';
  import type { ComponentType } from 'react';

  interface CytoscapeComponentProps {
    elements: CytoscapeOptions['elements'];
    stylesheet?: CytoscapeOptions['style'];
    layout?: CytoscapeOptions['layout'];
    cy?: (cy: Core) => void;
    style?: React.CSSProperties;
    className?: string;
    zoom?: number;
    pan?: { x: number; y: number };
    minZoom?: number;
    maxZoom?: number;
    zoomingEnabled?: boolean;
    userZoomingEnabled?: boolean;
    panningEnabled?: boolean;
    userPanningEnabled?: boolean;
    boxSelectionEnabled?: boolean;
    autoungrabify?: boolean;
    autounselectify?: boolean;
  }

  const CytoscapeComponent: ComponentType<CytoscapeComponentProps>;
  export default CytoscapeComponent;
}
