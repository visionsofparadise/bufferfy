import { ConstantCodec, ConstantCodecOptions } from "../Constant";

export class NullCodec extends ConstantCodec<null> {
	constructor(options?: ConstantCodecOptions) {
		super(null, options);
	}
}

export function createNullCodec(...parameters: ConstructorParameters<typeof NullCodec>) {
	return new NullCodec(...parameters);
}
