import {NodeValueType} from "./NodeValueType";

export class NodeParametorModel
{
    public Name:string;
    public Type:NodeValueType;
    public Value:any;

    constructor(name:string, type:NodeValueType )
    {
        this.Name = name;
        this.Type = type;
    }
}