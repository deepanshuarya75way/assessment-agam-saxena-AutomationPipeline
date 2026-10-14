import { create } from 'zustand';

import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from 'reactflow';

export const useStore = create(
  (set, get) => ({
    nodes: [],
    edges: [],
    nodeIDs: {},

    /*
     * Generate unique IDs.
     */
    getNodeID: (type) => {
      const currentIDs = {
        ...get().nodeIDs,
      };

      currentIDs[type] =
        (currentIDs[type] || 0) + 1;

      set({
        nodeIDs: currentIDs,
      });

      return `${type}-${currentIDs[type]}`;
    },

    /*
     * Add node.
     */
    addNode: (node) =>
      set((state) => ({
        nodes: [
          ...state.nodes,
          node,
        ],
      })),

    /*
     * Replace complete pipeline.
     */
    setPipeline: (
      nodes,
      edges
    ) =>
      set({
        nodes,
        edges,
      }),

    /*
     * Clear everything.
     */
    clearPipeline: () =>
      set({
        nodes: [],
        edges: [],
        nodeIDs: {},
      }),

    /*
     * React Flow node changes.
     */
    onNodesChange: (changes) =>
      set((state) => ({
        nodes: applyNodeChanges(
          changes,
          state.nodes
        ),
      })),

    /*
     * React Flow edge changes.
     */
    onEdgesChange: (changes) =>
      set((state) => ({
        edges: applyEdgeChanges(
          changes,
          state.edges
        ),
      })),

    /*
     * Create connection.
     */
    onConnect: (connection) =>
      set((state) => ({
        edges: addEdge(
          {
            ...connection,

            type: 'smoothstep',

            animated: true,

            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 18,
              height: 18,
            },
          },
          state.edges
        ),
      })),

    /*
     * Update node data.
     */
    updateNodeField: (
      nodeId,
      fieldName,
      fieldValue
    ) =>
      set((state) => ({
        nodes: state.nodes.map(
          (node) =>
            node.id === nodeId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    [fieldName]:
                      fieldValue,
                  },
                }
              : node
        ),
      })),
  })
);