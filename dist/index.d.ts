import { Duplex } from "readable-stream";
interface IOptions {
    name: string;
    target: string;
    targetWindow?: any;
}
declare class PostMessageStream extends Duplex {
    _name: string;
    _target: string;
    _targetWindow: any;
    _origin: string;
    _init: boolean;
    _haveSyn: boolean;
    constructor(options: IOptions);
    _onMessage(this: any, event: MessageEvent): void;
    _read: () => void;
    _write(data: any, _encoding: any, cb: Function): void;
}
export default PostMessageStream;
