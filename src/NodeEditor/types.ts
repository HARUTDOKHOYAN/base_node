import { NodeBase } from "../Node/Interfaces/NodeBase";
import { NodeParametorModel } from "../Node/Models/NodeParametorModel";

export type NodePortSide = "input" | "output";

export interface NodeUI {
  id: string;
  title: string;
  position: { x: number; y: number };
  instance: NodeBase;
}

export interface EdgeEndRef {
  nodeId: string;
  portIndex: number;
}

export interface EdgeUI {
  id: string;
  from: EdgeEndRef; // output
  to: EdgeEndRef;   // input
}

export type GetPortsFn = (node: NodeBase) => NodeParametorModel[];


