import { useState } from 'react';

import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const TransformNode = ({
  id,
  data,
}) => {
  const updateNodeField = useStore(
    (state) => state.updateNodeField
  );

  const [operation, setOperation] =
    useState(
      data?.operation ||
        'Uppercase'
    );

  const handleChange = (event) => {
    const value =
      event.target.value;

    setOperation(value);

    updateNodeField(
      id,
      'operation',
      value
    );
  };

  return (
    <BaseNode
      title="Transform"
      subtitle="Modify incoming data"
      icon="T"
      color="#06b6d4"
      inputs={[
        {
          id: `${id}-input`,
        },
      ]}
      outputs={[
        {
          id: `${id}-output`,
        },
      ]}
    >
      <label className="field-label">
        Operation

        <select
          className="field-control"
          value={operation}
          onChange={handleChange}
        >
          <option>
            Uppercase
          </option>

          <option>
            Lowercase
          </option>

          <option>
            Trim whitespace
          </option>

          <option>
            Reverse
          </option>
        </select>
      </label>
    </BaseNode>
  );
};