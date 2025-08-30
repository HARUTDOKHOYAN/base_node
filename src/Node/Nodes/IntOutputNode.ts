import {NodeBase} from "../Interfaces/NodeBase";
import {IInputComponent} from "../Interfaces/IInputComponent";
import {NodeParametorModel} from "../Models/NodeParametorModel";
import {NodeValueType} from "../Models/NodeValueType";
import {IOutputComponent} from "../Interfaces/IOutputComponent";

export  class IntOutputNode extends NodeBase implements IInputComponent
{
    InputValue: NodeParametorModel[] = [];

    constructor(nodeName:string)
    {
        super(nodeName);
        this.InputValue.push(new NodeParametorModel("Int" , NodeValueType.NuberInt))
    }

    CanConnect(incomingValue: NodeParametorModel, contactingValue: NodeParametorModel, contactingComponent: IOutputComponent): boolean {
        if(incomingValue.Type !== contactingValue.Type)
            return false;
        contactingComponent.ConnectNode(this);
        return true;
    }

    protected InternalExecuteNode(): Promise<void> {
        return Promise.resolve(undefined);
    }

}