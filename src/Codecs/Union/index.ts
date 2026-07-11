import { BufferfyError, BufferfyRangeError } from "../../utilities/Error";
import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec, CodecType } from "../Abstract";
import { ArrayFixedCodec } from "../Array/Fixed";
import { ArrayVariableCodec } from "../Array/Variable";
import { BigUIntBECodec } from "../BigUInt";
import { BooleanCodec } from "../Boolean";
import { BytesFixedCodec } from "../Bytes/Fixed";
import { BytesVariableCodec } from "../Bytes/Variable";
import { ConstantCodec } from "../Constant";
import { Float32BECodec, Float64BECodec } from "../Float";
import { Int16Codec, Int24Codec, Int32Codec, Int40Codec, Int48Codec, Int8Codec } from "../Int";
import { ObjectCodec } from "../Object";
import { RecordFixedCodec } from "../Record/Fixed";
import { RecordVariableCodec } from "../Record/Variable";
import { StringFixedCodec } from "../String/Fixed";
import { StringVariableCodec } from "../String/Variable";
import { TupleCodec } from "../Tuple";
import { UInt16Codec, UInt24Codec, UInt32Codec, UInt40Codec, UInt48Codec, UInt8Codec } from "../UInt";
import { VarInt15Codec } from "../VarInt/VarInt15";
import { VarInt30Codec } from "../VarInt/VarInt30";
import { VarInt60Codec } from "../VarInt/VarInt60";

type DomainTag = "boolean" | "string" | "number" | "bigint" | "bytes" | "array" | "object" | "any";

interface UnionMatcher {
	test: (value: unknown) => boolean;
	exact: boolean;
	// The domain the `test` predicate accepts. Used to compute `sufficient`, and read as a later branch's
	// accept-domain (identical to the test domain for every non-constant codec class; constant branches are
	// checked directly by value, so their `testTag` is unused).
	testTag: DomainTag;
	// True when passing `test` is enough to select this branch among VALID values: no later branch overlaps
	// this branch's test domain, so skipping `isValid` cannot misroute a value that belongs to a later branch.
	// Computed in the UnionCodec constructor; only ever true for non-exact matchers.
	sufficient: boolean;
}

// testTag → the accept-domains that overlap it. The object relations are symmetric: a `typeof === "object"`
// test passes for arrays and Uint8Arrays, and the object-accepting codecs (Object/Record — their `isValid`
// gates only on `typeof === "object" && !== null`, e.g. `Record(String, String).isValid(["x"])` is true) accept
// arrays and Uint8Arrays too. `any` overlaps every domain (handled directly in `conflictsWithLater`).
const ACCEPT_OVERLAP: Record<DomainTag, ReadonlyArray<DomainTag>> = {
	boolean: ["boolean"],
	string: ["string"],
	number: ["number"],
	bigint: ["bigint"],
	bytes: ["bytes", "object"],
	array: ["array", "object"],
	object: ["object", "array", "bytes"],
	any: ["boolean", "string", "number", "bigint", "bytes", "array", "object", "any"],
};

/**
 * Derives a pre-filter for a union branch from its codec class. The predicate is a NECESSARY condition
 * for that codec's `isValid`, so a failed pre-filter only skips an `isValid` that would have returned false;
 * selection outcomes are unchanged. `exact: true` means the predicate is the whole of `isValid`, so the
 * `isValid` call is skipped entirely on a match. `testTag` records the predicate's domain (see `UnionMatcher`).
 * DeepConstantCodec (extends ConstantCodec, uses deepEqual) is deliberately excluded from the exact `===`
 * matcher and gets the fallback (`testTag: "any"`, no pre-filter); only its *value* is consulted, when
 * checking whether it conflicts with an earlier branch's sufficiency.
 */
const buildUnionMatcher = (codec: AbstractCodec<any>): UnionMatcher => {
	if (codec.constructor === ConstantCodec) {
		const constant = (codec as ConstantCodec<unknown>).value;

		return { test: (value) => value === constant, exact: true, testTag: "any", sufficient: false };
	}

	if (codec instanceof BooleanCodec) return { test: (value) => typeof value === "boolean", exact: true, testTag: "boolean", sufficient: false };

	if (codec instanceof StringFixedCodec || codec instanceof StringVariableCodec) return { test: (value) => typeof value === "string", exact: true, testTag: "string", sufficient: false };

	if (
		codec instanceof UInt8Codec ||
		codec instanceof UInt16Codec ||
		codec instanceof UInt24Codec ||
		codec instanceof UInt32Codec ||
		codec instanceof UInt40Codec ||
		codec instanceof UInt48Codec ||
		codec instanceof Int8Codec ||
		codec instanceof Int16Codec ||
		codec instanceof Int24Codec ||
		codec instanceof Int32Codec ||
		codec instanceof Int40Codec ||
		codec instanceof Int48Codec ||
		codec instanceof Float32BECodec ||
		codec instanceof Float64BECodec ||
		codec instanceof VarInt15Codec ||
		codec instanceof VarInt30Codec ||
		codec instanceof VarInt60Codec
	)
		return { test: (value) => typeof value === "number", exact: false, testTag: "number", sufficient: false };

	if (codec instanceof BigUIntBECodec) return { test: (value) => typeof value === "bigint", exact: false, testTag: "bigint", sufficient: false };

	if (codec instanceof BytesFixedCodec || codec instanceof BytesVariableCodec) return { test: (value) => value instanceof Uint8Array, exact: false, testTag: "bytes", sufficient: false };

	if (codec instanceof ArrayFixedCodec || codec instanceof ArrayVariableCodec || codec instanceof TupleCodec) return { test: (value) => Array.isArray(value), exact: false, testTag: "array", sufficient: false };

	if (codec instanceof ObjectCodec || codec instanceof RecordFixedCodec || codec instanceof RecordVariableCodec) return { test: (value) => typeof value === "object" && value !== null, exact: false, testTag: "object", sufficient: false };

	return { test: () => true, exact: false, testTag: "any", sufficient: false };
};

/**
 * Whether `laterCodec` (appearing after the branch with matcher `earlier`) can accept any value that passes
 * `earlier.test`. If so, `earlier` cannot skip its `isValid` — a value in `earlier`'s test domain might
 * legitimately belong to `laterCodec`. Constant branches are checked directly against their value (so an
 * object test does not conflict with `Null`, but does with `DeepConstant({...})`); all others by domain overlap.
 */
const conflictsWithLater = (earlier: UnionMatcher, laterCodec: AbstractCodec<any>, laterMatcher: UnionMatcher): boolean => {
	if (laterCodec instanceof ConstantCodec) return earlier.test((laterCodec as ConstantCodec<unknown>).value);

	return laterMatcher.testTag === "any" || ACCEPT_OVERLAP[earlier.testTag].includes(laterMatcher.testTag);
};

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
export const createUnionCodec = <const Codecs extends Array<AbstractCodec<any>>>(codecs: Codecs, indexCodec: AbstractCodec<number> = new VarInt60Codec()) => new UnionCodec(codecs, indexCodec);

export class UnionCodec<const Codecs extends Array<AbstractCodec<any>>> extends AbstractCodec<CodecType<Codecs[number]>> {
	codecs: Codecs;

	private readonly _matchers: Array<UnionMatcher>;

	// Set by OptionalCodec: selects the branch by a single `value === undefined` check. Never enabled when it could change the wire format.
	protected _undefinedFastPath: boolean = false;

	constructor(codecs: Codecs, public readonly indexCodec: AbstractCodec<number> = new VarInt60Codec()) {
		super();
		this.codecs = codecs;
		this._matchers = codecs.map(buildUnionMatcher);

		// A non-exact matcher may skip its `isValid` in encode/byteLength selection iff no later branch can accept
		// any value passing its `test`. Then, among valid values, the shallow test uniquely selects this branch;
		// an invalid value passing it is invalid for the whole union (garbage-in-garbage-out per encode()'s contract).
		for (let i = 0; i < this._matchers.length; i++) {
			const matcher = this._matchers[i];

			// Exact matchers already skip `isValid`; the fallback (testTag "any") overlaps every later branch. Neither can be sufficient.
			if (matcher.exact || matcher.testTag === "any") continue;

			let sufficient = true;

			for (let j = i + 1; j < this.codecs.length; j++) {
				if (conflictsWithLater(matcher, this.codecs[j], this._matchers[j])) {
					sufficient = false;

					break;
				}
			}

			matcher.sufficient = sufficient;
		}
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
		for (let i = 0; i < this.codecs.length; i++) {
			const matcher = this._matchers[i];

			if (matcher.test(value) && (matcher.exact || this.codecs[i].isValid(value))) return true;
		}

		return false;
	}

	byteLength(value: CodecType<Codecs[number]>): number {
		if (this._undefinedFastPath) {
			const index = value === undefined ? 1 : 0;

			return this.indexCodec.byteLength(index) + this.codecs[index].byteLength(value);
		}

		for (let i = 0; i < this.codecs.length; i++) {
			const matcher = this._matchers[i];

			if (matcher.test(value) && (matcher.exact || matcher.sufficient || this.codecs[i].isValid(value))) return this.indexCodec.byteLength(i) + this.codecs[i].byteLength(value);
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

		for (let i = 0; i < this.codecs.length; i++) {
			const matcher = this._matchers[i];

			if (matcher.test(value) && (matcher.exact || matcher.sufficient || this.codecs[i].isValid(value))) {
				this.indexCodec._encode(i, writer);
				this.codecs[i]._encode(value, writer);

				return;
			}
		}

		throw new BufferfyError("Value does not match any codec");
	}

	_decode(reader: Reader): CodecType<Codecs[number]> {
		const index = this.indexCodec._decode(reader);

		// Bounds check the decoded index
		if (index < 0 || index >= this.codecs.length) {
			throw new BufferfyRangeError(`Union codec index ${index} out of bounds (0-${this.codecs.length - 1})`, "UnionCodec", index, this.codecs.length - 1, reader.position);
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
export const createOptionalCodec = <Value>(valueCodec: AbstractCodec<Value>): OptionalCodec<Value> => {
	return new OptionalCodec(valueCodec);
};

export class OptionalCodec<Value> extends UnionCodec<[AbstractCodec<Value>, ConstantCodec<undefined>]> {
	constructor(public readonly valueCodec: AbstractCodec<Value>) {
		// Create union and automatically flatten if valueCodec is a union
		const union = new UnionCodec([valueCodec, new ConstantCodec(undefined)], new VarInt60Codec());
		const flattened = valueCodec instanceof UnionCodec ? union.flatten() : union;

		// Copy flattened codecs and indexCodec to this instance
		super(flattened.codecs as any, flattened.indexCodec);

		// Fast path only when it cannot change the wire format: exactly [valueCodec, Constant(undefined)] and the
		// value branch rejects undefined (so `undefined` unambiguously selects index 1, everything else index 0 via codecs[0]).
		this._undefinedFastPath = this.codecs.length === 2 && !this.codecs[0].isValid(undefined);
	}
}
