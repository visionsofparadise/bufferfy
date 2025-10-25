import { Context } from "../../utilities/Context";
import { BufferfyError } from "../../utilities/Error";
import { AbstractCodec, CodecType } from "../Abstract";
import { VarInt60Codec } from "../VarInt/VarInt60";

/**
 * Creates a codec for one of many types of value. Useful for optional/nullable values and discriminated unions.
 *
 * Nested union codecs are flattened to a single array of possible codecs.
 *
 * Serializes to ```[CODEC_INDEX][VALUE]```
 *
 * **Order matters:** Codecs are tested sequentially. First match wins. Place specific codecs before general ones, `AnyCodec` last.
 *
 * @example
 * ```ts
 * // Correct: specific → general
 * Codec.Union([Codec.Constant("active"), Codec.String(), Codec.Any()])
 *
 * // Wrong: Any() matches everything, shadows rest
 * Codec.Union([Codec.Any(), Codec.String()])
 * ```
 *
 * @param	{Array<AbstractCodec>} codecs - An array of codecs for possible value types.
 * @param 	{AbstractCodec<number>} [indexCodec="VarInt60Codec()"] - Codec for the index value.
 * @return	{UnionCodec} UnionCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Union/index.ts|Source}
 */
export const createUnionCodec = <const Codecs extends Array<AbstractCodec<any>>>(codecs: Codecs, indexCodec: AbstractCodec<number> = new VarInt60Codec()) => new UnionCodec(codecs, indexCodec);

export class UnionCodec<const Codecs extends Array<AbstractCodec<any>>> extends AbstractCodec<CodecType<Codecs[number]>> {
	codecs: Codecs;

	constructor(codecs: Codecs, public readonly indexCodec: AbstractCodec<number> = new VarInt60Codec()) {
		super();

		this.codecs = codecs.flatMap((codec): AbstractCodec<any> | Array<AbstractCodec<any>> => {
			if (codec instanceof UnionCodec) return codec.codecs;

			return codec;
		}) as Codecs;
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
