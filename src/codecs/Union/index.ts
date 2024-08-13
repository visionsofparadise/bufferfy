import { Context } from "../../utilities/Context";
import { BufferfyError } from "../../utilities/Error";
import { PointableOptions } from "../../utilities/Pointable";
import { Stream } from "../../utilities/Stream";
import { AbstractCodec, CodecType } from "../Abstract";
import { UIntCodec } from "../UInt";

export interface UnionCodecOptions extends PointableOptions {
	indexCodec?: UIntCodec;
}

export class UnionCodec<const Codecs extends Array<AbstractCodec<any>>> extends AbstractCodec<CodecType<Codecs[number]>> {
	private readonly _codecs: Codecs;
	private readonly _indexCodec: UIntCodec;

	constructor(codecs: Codecs, options?: UnionCodecOptions) {
		super();

		this._codecs = codecs;
		this._id = options?.id;
		this._indexCodec = options?.indexCodec || new UIntCodec();
	}

	match(value: any, context: Context): value is CodecType<Codecs[number]> {
		let index = this._codecs.length;

		while (index--) if (this._codecs[index].match(value, context)) return true;

		this.setContext(value, context);

		return false;
	}

	encodingLength(value: CodecType<Codecs[number]>, context: Context): number {
		this.setContext(value, context);

		let index = this._codecs.length;

		while (index--) {
			if (this._codecs[index].match(value, context)) return this._indexCodec.encodingLength(0, context) + this._codecs[index].encodingLength(value, context);
		}

		throw new BufferfyError("Value does not match any codec");
	}

	write(value: CodecType<Codecs[number]>, stream: Stream, context: Context): void {
		this.setContext(value, context);

		let index = this._codecs.length;

		while (index-- && !this._codecs[index].match(value, context)) {}

		if (index < 0) throw new BufferfyError("Value does not match any codec");

		this._indexCodec.write(index, stream, context);

		this._codecs[index].write(value, stream, context);
	}

	read(stream: Stream, context: Context): CodecType<Codecs[number]> {
		const index = this._indexCodec.read(stream, context);

		const value = this._codecs[index].read(stream, context);

		this.setContext(value, context);

		return value;
	}
}

export const createUnionCodec = <const Codecs extends Array<AbstractCodec<any>>>(...parameters: ConstructorParameters<typeof UnionCodec<Codecs>>) => {
	return new UnionCodec<Codecs>(...parameters);
};
