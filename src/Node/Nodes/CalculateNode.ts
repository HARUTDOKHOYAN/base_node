import { NodeBase} from "../Interfaces/NodeBase";
import {IInputComponent} from "../Interfaces/IInputComponent";
import {IOutputComponent} from "../Interfaces/IOutputComponent";
import {NodeParametorModel} from "../Models/NodeParametorModel";
import {NodeValueType} from "../Models/NodeValueType";

export class CalculateNode extends NodeBase implements IOutputComponent , IInputComponent
{
    InputValue: NodeParametorModel[] = [];
    OutputValue: NodeParametorModel[] = [];

    constructor(nodeName:string)
    {
        super(nodeName);
        this.OutputValue.push(new NodeParametorModel("Int" , NodeValueType.NuberInt))
        this.InputValue.push(new NodeParametorModel("Int" , NodeValueType.NuberInt))
        this.InputValue.push(new NodeParametorModel("Int" , NodeValueType.NuberInt))
    }
    CanConnect(incomingValue: NodeParametorModel, contactingValue:NodeParametorModel , contactingComponent: IOutputComponent): boolean
    {
        if(incomingValue.Type !== contactingValue.Type)
            return false;
        incomingValue.Value = contactingValue.Value;
        contactingComponent.ConnectNode(this);
        return true;
    }

    ConnectNode(node: NodeBase): void
    {
        this.NextNodes.push(node);
    }

    protected InternalExecuteNode(): Promise<void> {
        this.OutputValue[0].Value = this.InputValue[0].Value + this.InputValue[1].Value;
        return Promise.resolve(undefined);
    }

}