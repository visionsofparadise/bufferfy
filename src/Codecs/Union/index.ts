import { BufferfyError, BufferfyRangeError } from "../../utilities/Error";
import { TAG_OVERLAP, type CodecMatcher } from "../../utilities/matcher";
import { AbstractCodec, type CodecType } from "../Abstract";
import { ConstantCodec } from "../Constant";
import { VarInt60Codec } from "../VarInt/VarInt60";
import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";

/**
 * Creates a codec for one of many types of value. Useful for optional/nullable values and discriminated unions.
 *
 * Serializes to ```[CODEC_INDEX][VALUE]```
 *
 * **Order matters:** Codecs are tested sequentially. First match wins. Place specific codecs before general ones, `AnyCodec` last.
 *
 * **Flattening:** Use `.flatten()` to merge nested unions into a single level for space efficiency.
 *
 * - **Without flattening:** Nested unions encode as `[parentIndex][childIndex][value]` (2+ bytes overhead)
 * - **With flattening:** Child codecs are merged: `[flatIndex][value]` (1 byte overhead)
 * - **Space savings:** 1 byte per flattened level
 *
 * @example
 * ```ts
 * // Correct: specific → general
 * Codec.Union([Codec.Constant("active"), Codec.String(), Codec.Any()])
 *
 * // Wrong: Any() matches everything, shadows rest
 * Codec.Union([Codec.Any(), Codec.String()])
 *
 * // Flattening example
 * const inner = Codec.Union([A, B]);
 * const outer = Codec.Union([inner, C]);
 * const flat = outer.flatten(); // Explicitly flatten to Union([A, B, C])
 * // Result: Union([A, B, C]) - saves 1 byte per nested level
 * ```
 *
 * @param	{Array<AbstractCodec>} codecs - An array of codecs for possible value types.
 * @param 	{AbstractCodec<number>} [indexCodec="VarInt60Codec()"] - Codec for the index value.
 * @return	{UnionCodec} UnionCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Union/index.ts|Source}
 */
export const createUnionCodec = <const Codecs extends Array<AbstractCodec<any>>>(
	codecs: Codecs,
	indexCodec: AbstractCodec<number> = new VarInt60Codec(),
) => new UnionCodec(codecs, indexCodec);

export class UnionCodec<const Codecs extends Array<AbstractCodec<any>>> extends AbstractCodec<
	CodecType<Codecs[number]>
> {
	codecs: Codecs;

	private readonly _matchers: Array<CodecMatcher>;
	private readonly _sufficient: Array<boolean>;

	protected _undefinedFastPath = false;

	constructor(
		codecs: Codecs,
		public readonly indexCodec: AbstractCodec<number> = new VarInt60Codec(),
	) {
		super();
		this.codecs = codecs;
		this._matchers = codecs.map((codec) => codec.matcher);

		this._sufficient = this._matchers.map((matcher, index) => {
			if (matcher.exact || matcher.testTag === "any") return false;

			for (let laterIndex = index + 1; laterIndex < this._matchers.length; laterIndex++) {
				const later = this._matchers[laterIndex];

				if (later.acceptTag === "any" || TAG_OVERLAP[matcher.testTag].includes(later.acceptTag)) return false;
			}

			return true;
		});
	}

	/**
	 * Returns a new union codec with all nested unions flattened into a single level.
	 *
	 * Flattening saves 1 byte per level by merging nested union indices into a single index.
	 * - Without flattening: `[parentIndex][childIndex][value]` (2+ bytes overhead)
	 * - With flattening: `[flatIndex][value]` (1 byte overhead)
	 *
	 * @example
	 * ```ts
	 * const inner = Codec.Union([Codec.String(), Codec.UInt(8)]);
	 * const outer = Codec.Union([inner, Codec.Boolean]);
	 *
	 * // Nested encoding (2 bytes overhead for inner union values)
	 * outer.encode("hello"); // [0][0][...hello bytes]
	 *
	 * // Flattened encoding (1 byte overhead)
	 * const flat = outer.flatten();
	 * flat.encode("hello"); // [0][...hello bytes]
	 * ```
	 *
	 * @return {UnionCodec} A new union codec with nested unions flattened
	 */
	flatten(): UnionCodec<Codecs> {
		const flattened = this.codecs.flatMap((codec): Codecs | Codecs[number] => {
			if (codec instanceof UnionCodec) return codec.codecs;

			return codec;
		});

		return new UnionCodec(flattened as Codecs, this.indexCodec);
	}

	isValid(value: unknown): value is CodecType<Codecs[number]> {
		for (let index = 0; index < this.codecs.length; index++) {
			const matcher = this._matchers[index];

			if (matcher.test(value) && (matcher.exact || this.codecs[index].isValid(value))) return true;
		}

		return false;
	}

	byteLength(value: CodecType<Codecs[number]>): number {
		if (this._undefinedFastPath) {
			const index = value === undefined ? 1 : 0;

			return this.indexCodec.byteLength(index) + this.codecs[index].byteLength(value);
		}

		for (let index = 0; index < this.codecs.length; index++) {
			const matcher = this._matchers[index];

			if (matcher.test(value) && (matcher.exact || this._sufficient[index] || this.codecs[index].isValid(value)))
				return this.indexCodec.byteLength(index) + this.codecs[index].byteLength(value);
		}

		throw new BufferfyError("Value does not match any codec");
	}

	_encode(value: CodecType<Codecs[number]>, writer: Writer): void {
		if (this._undefinedFastPath) {
			const index = value === undefined ? 1 : 0;

			this.indexCodec._encode(index, writer);
			this.codecs[index]._encode(value, writer);

			return;
		}

		for (let index = 0; index < this.codecs.length; index++) {
			const matcher = this._matchers[index];

			if (matcher.test(value) && (matcher.exact || this._sufficient[index] || this.codecs[index].isValid(value))) {
				this.indexCodec._encode(index, writer);
				this.codecs[index]._encode(value, writer);

				return;
			}
		}

		throw new BufferfyError("Value does not match any codec");
	}

	_decode(reader: Reader): CodecType<Codecs[number]> {
		const index = this.indexCodec._decode(reader);

		if (index < 0 || index >= this.codecs.length) {
			throw new BufferfyRangeError(
				`Union codec index ${index} out of bounds (0-${this.codecs.length - 1})`,
				"UnionCodec",
				index,
				this.codecs.length - 1,
				reader.position,
			);
		}

		return this.codecs[index]._decode(reader);
	}
}

/**
 * Creates a codec for an optional value.
 *
 * When used in an ObjectCodec, makes the key optional (can be absent).
 * The value type is the inner codec type, not including undefined.
 *
 * Internally creates `Union([valueCodec, Constant(undefined)])`.
 * If `valueCodec` is a union, the result is automatically flattened for space efficiency.
 *
 * @example
 * ```ts
 * // Basic optional value
 * const optional = Codec.Optional(Codec.String());
 * // Type: string | undefined
 *
 * // Optional with nested union - automatically flattened
 * const inner = Codec.Union([Codec.String(), Codec.UInt(8)]);
 * const optional = Codec.Optional(inner);
 * // Result: Union([String, UInt8, Undefined]) - inner is flattened
 * // Saves 1 byte per value compared to nested encoding
 * ```
 *
 * @param	{AbstractCodec<Value>} valueCodec - Codec for the value when present.
 * @return	{OptionalCodec<Value>} OptionalCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Union/index.ts|Source}
 */
export const createOptionalCodec = <Value>(valueCodec: AbstractCodec<Value>): OptionalCodec<Value> =>
	new OptionalCodec(valueCodec);

export class OptionalCodec<Value> extends UnionCodec<[AbstractCodec<Value>, ConstantCodec<undefined>]> {
	constructor(public readonly valueCodec: AbstractCodec<Value>) {
		const union = new UnionCodec([valueCodec, new ConstantCodec(undefined)], new VarInt60Codec());
		const flattened = valueCodec instanceof UnionCodec ? union.flatten() : union;
		const codecCount: number = flattened.codecs.length;

		super(flattened.codecs, flattened.indexCodec);

		this._undefinedFastPath = codecCount === 2;
	}
}
