export abstract class NodeBase
{
    public readonly NodeName: string;
    public NextNodes : NodeBase[] = [];

    protected constructor(nodeName:string)
    {
        this.NodeName = nodeName;
    }

    public async ExecuteNode():Promise<void>{
        await  this.InternalExecuteNode();
        for (const node of this.NextNodes){
            await node.ExecuteNode();
        }
    }
    protected abstract InternalExecuteNode():Promise<void>;
}








