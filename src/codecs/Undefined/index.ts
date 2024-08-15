import { ConstantCodec, ConstantCodecOptions } from "../Constant";

export class UndefinedCodec extends ConstantCodec<undefined> {
	constructor(options?: ConstantCodecOptions) {
		super(undefined, options);
	}
}

export function createUndefinedCodec(...parameters: ConstructorParameters<typeof UndefinedCodec>): UndefinedCodec {
	return new UndefinedCodec(...parameters);
}
