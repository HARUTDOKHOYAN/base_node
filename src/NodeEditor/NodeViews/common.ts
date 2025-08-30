import { IInputComponent } from "../../Node/Interfaces/IInputComponent";
import { IOutputComponent } from "../../Node/Interfaces/IOutputComponent";

export function isInputComponent(x: unknown): x is IInputComponent {
  const v = x as any;
  return !!v && Array.isArray(v.InputValue) && typeof v.CanConnect === 'function';
}

export function isOutputComponent(x: unknown): x is IOutputComponent {
  const v = x as any;
  return !!v && Array.isArray(v.OutputValue) && typeof v.ConnectNode === 'function';
}


