import React, { useMemo, useRef, useState } from 'react';
import { EdgeUI, NodePortSide, NodeUI } from './types';
import { IntInputNodeView } from './NodeViews/IntInputNodeView';
import { CalculateNodeView } from './NodeViews/CalculateNodeView';
import { IntOutputNodeView } from './NodeViews/IntOutputNodeView';
import { IntInputNode } from '../Node/Nodes/IntInputNode';
import { CalculateNode } from '../Node/Nodes/CalculateNode';
import { IntOutputNode } from '../Node/Nodes/IntOutputNode';
import { IInputComponent } from '../Node/Interfaces/IInputComponent';
import { IOutputComponent } from '../Node/Interfaces/IOutputComponent';

type DragState =
  | { kind: 'none' }
  | { kind: 'pan'; startX: number; startY: number; originX: number; originY: number }
  | { kind: 'move-node'; nodeId: string; offsetX: number; offsetY: number }
  | { kind: 'connect'; side: NodePortSide; nodeId: string; portIndex: number; cursor: { x: number; y: number } };

const randomId = () => Math.random().toString(36).slice(2);

function isInputComponent(x: unknown): x is IInputComponent { const v = x as any; return !!v && Array.isArray(v.InputValue) && typeof v.CanConnect === 'function'; }
function isOutputComponent(x: unknown): x is IOutputComponent { const v = x as any; return !!v && Array.isArray(v.OutputValue) && typeof v.ConnectNode === 'function'; }

function makeUI(kind: 'IntInput' | 'Calculate' | 'IntOutput', x: number, y: number): NodeUI {
  switch (kind) {
    case 'IntInput':
      return { id: randomId(), title: 'Int Input', position: { x, y }, instance: new IntInputNode('Int Input') };
    case 'Calculate':
      return { id: randomId(), title: 'Calculate', position: { x, y }, instance: new CalculateNode('Calculate') };
    case 'IntOutput':
    default:
      return { id: randomId(), title: 'Int Output', position: { x, y }, instance: new IntOutputNode('Int Output') };
  }
}

export const NodeEditor: React.FC = () => {
  const [nodes, setNodes] = useState<NodeUI[]>([]);
  const [edges, setEdges] = useState<EdgeUI[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState>({ kind: 'none' });
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const [running, setRunning] = useState(false);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const screenToWorld = (x: number, y: number) => ({ x: (x - viewport.x) / viewport.scale, y: (y - viewport.y) / viewport.scale });

  const onCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('ne-canvas')) {
      setSelectedNodeId(null);
      setDrag({ kind: 'pan', startX: e.clientX, startY: e.clientY, originX: viewport.x, originY: viewport.y });
    }
  };
  const onCanvasMouseMove = (e: React.MouseEvent) => {
    if (drag.kind === 'pan') {
      const dx = e.clientX - drag.startX; const dy = e.clientY - drag.startY; setViewport(v => ({ ...v, x: drag.originX + dx, y: drag.originY + dy }));
    } else if (drag.kind === 'move-node') {
      const p = screenToWorld(e.clientX, e.clientY);
      setNodes(prev => prev.map(n => n.id === drag.nodeId ? { ...n, position: { x: p.x - drag.offsetX, y: p.y - drag.offsetY } } : n));
    } else if (drag.kind === 'connect') {
      const p = screenToWorld(e.clientX, e.clientY); setDrag({ ...drag, cursor: p });
    }
  };
  const onCanvasMouseUp = (e: React.MouseEvent) => {
    if (drag.kind === 'connect') {
      const target = e.target as HTMLElement; const portEl = target.closest('.ne-port-dot') as HTMLElement | null;
      if (portEl) {
        const dropIsOutput = portEl.classList.contains('output'); const portIndexAttr = portEl.getAttribute('data-port-index'); const nodeIdAttr = portEl.getAttribute('data-node-id');
        if (portIndexAttr && nodeIdAttr) {
          const portIndex = parseInt(portIndexAttr, 10);
          if (drag.side === 'output' && !dropIsOutput) {
            const from = nodes.find(n => n.id === drag.nodeId)?.instance; const to = nodes.find(n => n.id === nodeIdAttr)?.instance;
            if (from && to && isOutputComponent(from) && isInputComponent(to)) {
              const ok = to.CanConnect(to.InputValue[portIndex], from.OutputValue[drag.portIndex], from);
              if (ok) setEdges(prev => prev.concat({ id: randomId(), from: { nodeId: drag.nodeId, portIndex: drag.portIndex }, to: { nodeId: nodeIdAttr, portIndex } }));
            }
          } else if (drag.side === 'input' && dropIsOutput) {
            const from = nodes.find(n => n.id === nodeIdAttr)?.instance; const to = nodes.find(n => n.id === drag.nodeId)?.instance;
            if (from && to && isOutputComponent(from) && isInputComponent(to)) {
              const ok = to.CanConnect(to.InputValue[drag.portIndex], from.OutputValue[portIndex], from);
              if (ok) setEdges(prev => prev.concat({ id: randomId(), from: { nodeId: nodeIdAttr, portIndex }, to: { nodeId: drag.nodeId, portIndex: drag.portIndex } }));
            }
          }
        }
      }
      setDrag({ kind: 'none' }); return;
    }
    if (drag.kind !== 'none') setDrag({ kind: 'none' });
  };
  const onWheel: React.WheelEventHandler<HTMLDivElement> = (e) => { e.preventDefault(); const d = -e.deltaY * 0.001; const newScale = Math.min(2, Math.max(0.25, viewport.scale * (1 + d))); setViewport(v => ({ ...v, scale: newScale })); };

  const onNodeMouseDown = (e: React.MouseEvent, nodeId: string) => { e.stopPropagation(); setSelectedNodeId(nodeId); const node = nodes.find(n => n.id === nodeId)!; const p = screenToWorld(e.clientX, e.clientY); setDrag({ kind: 'move-node', nodeId, offsetX: p.x - node.position.x, offsetY: p.y - node.position.y }); };

  const isCompatible = (fromNodeId: string, outIndex: number, toNodeId: string, inIndex: number) => {
    const fromInst = nodes.find(n => n.id === fromNodeId)?.instance; const toInst = nodes.find(n => n.id === toNodeId)?.instance;
    if (!fromInst || !toInst) return false; if (!isOutputComponent(fromInst) || !isInputComponent(toInst)) return false;
    const outPort = fromInst.OutputValue[outIndex]; const inPort = toInst.InputValue[inIndex];
    return !!outPort && !!inPort && outPort.Type === inPort.Type;
  };

  const portPosition = (node: NodeUI, side: NodePortSide, index: number) => {
    const nodeX = node.position.x; const nodeY = node.position.y; const width = 220; const header = 32; const row = 24; const y = nodeY + header + index * row + 12; const x = side === 'output' ? nodeX + width - 8 : nodeX + 8; return { x, y };
  };

  const edgesSvg = useMemo(() => edges.map(edge => {
    const from = nodes.find(n => n.id === edge.from.nodeId); const to = nodes.find(n => n.id === edge.to.nodeId); if (!from || !to) return null;
    const p1 = portPosition(from, 'output', edge.from.portIndex); const p2 = portPosition(to, 'input', edge.to.portIndex);
    const cp1 = { x: p1.x + 60, y: p1.y }; const cp2 = { x: p2.x - 60, y: p2.y }; const d = `M ${p1.x} ${p1.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p2.x} ${p2.y}`; return <path key={edge.id} d={d} className="ne-edge" />;
  }), [edges, nodes]);

  const tempConnectionPath = useMemo(() => { if (drag.kind !== 'connect') return null; const startNode = nodes.find(n => n.id === drag.nodeId); if (!startNode) return null; const start = portPosition(startNode, drag.side, drag.portIndex); const end = drag.cursor; const cp1 = { x: start.x + 60, y: start.y }; const cp2 = { x: end.x - 60, y: end.y }; const d = `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`; return <path d={d} className="ne-edge temp" />; }, [drag, nodes]);

  const propagateAllEdges = () => {
    edges.forEach(e => {
      const from = nodes.find(n => n.id === e.from.nodeId)?.instance;
      const to = nodes.find(n => n.id === e.to.nodeId)?.instance;
      if (from && to && isOutputComponent(from) && isInputComponent(to)) {
        const outVal = from.OutputValue[e.from.portIndex]?.Value;
        if (typeof outVal !== 'undefined') {
          to.InputValue[e.to.portIndex].Value = outVal;
        }
      }
    });
  };

  const findRootNodeIds = () => {
    const incoming = new Set(edges.map(e => e.to.nodeId));
    return nodes.map(n => n.id).filter(id => !incoming.has(id));
  };

  const runFromIds = async (startIds: string[]) => {
    setRunning(true);
    try {
      propagateAllEdges();
      await Promise.all(startIds.map(async id => {
        const inst = nodes.find(n => n.id === id)?.instance;
        if (inst) await inst.ExecuteNode();
      }));
      propagateAllEdges();
      setNodes(prev => prev.map(n => ({ ...n })));
    } finally {
      setRunning(false);
    }
  };

  const toolbarAdd = (kind: 'IntInput' | 'Calculate' | 'IntOutput') => { const cx = (canvasRef.current?.clientWidth || 0) / 2; const cy = (canvasRef.current?.clientHeight || 0) / 2; const at = screenToWorld(cx, cy); setNodes(prev => prev.concat(makeUI(kind, at.x, at.y))); };
  const toolbarDelete = () => { if (selectedNodeId) { setNodes(prev => prev.filter(n => n.id !== selectedNodeId)); setEdges(prev => prev.filter(e => e.from.nodeId !== selectedNodeId && e.to.nodeId !== selectedNodeId)); setSelectedNodeId(null); } };
  const handleChangeOutputValue = (nodeId: string, index: number, value: number) => {
    setNodes(prev => prev.map(n => {
      if (n.id !== nodeId) return n;
      const inst = n.instance;
      if (isOutputComponent(inst)) {
        inst.OutputValue[index].Value = value;
      }
      return { ...n };
    }));
  };
  const handleStartConnect = (nodeId: string, side: NodePortSide, index: number, e: React.MouseEvent) => { e.stopPropagation(); const p = screenToWorld(e.clientX, e.clientY); setDrag({ kind: 'connect', nodeId, side, portIndex: index, cursor: p }); };
  const handleDeleteNode = (nodeId: string) => { setNodes(prev => prev.filter(n => n.id !== nodeId)); setEdges(prev => prev.filter(e => e.from.nodeId !== nodeId && e.to.nodeId !== nodeId)); if (selectedNodeId === nodeId) setSelectedNodeId(null); };

  return (
    <div className="ne-root">
      <div className="ne-toolbar">
        <button onClick={() => toolbarAdd('IntInput')}>Add Int Input</button>
        <button onClick={() => toolbarAdd('Calculate')}>Add Calculate</button>
        <button onClick={() => toolbarAdd('IntOutput')}>Add Int Output</button>
        <button onClick={toolbarDelete} disabled={!selectedNodeId}>Delete Selected</button>
        <button onClick={() => runFromIds(findRootNodeIds())} disabled={running || nodes.length === 0}>Run All</button>
        <button onClick={() => selectedNodeId && runFromIds([selectedNodeId])} disabled={running || !selectedNodeId}>Run Selected</button>
      </div>
      <div className="ne-canvas" ref={canvasRef} onMouseDown={onCanvasMouseDown} onMouseMove={onCanvasMouseMove} onMouseUp={onCanvasMouseUp} onWheel={onWheel}>
        <div className="ne-viewport" style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})` }}>
          <svg className="ne-edges">{edgesSvg}{tempConnectionPath}</svg>
          {nodes.map(n => {
            const props = { key: n.id, node: n, selected: n.id === selectedNodeId, onMouseDown: onNodeMouseDown, onStartConnect: handleStartConnect, onDelete: handleDeleteNode } as const;
            if (n.instance instanceof IntInputNode) return <IntInputNodeView {...props} onChangeOutputValue={handleChangeOutputValue} />;
            if (n.instance instanceof CalculateNode) return <CalculateNodeView {...props} />;
            if (n.instance instanceof IntOutputNode) return <IntOutputNodeView {...props} />;
            return null;
          })}
        </div>
      </div>
    </div>
  );
};


