import { DraggableNode } from './draggableNode';

const nodes = [
  ['customInput', 'Input'],
  ['llm', 'LLM'],
  ['customOutput', 'Output'],
  ['text', 'Text'],
  ['note', 'Note'],
  ['delay', 'Delay'],
  ['transform', 'Transform'],
  ['condition', 'Condition'],
  ['merge', 'Merge'],
];

export const PipelineToolbar = () => {
  return (
    <aside className="pipeline-toolbar">
      <div className="toolbar-heading">
        <div>
          <div className="eyebrow">
            NODE LIBRARY
          </div>

          <h2>
            Build your pipeline
          </h2>
        </div>

        <span className="node-count">
          {nodes.length}
        </span>
      </div>

      <p className="toolbar-description">
        Drag nodes onto the canvas,
        configure them, and connect
        their handles to build a
        workflow.
      </p>

      <div className="node-palette">
        {nodes.map(
          ([type, label]) => (
            <DraggableNode
              key={type}
              type={type}
              label={label}
            />
          )
        )}
      </div>

      <div className="toolbar-tip">
        <strong>
          Tip
        </strong>

        <p>
          Connect nodes from an
          output handle to an input
          handle.
        </p>
      </div>
    </aside>
  );
};