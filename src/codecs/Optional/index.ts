import { AbstractCodec } from "../Abstract";
import { UIntCodec } from "../UInt";
import { UndefinedCodec } from "../Undefined";
import { UnionCodec, UnionCodecOptions } from "../Union";

export class OptionalCodec<Codec extends AbstractCodec> extends UnionCodec<[Codec, UndefinedCodec]> {
	constructor(codec: Codec, options?: UnionCodecOptions) {
		super([codec, new UndefinedCodec()], {
			id: options?.id,
			indexCodec: new UIntCodec(8),
		});
	}
}

export function createOptionalCodec<Codec extends AbstractCodec>(...parameters: ConstructorParameters<typeof OptionalCodec<Codec>>) {
	return new OptionalCodec<Codec>(...parameters);
}
