import {
  useCallback,
  useRef,
  useState,
} from 'react';

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
} from 'reactflow';

import { shallow } from 'zustand/shallow';

import { useStore } from './store';

import { InputNode } from './nodes/inputNode';
import { LLMNode } from './nodes/llmNode';
import { OutputNode } from './nodes/outputNode';
import { TextNode } from './nodes/textNode';
import { NoteNode } from './nodes/noteNode';
import { DelayNode } from './nodes/delayNode';
import { TransformNode } from './nodes/transformNode';
import { ConditionNode } from './nodes/conditionNode';
import { MergeNode } from './nodes/mergeNode';

import 'reactflow/dist/style.css';


/*
|--------------------------------------------------------------------------
| Node Types
|--------------------------------------------------------------------------
*/

const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  note: NoteNode,
  delay: DelayNode,
  transform: TransformNode,
  condition: ConditionNode,
  merge: MergeNode,
};


/*
|--------------------------------------------------------------------------
| Node Colors
|--------------------------------------------------------------------------
*/

const nodeColors = {
  customInput: '#6366f1',
  llm: '#7c3aed',
  customOutput: '#ec4899',
  text: '#f59e0b',
  note: '#eab308',
  delay: '#64748b',
  transform: '#06b6d4',
  condition: '#f97316',
  merge: '#8b5cf6',
};


/*
|--------------------------------------------------------------------------
| Zustand Selector
|--------------------------------------------------------------------------
*/

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,

  getNodeID:
    state.getNodeID,

  addNode:
    state.addNode,

  onNodesChange:
    state.onNodesChange,

  onEdgesChange:
    state.onEdgesChange,

  onConnect:
    state.onConnect,
});


/*
|--------------------------------------------------------------------------
| Pipeline UI
|--------------------------------------------------------------------------
*/

export const PipelineUI = () => {

  const wrapperRef =
    useRef(null);

  const [
    reactFlowInstance,
    setReactFlowInstance,
  ] = useState(null);


  /*
  |--------------------------------------------------------------------------
  | Zustand State
  |--------------------------------------------------------------------------
  */

  const {
    nodes,
    edges,
    getNodeID,
    addNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useStore(
    selector,
    shallow
  );


  /*
  |--------------------------------------------------------------------------
  | Initial Data For Nodes
  |--------------------------------------------------------------------------
  */

  const getInitialNodeData = (
    nodeID,
    type
  ) => {

    return {
      id: nodeID,
      nodeType: type,
    };

  };


  /*
  |--------------------------------------------------------------------------
  | DROP NODE ON CANVAS
  |--------------------------------------------------------------------------
  */

  const onDrop = useCallback(
    (event) => {

      event.preventDefault();


      /*
      |--------------------------------------------------------------------------
      | Make sure React Flow is ready
      |--------------------------------------------------------------------------
      */

      if (
        !wrapperRef.current ||
        !reactFlowInstance
      ) {
        return;
      }


      /*
      |--------------------------------------------------------------------------
      | Get dragged node data
      |--------------------------------------------------------------------------
      */

      const rawData =
        event.dataTransfer.getData(
          'application/reactflow'
        );


      if (!rawData) {
        return;
      }


      let appData;

      try {

        appData =
          JSON.parse(rawData);

      } catch (error) {

        console.error(
          'Invalid drag data:',
          error
        );

        return;
      }


      const type =
        appData?.nodeType;


      /*
      |--------------------------------------------------------------------------
      | Check node type
      |--------------------------------------------------------------------------
      */

      if (!nodeTypes[type]) {

        console.error(
          'Unknown node type:',
          type
        );

        return;
      }


      /*
      |--------------------------------------------------------------------------
      | IMPORTANT:
      |
      | React Flow v11 uses project()
      | instead of screenToFlowPosition()
      |--------------------------------------------------------------------------
      */

      const bounds =
        wrapperRef.current.getBoundingClientRect();


      const position =
        reactFlowInstance.project({
          x:
            event.clientX -
            bounds.left,

          y:
            event.clientY -
            bounds.top,
        });


      /*
      |--------------------------------------------------------------------------
      | Generate unique node ID
      |--------------------------------------------------------------------------
      */

      const nodeID =
        getNodeID(type);


      /*
      |--------------------------------------------------------------------------
      | Create node
      |--------------------------------------------------------------------------
      */

      const newNode = {

        id: nodeID,

        type,

        position,

        data:
          getInitialNodeData(
            nodeID,
            type
          ),

      };


      /*
      |--------------------------------------------------------------------------
      | Add node to Zustand store
      |--------------------------------------------------------------------------
      */

      addNode(newNode);

    },

    [
      reactFlowInstance,
      getNodeID,
      addNode,
    ]
  );


  /*
  |--------------------------------------------------------------------------
  | DRAG OVER
  |--------------------------------------------------------------------------
  */

  const onDragOver = useCallback(
    (event) => {

      event.preventDefault();

      event.dataTransfer.dropEffect =
        'move';

    },
    []
  );


  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (

    <div
      ref={wrapperRef}
      className="pipeline-container"
    >

      <ReactFlow

        nodes={nodes}

        edges={edges}

        nodeTypes={nodeTypes}

        onNodesChange={
          onNodesChange
        }

        onEdgesChange={
          onEdgesChange
        }

        onConnect={
          onConnect
        }

        onDrop={
          onDrop
        }

        onDragOver={
          onDragOver
        }

        onInit={
          setReactFlowInstance
        }

        snapToGrid

        snapGrid={[
          20,
          20,
        ]}

        connectionLineType="smoothstep"

        fitView

        fitViewOptions={{
          padding: 0.2,
        }}

        minZoom={0.25}

        maxZoom={1.7}

        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
        }}

      >

        <Background
          gap={20}
          size={1}
          color="#dfe3ec"
        />

        <Controls
          position="bottom-left"
        />

        <MiniMap
          position="bottom-right"
          pannable
          zoomable

          nodeColor={(node) =>
            nodeColors[
              node.type
            ] || '#94a3b8'
          }

        />

      </ReactFlow>


      {/* Empty canvas message */}

      {nodes.length === 0 && (

        <div className="empty-canvas">

          <div className="empty-icon">
            +
          </div>

          <h3>
            Start building your pipeline
          </h3>

          <p>
            Drag a node from the
            library onto this canvas.
          </p>

        </div>

      )}

    </div>

  );

};