import { OBJECT_MATCHER, type CodecMatcher } from "../../utilities/matcher";
import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";
import { AbstractCodec, type CodecType } from "../Abstract";
import { OptionalCodec } from "../Union";

/**
 * Creates a codec for a fixed object.
 *
 * Serializes to ```[...[PROPERTY_VALUES]]```
 *
 * Encodes each property value with the codec associated with that key.
 *
 * @param	{Record<string, AbstractCodec>} properties - Properties of the object.
 * @return	{ObjectCodec} ObjectCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Object/index.ts|Source}
 */
export const createObjectCodec = <Properties extends Record<string, AbstractCodec>>(properties: Properties): ObjectCodec<Properties> => new ObjectCodec<Properties>(properties);

type OutputObject<T extends Record<string, AbstractCodec>> = {
	[K in keyof T as T[K] extends OptionalCodec<any> ? never : K]: CodecType<T[K]>;
} & {
	[K in keyof T as T[K] extends OptionalCodec<any> ? K : never]?: T[K] extends OptionalCodec<infer V> ? V : never;
};

export class ObjectCodec<Properties extends Record<string, AbstractCodec>> extends AbstractCodec<OutputObject<Properties>> {
	entries: Array<[keyof Properties, AbstractCodec]>;

	private readonly _plan: Array<{ key: keyof Properties; codec: AbstractCodec; isOptional: boolean }>;

	constructor(public readonly properties: Properties) {
		super();

		this.entries = Object.entries(properties);

		this._plan = this.entries.map(([key, codec]) => ({ key, codec, isOptional: codec instanceof OptionalCodec }));
	}

	isValid(value: unknown): value is OutputObject<Properties> {
		if (typeof value !== "object" || value === null) return false;

		for (let index = 0; index < this._plan.length; index++) {
			const { key, codec, isOptional } = this._plan[index];

			if (isOptional && !(key in value)) continue;

			if (!codec.isValid((value as any)[key])) return false;
		}

		return true;
	}

	override get matcher(): CodecMatcher {
		return OBJECT_MATCHER;
	}

	byteLength(value: OutputObject<Properties>): number {
		let byteLength = 0;

		for (let index = 0; index < this._plan.length; index++) {
			const { key, codec } = this._plan[index];

			byteLength += codec.byteLength((value as any)[key]);
		}

		return byteLength;
	}

	_encode(value: OutputObject<Properties>, writer: Writer): void {
		for (let index = 0; index < this._plan.length; index++) {
			const { key, codec } = this._plan[index];

			codec._encode((value as any)[key], writer);
		}
	}

	_decode(reader: Reader): OutputObject<Properties> {
		const value = {} as any;

		for (let index = 0; index < this._plan.length; index++) {
			const { key, codec, isOptional } = this._plan[index];

			const decoded = codec._decode(reader);

			if (!(isOptional && decoded === undefined)) {
				value[key] = decoded;
			}
		}

		return value as OutputObject<Properties>;
	}
}
