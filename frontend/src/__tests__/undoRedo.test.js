import { useStore } from '../store';

const reset = () =>
  useStore.setState({
    nodes: [], edges: [], nodeIDs: {}, past: [], future: [],
  });

const node = (id, x = 0, y = 0, data = {}) => ({
  id, type: 'llm', position: { x, y }, data: { id, ...data },
});

const s = () => useStore.getState();

let base = new Date('2026-01-01T00:00:00Z').getTime();

beforeEach(() => {
  reset();
  jest.useFakeTimers();
  // each test gets its own clock so module-level merge windows never overlap
  base += 10 * 60 * 1000;
  jest.setSystemTime(base);
});
afterEach(() => jest.useRealTimers());

const tick = (ms) => jest.setSystemTime(Date.now() + ms);

test('add node can be undone and redone', () => {
  s().addNode(node('a'));
  expect(s().nodes).toHaveLength(1);
  s().undo();
  expect(s().nodes).toHaveLength(0);
  s().redo();
  expect(s().nodes.map((n) => n.id)).toEqual(['a']);
});

test('connect / edge removal are undoable', () => {
  s().addNode(node('a'));
  s().addNode(node('b'));
  s().onConnect({ source: 'a', target: 'b', sourceHandle: 'a-output', targetHandle: 'b-input' });
  expect(s().edges).toHaveLength(1);
  s().undo();
  expect(s().edges).toHaveLength(0);
  s().redo();
  expect(s().edges).toHaveLength(1);
  tick(1000);
  s().onEdgesChange([{ id: s().edges[0].id, type: 'remove' }]);
  expect(s().edges).toHaveLength(0);
  s().undo();
  expect(s().edges).toHaveLength(1);
});

test('deleting a node and its edges is ONE undo step', () => {
  s().addNode(node('a'));
  s().addNode(node('b'));
  s().onConnect({ source: 'a', target: 'b' });
  tick(1000);
  const edgeId = s().edges[0].id;
  // React Flow emits node removal then edge removal
  s().onNodesChange([{ id: 'a', type: 'remove' }]);
  s().onEdgesChange([{ id: edgeId, type: 'remove' }]);
  expect(s().nodes.map((n) => n.id)).toEqual(['b']);
  expect(s().edges).toHaveLength(0);
  s().undo();
  expect(s().nodes.map((n) => n.id)).toEqual(['a', 'b']);
  expect(s().edges).toHaveLength(1);
});

test('position restored after drag (snapshot at drag start)', () => {
  s().addNode(node('a', 10, 10));
  s().beginDrag();
  s().onNodesChange([{ id: 'a', type: 'position', position: { x: 200, y: 300 }, dragging: true }]);
  s().onNodesChange([{ id: 'a', type: 'position', position: { x: 220, y: 320 }, dragging: true }]);
  s().endDrag();
  expect(s().nodes[0].position).toEqual({ x: 220, y: 320 });
  s().undo();
  expect(s().nodes[0].position).toEqual({ x: 10, y: 10 });
  s().redo();
  expect(s().nodes[0].position).toEqual({ x: 220, y: 320 });
});

test('config edits restore; typing is merged into one step', () => {
  s().addNode(node('a'));
  tick(1000);
  'hello'.split('').forEach((_, i) => {
    s().updateNodeField('a', 'text', 'hello'.slice(0, i + 1));
    tick(50);
  });
  expect(s().nodes[0].data.text).toBe('hello');
  s().undo();
  expect(s().nodes[0].data.text).toBeUndefined();
  s().redo();
  expect(s().nodes[0].data.text).toBe('hello');
  // different field = new step
  tick(1000);
  s().updateNodeField('a', 'model', 'Claude 3.5');
  s().undo();
  expect(s().nodes[0].data.model).toBeUndefined();
  expect(s().nodes[0].data.text).toBe('hello');
});

test('new action after undo clears redo stack', () => {
  s().addNode(node('a'));
  s().undo();
  expect(s().future).toHaveLength(1);
  s().addNode(node('b'));
  expect(s().future).toHaveLength(0);
});

test('selection / dimension changes do not create history', () => {
  s().addNode(node('a'));
  const before = s().past.length;
  s().onNodesChange([{ id: 'a', type: 'select', selected: true }]);
  s().onNodesChange([{ id: 'a', type: 'dimensions', dimensions: { width: 100, height: 50 } }]);
  expect(s().past.length).toBe(before);
});

test('clear is undoable, undo/redo on empty history is a no-op', () => {
  s().undo(); s().redo();
  expect(s().nodes).toHaveLength(0);
  s().addNode(node('a'));
  s().clearPipeline();
  expect(s().nodes).toHaveLength(0);
  s().undo();
  expect(s().nodes).toHaveLength(1);
});

test('setPipeline resets history and rebuilds id counters', () => {
  s().addNode(node('a'));
  s().setPipeline([node('llm-3'), node('text-2')], []);
  expect(s().past).toHaveLength(0);
  expect(s().nodeIDs).toEqual({ llm: 3, text: 2 });
  expect(s().getNodeID('llm')).toBe('llm-4');
});

test('a click (drag start/stop without movement) creates no undo step', () => {
  s().addNode(node('a', 10, 10));
  const before = s().past.length;
  s().beginDrag();
  s().endDrag();
  expect(s().past.length).toBe(before);
});
