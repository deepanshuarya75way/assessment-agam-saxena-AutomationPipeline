import { create } from 'zustand';

import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from 'reactflow';

/*
 * Maximum number of undo steps kept in memory.
 */
const HISTORY_LIMIT = 100;

/*
 * Consecutive edits to the same field within
 * this window are merged into one undo step
 * (so typing a word is one step, not one per key).
 */
const EDIT_MERGE_MS = 800;

/*
 * Node + edge removals triggered by one delete
 * action arrive as two separate change events.
 * Treat them as a single undo step.
 */
const REMOVE_MERGE_MS = 60;

/*
 * Snapshot captured when a drag begins. It is only
 * pushed to history if something actually moved
 * (React Flow 11 fires "drag start" on mouse-down,
 * so a plain click would otherwise create an empty
 * undo step).
 */
let dragSnapshot = null;

let lastEditKey = null;
let lastEditTime = 0;
let lastRemoveTime = 0;

/*
 * Keep only what matters for history. Transient UI
 * flags (selection, dragging, measured size) are
 * stripped so undo never fights with React Flow.
 */
const cleanNode = (node) => {
  const {
    selected,
    dragging,
    positionAbsolute,
    width,
    height,
    ...rest
  } = node;

  return {
    ...rest,
    position: { ...node.position },
    data: { ...node.data },
  };
};

const cleanEdge = (edge) => {
  const { selected, ...rest } = edge;

  return { ...rest };
};

const makeSnapshot = (state) => ({
  nodes: state.nodes.map(cleanNode),
  edges: state.edges.map(cleanEdge),
});

const pushHistory = (state) => ({
  past: [
    ...state.past,
    makeSnapshot(state),
  ].slice(-HISTORY_LIMIT),

  future: [],
});

export const useStore = create(
  (set, get) => ({
    nodes: [],
    edges: [],
    nodeIDs: {},

    /*
     * Undo / redo stacks.
     */
    past: [],
    future: [],

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
     * Manually record the current state as an
     * undo step (used before a drag starts).
     */
    takeSnapshot: () => {
      lastEditKey = null;

      set((state) => pushHistory(state));
    },

    /*
     * Drag support: remember the state at drag start
     * and commit it only if a node really moved.
     */
    beginDrag: () => {
      dragSnapshot = makeSnapshot(get());
    },

    endDrag: () => {
      const start = dragSnapshot;

      dragSnapshot = null;

      if (!start) {
        return;
      }

      const moved = get().nodes.some(
        (node) => {
          const before = start.nodes.find(
            (n) => n.id === node.id
          );

          return (
            before &&
            (before.position.x !==
              node.position.x ||
              before.position.y !==
                node.position.y)
          );
        }
      );

      if (!moved) {
        return;
      }

      lastEditKey = null;

      set((state) => ({
        past: [
          ...state.past,
          start,
        ].slice(-HISTORY_LIMIT),

        future: [],
      }));
    },

    /*
     * Undo.
     */
    undo: () => {
      const { past, future } = get();

      if (past.length === 0) {
        return;
      }

      lastEditKey = null;

      const previous =
        past[past.length - 1];

      set((state) => ({
        past: past.slice(0, -1),

        future: [
          makeSnapshot(state),
          ...future,
        ],

        nodes: previous.nodes,
        edges: previous.edges,
      }));
    },

    /*
     * Redo.
     */
    redo: () => {
      const { past, future } = get();

      if (future.length === 0) {
        return;
      }

      lastEditKey = null;

      const next = future[0];

      set((state) => ({
        past: [
          ...past,
          makeSnapshot(state),
        ].slice(-HISTORY_LIMIT),

        future: future.slice(1),

        nodes: next.nodes,
        edges: next.edges,
      }));
    },

    /*
     * Add node.
     */
    addNode: (node) => {
      lastEditKey = null;

      set((state) => ({
        ...pushHistory(state),

        nodes: [
          ...state.nodes,
          node,
        ],
      }));
    },

    /*
     * Replace complete pipeline
     * (used when loading a saved pipeline).
     * Loading is not an undoable action, so
     * history is reset.
     */
    setPipeline: (
      nodes,
      edges
    ) => {
      lastEditKey = null;

      /*
       * Rebuild ID counters so new nodes never
       * collide with loaded ones.
       */
      const nodeIDs = {};

      nodes.forEach((node) => {
        const match =
          /^(.*)-(\d+)$/.exec(node.id);

        if (match) {
          const [, type, num] = match;

          nodeIDs[type] = Math.max(
            nodeIDs[type] || 0,
            Number(num)
          );
        }
      });

      set({
        nodes,
        edges,
        nodeIDs,
        past: [],
        future: [],
      });
    },

    /*
     * Clear everything (undoable).
     * ID counters are kept so that undoing a
     * clear and adding nodes never collides.
     */
    clearPipeline: () => {
      lastEditKey = null;

      set((state) => ({
        ...pushHistory(state),

        nodes: [],
        edges: [],
      }));
    },

    /*
     * React Flow node changes.
     */
    onNodesChange: (changes) => {
      const hasRemove = changes.some(
        (change) =>
          change.type === 'remove'
      );

      if (hasRemove) {
        const now = Date.now();

        if (
          now - lastRemoveTime >
          REMOVE_MERGE_MS
        ) {
          get().takeSnapshot();
        }

        lastRemoveTime = now;
      }

      set((state) => ({
        nodes: applyNodeChanges(
          changes,
          state.nodes
        ),
      }));
    },

    /*
     * React Flow edge changes.
     */
    onEdgesChange: (changes) => {
      const hasRemove = changes.some(
        (change) =>
          change.type === 'remove'
      );

      if (hasRemove) {
        const now = Date.now();

        if (
          now - lastRemoveTime >
          REMOVE_MERGE_MS
        ) {
          get().takeSnapshot();
        }

        lastRemoveTime = now;
      }

      set((state) => ({
        edges: applyEdgeChanges(
          changes,
          state.edges
        ),
      }));
    },

    /*
     * Create connection.
     */
    onConnect: (connection) => {
      lastEditKey = null;

      set((state) => ({
        ...pushHistory(state),

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
      }));
    },

    /*
     * Update node data.
     */
    updateNodeField: (
      nodeId,
      fieldName,
      fieldValue
    ) => {
      const key = `${nodeId}:${fieldName}`;
      const now = Date.now();

      const shouldRecord =
        key !== lastEditKey ||
        now - lastEditTime >
          EDIT_MERGE_MS;

      lastEditKey = key;
      lastEditTime = now;

      set((state) => ({
        ...(shouldRecord
          ? pushHistory(state)
          : {}),

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
      }));
    },
  })
);
