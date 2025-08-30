import {NodeBase} from "../Interfaces/NodeBase";
import {NodeParametorModel} from "../Models/NodeParametorModel";
import {NodeValueType} from "../Models/NodeValueType";
import {IOutputComponent} from "../Interfaces/IOutputComponent";

export class IntInputNode extends NodeBase implements IOutputComponent
{
    OutputValue: NodeParametorModel[] = [];

    constructor(nodeName:string)
    {
        super(nodeName);
        this.OutputValue.push(new NodeParametorModel("Int" , NodeValueType.NuberInt))
    }
    ConnectNode(node: NodeBase): void {
        this.NextNodes.push(node);
    }
    protected InternalExecuteNode(): Promise<void> {
        return Promise.resolve(undefined);
    }
}