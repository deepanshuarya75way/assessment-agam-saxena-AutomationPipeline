import { useState } from 'react';

import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const MergeNode = ({
  id,
  data,
}) => {
  const updateNodeField = useStore(
    (state) => state.updateNodeField
  );

  const [strategy, setStrategy] =
    useState(
      data?.strategy ||
        'Concatenate'
    );

  const handleChange = (event) => {
    const value =
      event.target.value;

    setStrategy(value);

    updateNodeField(
      id,
      'strategy',
      value
    );
  };

  return (
    <BaseNode
      title="Merge"
      subtitle="Combine multiple inputs"
      icon="M"
      color="#8b5cf6"
      inputs={[
        {
          id: `${id}-input-1`,
          top: '42%',
        },
        {
          id: `${id}-input-2`,
          top: '72%',
        },
      ]}
      outputs={[
        {
          id: `${id}-output`,
        },
      ]}
    >
      <label className="field-label">
        Merge strategy

        <select
          className="field-control"
          value={strategy}
          onChange={handleChange}
        >
          <option>
            Concatenate
          </option>

          <option>
            First non-empty
          </option>

          <option>
            JSON merge
          </option>
        </select>
      </label>

      <div className="node-info">
        Accepts two inputs and
        produces one combined output.
      </div>
    </BaseNode>
  );
};