import {
  useEffect,
  useMemo,
} from 'react';

import {
  Handle,
  Position,
  useUpdateNodeInternals,
} from 'reactflow';

import { BaseNode } from './BaseNode';
import { useStore } from '../store';

const VARIABLE_PATTERN =
  /\{\{\s*([A-Za-z_$][\w$]*)\s*\}\}/g;

export const TextNode = ({ id, data }) => {
  const updateNodeField = useStore(
    (state) => state.updateNodeField
  );

  const updateNodeInternals =
    useUpdateNodeInternals();

  // Value lives in the store so undo / redo can restore it.
  const text = data?.text ?? 'Hello {{name}}';

  /*
   * Extract variables from text.
   */
  const variables = useMemo(() => {
    const result = [];
    const seen = new Set();

    const regex =
      new RegExp(
        VARIABLE_PATTERN.source,
        'g'
      );

    let match;

    while (
      (match = regex.exec(text)) !== null
    ) {
      const variable = match[1];

      if (!seen.has(variable)) {
        seen.add(variable);
        result.push(variable);
      }
    }

    return result;
  }, [text]);

  /*
   * Tell React Flow that the number of
   * handles has changed.
   */
  useEffect(() => {
    updateNodeInternals(id);
  }, [
    id,
    variables,
    updateNodeInternals,
  ]);

  const handleChange = (event) => {
    const value =
      event.target.value;

    updateNodeField(
      id,
      'text',
      value
    );
  };

  /*
   * Dynamic height.
   */
  const lineCount = Math.max(
    4,
    Math.min(
      12,
      text.split('\n').length +
        Math.ceil(
          text.length / 55
        )
    )
  );

  /*
   * Dynamic width.
   */
  const dynamicWidth = Math.min(
    440,
    Math.max(
      270,
      270 +
        Math.min(
          170,
          text.length * 0.8
        )
    )
  );

  return (
    <div
      style={{
        position: 'relative',
        width: dynamicWidth,
      }}
    >
      <BaseNode
        title="Text"
        subtitle="Dynamic template"
        icon="TXT"
        color="#f59e0b"
        width={dynamicWidth}
        inputs={[]}
        outputs={[
          {
            id: `${id}-output`,
          },
        ]}
      >
        <label className="field-label">
          Template

          <textarea
            className="field-control text-area"
            value={text}
            onChange={handleChange}
            rows={lineCount}
            placeholder="Hello {{name}}"
          />
        </label>

        <div className="variable-hint">
          <strong>
            {variables.length}
          </strong>{' '}
          variable
          {variables.length !== 1
            ? 's'
            : ''}

          {variables.length > 0 && (
            <div className="variable-list">
              {variables.map(
                (variable) => (
                  <span
                    key={variable}
                    className="variable-chip"
                  >
                    {variable}
                  </span>
                )
              )}
            </div>
          )}
        </div>
      </BaseNode>

      {variables.map(
        (variable, index) => (
          <Handle
            key={variable}
            type="target"
            position={Position.Left}
            id={`${id}-var-${variable}`}
            title={variable}
            style={{
              width: 11,
              height: 11,
              left: -7,
              top: `${
                55 +
                index * 28
              }px`,
              background:
                '#f59e0b',
              border:
                '2px solid white',
              boxShadow:
                '0 0 0 1px #f59e0b55',
            }}
          />
        )
      )}
    </div>
  );
};