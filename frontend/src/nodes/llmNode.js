import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const LLMNode = ({ id, data }) => {
  const updateNodeField = useStore(
    (state) => state.updateNodeField
  );

  const model = data?.model ?? 'GPT-4o';
  const temperature = data?.temperature ?? '0.7';

  const update = (field) => (event) =>
    updateNodeField(id, field, event.target.value);

  return (
    <BaseNode
      title="LLM"
      subtitle="Generate AI responses"
      icon="AI"
      color="#7c3aed"
      inputs={[{ id: `${id}-input` }]}
      outputs={[{ id: `${id}-output` }]}
    >
      <label className="field-label">
        Model

        <select
          className="field-control"
          value={model}
          onChange={update('model')}
        >
          <option>GPT-4o</option>
          <option>Claude 3.5</option>
          <option>Gemini 1.5</option>
        </select>
      </label>

      <label className="field-label">
        Temperature

        <input
          className="field-control"
          type="number"
          min="0"
          max="2"
          step="0.1"
          value={temperature}
          onChange={update('temperature')}
        />
      </label>
    </BaseNode>
  );
};
