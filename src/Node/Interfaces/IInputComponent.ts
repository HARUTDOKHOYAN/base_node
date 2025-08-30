import {IOutputComponent} from "./IOutputComponent";
import {NodeParametorModel} from "../Models/NodeParametorModel";

export interface IInputComponent
{
    InputValue:NodeParametorModel[];
    CanConnect(incomingValue: NodeParametorModel, contactingValue:NodeParametorModel , contactingComponent: IOutputComponent):boolean;
}