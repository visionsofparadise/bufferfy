import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec, CodecType } from "../Abstract";
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
export const createObjectCodec = <Properties extends Record<string, AbstractCodec>>(properties: Properties): ObjectCodec<Properties> => {
	return new ObjectCodec<Properties>(properties);
};

/**
 * Infers the output object type from codec properties using a single unified type helper.
 * Splits required and optional properties based on OptionalCodec usage.
 */
type OutputObject<T extends Record<string, AbstractCodec>> = {
	[K in keyof T as T[K] extends OptionalCodec<any> ? never : K]: CodecType<T[K]>;
} & {
	[K in keyof T as T[K] extends OptionalCodec<any> ? K : never]?: T[K] extends OptionalCodec<infer V> ? V : never;
};

export class ObjectCodec<Properties extends Record<string, AbstractCodec>> extends AbstractCodec<OutputObject<Properties>> {
	entries: Array<[keyof Properties, AbstractCodec]>;

	constructor(public readonly properties: Properties) {
		super();

		this.entries = Object.entries(properties);
	}

	isValid(value: unknown): value is OutputObject<Properties> {
		if (typeof value !== "object" || value === null) return false;

		for (const key in this.properties) {
			const k = key as keyof Properties;
			const codec = this.properties[k];

			// For optional properties, missing key is valid
			if (codec instanceof OptionalCodec) {
				if (!(k in value)) continue;
			}

			if (!codec.isValid(value[k as keyof typeof value])) return false;
		}

		return true;
	}

	byteLength(value: OutputObject<Properties>): number {
		let byteLength = 0;

		for (const key in this.properties) {
			const k = key as keyof Properties;

			byteLength += this.properties[k].byteLength((value as any)[k]);
		}

		return byteLength;
	}

	_encode(value: OutputObject<Properties>, writer: Writer): void {
		for (const key in this.properties) {
			const k = key as keyof Properties;

			this.properties[k]._encode((value as any)[k], writer);
		}
	}

	_decode(reader: Reader): OutputObject<Properties> {
		const value = {} as any;

		for (const key in this.properties) {
			const k = key as keyof Properties;

			const codec = this.properties[k];

			const decoded = codec._decode(reader);

			if (!(codec instanceof OptionalCodec && decoded === undefined)) {
				value[k] = decoded;
			}
		}

		return value as OutputObject<Properties>;
	}
}
