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
	private readonly _reverseCodecs: Codecs;
	private readonly _indexCodec: UIntCodec;

	constructor(codecs: Codecs, options?: UnionCodecOptions) {
		super();

		this._codecs = codecs;
		this._reverseCodecs = codecs;
		this._reverseCodecs.reverse();

		this._id = options?.id;
		this._indexCodec = options?.indexCodec || new UIntCodec();
	}

	match(value: any, context: Context): value is CodecType<Codecs[number]> {
		let index = this._codecs.length;

		while (index--)
			if (this._reverseCodecs[index].match(value, context)) {
				this.setContext(value, context);

				return true;
			}

		return false;
	}

	encodingLength(value: CodecType<Codecs[number]>, context: Context = new Context()): number {
		this.setContext(value, context);

		let index = this._codecs.length;

		while (index--) {
			if (this._reverseCodecs[index].match(value, context)) return this._indexCodec.encodingLength(0, context) + this._reverseCodecs[index].encodingLength(value, context);
		}

		throw new BufferfyError("Value does not match any codec");
	}

	write(value: CodecType<Codecs[number]>, stream: Stream, context: Context): void {
		this.setContext(value, context);

		let index = this._codecs.length;

		while (index-- && !this._reverseCodecs[index].match(value, context)) {}

		if (index < 0) throw new BufferfyError("Value does not match any codec");

		this._indexCodec.write(index, stream, context);

		this._reverseCodecs[index].write(value, stream, context);
	}

	read(stream: Stream, context: Context): CodecType<Codecs[number]> {
		const index = this._indexCodec.read(stream, context);

		const value = this._reverseCodecs[index].read(stream, context);

		this.setContext(value, context);

		return value;
	}
}

export function createUnionCodec<const Codecs extends Array<AbstractCodec<any>>>(...parameters: ConstructorParameters<typeof UnionCodec<Codecs>>) {
	return new UnionCodec<Codecs>(...parameters);
}
