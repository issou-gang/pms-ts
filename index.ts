import DuplexStream, { Duplex } from "readable-stream";
// import { inherits } from "util";

interface IOptions {
  name: string;
  target: string;
  targetWindow?: any;
}

interface IEvent {
  data: any;
  origin: string;
  source: string;
}

const noop = () => {};

class PostMessageStream extends Duplex {
  _name: string;
  _target: string;
  _targetWindow: any;
  _origin: string;
  _init: boolean;
  _haveSyn: boolean;
  constructor(options: IOptions) {
    super({
      objectMode: true,
    });

    this._name = options.name;
    this._target = options.target;
    this._targetWindow = options.targetWindow || window;
    this._origin = options.targetWindow ? "*" : location.origin;
    this._init = false;
    this._haveSyn = false;

    window.addEventListener("message", this._onMessage.bind(this), false);
    this._write("SYN", null, noop);
    this.cork();
  }

  _onMessage(this: any, event: MessageEvent) {
    var msg = event.data;

    // validate message
    if (this._origin !== "*" && event.origin !== this._origin) return;
    if (event.source !== this._targetWindow) return;
    if (typeof msg !== "object") return;
    if (msg.target !== this._name) return;
    if (!msg.data) return;

    if (!this._init) {
      if (msg.data === "SYN") {
        this._haveSyn = true;
        this._write("ACK", null, noop);
      } else if (msg.data === "ACK") {
        this._init = true;
        if (!this._haveSyn) {
          this._write("ACK", null, noop);
        }
        this.uncork();
      }
    } else {
      try {
        this.push(msg.data);
      } catch (err) {
        this.emit("error", err);
      }
    }
  }

  _read = noop;

  _write(data: any, _encoding: any, cb: Function) {
    var message = {
      target: this._target,
      data: data,
    };
    this._targetWindow.postMessage(message, this._origin);
    cb();
  }
}

export default PostMessageStream;
