import { AbstractCodec } from "../codecs/Abstract";

export class Context {
	values: Record<string, any> = {};
	codecs: Record<string, AbstractCodec<any>> = {};

	constructor() {}
}
