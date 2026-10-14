import { useState } from 'react';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const InputNode = ({ id, data }) => {
  const updateNodeField = useStore(
    (state) => state.updateNodeField
  );

  const [name, setName] = useState(
    data?.name || 'input'
  );

  const [inputType, setInputType] = useState(
    data?.inputType || 'Text'
  );

  const update = (field, setter) => (event) => {
    const value = event.target.value;

    setter(value);

    updateNodeField(
      id,
      field,
      value
    );
  };

  return (
    <BaseNode
      title="Input"
      subtitle="Pipeline entry point"
      icon="IN"
      color="#6366f1"
      outputs={[
        {
          id: `${id}-output`,
        },
      ]}
    >
      <label className="field-label">
        Name

        <input
          className="field-control"
          value={name}
          onChange={update(
            'name',
            setName
          )}
          placeholder="Input name"
        />
      </label>

      <label className="field-label">
        Data type

        <select
          className="field-control"
          value={inputType}
          onChange={update(
            'inputType',
            setInputType
          )}
        >
          <option>Text</option>
          <option>File</option>
          <option>JSON</option>
        </select>
      </label>
    </BaseNode>
  );
};