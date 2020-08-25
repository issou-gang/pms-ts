"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var readable_stream_1 = require("readable-stream");
var noop = function () { };
var PostMessageStream = /** @class */ (function (_super) {
    __extends(PostMessageStream, _super);
    function PostMessageStream(options) {
        var _this = _super.call(this, {
            objectMode: true,
        }) || this;
        _this._read = noop;
        _this._name = options.name;
        _this._target = options.target;
        _this._targetWindow = options.targetWindow || window;
        _this._origin = options.targetWindow ? "*" : location.origin;
        _this._init = false;
        _this._haveSyn = false;
        window.addEventListener("message", _this._onMessage.bind(_this), false);
        _this._write("SYN", null, noop);
        _this.cork();
        return _this;
    }
    PostMessageStream.prototype._onMessage = function (event) {
        var msg = event.data;
        // validate message
        if (this._origin !== "*" && event.origin !== this._origin)
            return;
        if (event.source !== this._targetWindow)
            return;
        if (typeof msg !== "object")
            return;
        if (msg.target !== this._name)
            return;
        if (!msg.data)
            return;
        if (!this._init) {
            if (msg.data === "SYN") {
                this._haveSyn = true;
                this._write("ACK", null, noop);
            }
            else if (msg.data === "ACK") {
                this._init = true;
                if (!this._haveSyn) {
                    this._write("ACK", null, noop);
                }
                this.uncork();
            }
        }
        else {
            try {
                this.push(msg.data);
            }
            catch (err) {
                this.emit("error", err);
            }
        }
    };
    PostMessageStream.prototype._write = function (data, _encoding, cb) {
        var message = {
            target: this._target,
            data: data,
        };
        this._targetWindow.postMessage(message, this._origin);
        cb();
    };
    return PostMessageStream;
}(readable_stream_1.Duplex));
exports.default = PostMessageStream;
//# sourceMappingURL=index.js.map