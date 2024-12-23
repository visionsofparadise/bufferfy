import { Context } from "../../utilities/Context";
import { BufferfyError } from "../../utilities/Error";
import { AbstractCodec, CodecType } from "../Abstract";
import { VarInt60Codec } from "../VarInt/VarInt60";

/**
 * Creates a codec for one of many types of value. Each codec type has a match method that returns true if the input value type matches the codec's type. The union codec iterates through codecs until a codec matches and then uses that codec. Some examples of when the union codec can be useful are:
 *
 * - Optional or nullable values.
 * - Overloaded values.
 *
 * Serializes to ```[CODEC_INDEX][VALUE]```
 *
 * @param	{Array<AbstractCodec>} codecs - An array of codecs for possible value types.
 * @param 	{AbstractCodec<number>} [indexCodec="VarInt60Codec()"] - Codec for the index value.
 * @return	{UnionCodec} UnionCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Union/index.ts|Source}
 */
export const createUnionCodec = <const Codecs extends Array<AbstractCodec<any>>>(codecs: Codecs, indexCodec: AbstractCodec<number> = new VarInt60Codec()) => new UnionCodec(codecs, indexCodec);

export class UnionCodec<const Codecs extends Array<AbstractCodec<any>>> extends AbstractCodec<CodecType<Codecs[number]>> {
	constructor(public readonly codecs: Codecs, public readonly indexCodec: AbstractCodec<number> = new VarInt60Codec()) {
		super();
	}

	isValid(value: unknown): value is CodecType<Codecs[number]> {
		for (const codec of this.codecs) if (codec.isValid(value)) return true;

		return false;
	}

	byteLength(value: CodecType<Codecs[number]>): number {
		for (let i = 0; i < this.codecs.length; i++) {
			if (this.codecs[i].isValid(value)) return this.indexCodec.byteLength(i) + this.codecs[i].byteLength(value);
		}

		throw new BufferfyError("Value does not match any codec");
	}

	_encode(value: CodecType<Codecs[number]>, buffer: Uint8Array, c: Context): void {
		for (let i = 0; i < this.codecs.length; i++) {
			if (this.codecs[i].isValid(value)) {
				this.indexCodec._encode(i, buffer, c);
				this.codecs[i]._encode(value, buffer, c);

				return;
			}
		}

		throw new BufferfyError("Value does not match any codec");
	}

	_decode(buffer: Uint8Array, c: Context): CodecType<Codecs[number]> {
		const index = this.indexCodec._decode(buffer, c);

		return this.codecs[index]._decode(buffer, c);
	}
}
