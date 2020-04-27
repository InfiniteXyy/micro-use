declare module "@infinitex/micro-use" {
  import { ServerResponse, IncomingMessage } from "http";
  type Handler = (req: IncomingMessage & any, res: ServerResponse) => any;
  export function hooked(handler: Handler): Handler;
  export function sendReject(
    res: ServerResponse,
    code: number,
    data?: any
  ): Promise<void>;
  export function useContext(): { req: any & IncomingMessage; res: ServerResponse };
  export function useBody<T>(validator): T;
  export function useHeaders(): object;
}
