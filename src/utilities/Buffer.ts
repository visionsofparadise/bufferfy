import { Buffer as BufferPolyfill } from "buffer";

export const PolyfilledBuffer = Buffer || BufferPolyfill;

export class WebSafeBuffer extends PolyfilledBuffer {}
