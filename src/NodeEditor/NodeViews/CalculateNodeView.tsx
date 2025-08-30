import React from 'react';
import { NodePortSide, NodeUI } from '../types';
import { isInputComponent, isOutputComponent } from './common';

interface Props {
  node: NodeUI;
  selected: boolean;
  onMouseDown: (e: React.MouseEvent, nodeId: string) => void;
  onStartConnect: (nodeId: string, side: NodePortSide, index: number, e: React.MouseEvent) => void;
  onDelete: (nodeId: string) => void;
}

export const CalculateNodeView: React.FC<Props> = ({ node, selected, onMouseDown, onStartConnect, onDelete }) => {
  const inputs = isInputComponent(node.instance) ? node.instance.InputValue : [];
  const outputs = isOutputComponent(node.instance) ? node.instance.OutputValue : [];
  return (
    <div className={`ne-node ${selected ? 'selected' : ''}`} style={{ left: node.position.x, top: node.position.y }} onMouseDown={(e) => onMouseDown(e, node.id)}>
      <div className="ne-node-header">
        <span className="ne-node-title">{node.title}</span>
        <button className="ne-node-delete" onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}>×</button>
      </div>
      <div className="ne-node-ports">
        <div className="ne-node-ports-col">
          {inputs.map((p, i) => (
            <div className="ne-port" key={`in-${i}`}>
              <span className="ne-port-dot input" data-node-id={node.id} data-port-index={i} onMouseDown={(e) => onStartConnect(node.id, 'input', i, e)} />
              <span className="ne-port-name">{p.Name}</span>
            </div>
          ))}
        </div>
        <div className="ne-node-ports-col right">
          {outputs.map((p, i) => (
            <div className="ne-port" key={`out-${i}`}>
              <span className="ne-port-name">{p.Name}</span>
              <span className="ne-port-dot output" data-node-id={node.id} data-port-index={i} onMouseDown={(e) => onStartConnect(node.id, 'output', i, e)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


