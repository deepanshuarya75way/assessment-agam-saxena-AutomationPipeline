import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const InputNode = ({ id, data }) => {
  const updateNodeField = useStore(
    (state) => state.updateNodeField
  );

  // Values live in the store (not local state) so that
  // undo / redo can restore them.
  const name = data?.name ?? 'input';
  const inputType = data?.inputType ?? 'Text';

  const update = (field) => (event) =>
    updateNodeField(id, field, event.target.value);

  return (
    <BaseNode
      title="Input"
      subtitle="Pipeline entry point"
      icon="IN"
      color="#6366f1"
      outputs={[{ id: `${id}-output` }]}
    >
      <label className="field-label">
        Name

        <input
          className="field-control"
          value={name}
          onChange={update('name')}
          placeholder="Input name"
        />
      </label>

      <label className="field-label">
        Data type

        <select
          className="field-control"
          value={inputType}
          onChange={update('inputType')}
        >
          <option>Text</option>
          <option>File</option>
          <option>JSON</option>
        </select>
      </label>
    </BaseNode>
  );
};
