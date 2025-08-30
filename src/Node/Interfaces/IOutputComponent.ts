import {NodeBase} from "./NodeBase";
import {NodeParametorModel} from "../Models/NodeParametorModel";

export interface IOutputComponent{
    OutputValue:NodeParametorModel[ ];
    ConnectNode(node:NodeBase):void;
}