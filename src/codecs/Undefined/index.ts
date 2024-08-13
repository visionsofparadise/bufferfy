import { ConstantCodec, ConstantCodecOptions } from "../Constant";

export class UndefinedCodec extends ConstantCodec<undefined> {
	constructor(options?: ConstantCodecOptions) {
		super(undefined, options);
	}
}

export const createUndefinedCodec = (...parameters: ConstructorParameters<typeof UndefinedCodec>) => {
	return new UndefinedCodec(...parameters);
};
