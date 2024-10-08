import { Context } from "../../utilities/Context";
import { AbstractCodec, CodecType } from "../Abstract";
import { DecodeTransform } from "../Abstract/DecodeTransform";
import { EncodeTransform } from "../Abstract/EncodeTransform";
import { ConstantCodec } from "../Constant";
import { UnionCodec } from "../Union";

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
export function createObjectCodec<Properties extends Record<string, AbstractCodec>>(properties: Properties): ObjectCodec<Properties> {
	return new ObjectCodec<Properties>(properties);
}

type RequiredKeys<T extends Record<string | number, AbstractCodec<any>>> = {
	[K in keyof T]: T[K] extends UnionCodec<[AbstractCodec, ConstantCodec<undefined>]> ? undefined : K;
}[keyof T];

type OptionalKeys<T extends Record<string | number, AbstractCodec<any>>> = {
	[K in keyof T]: T[K] extends UnionCodec<[AbstractCodec, ConstantCodec<undefined>]> ? K : undefined;
}[keyof T];

type _OutputObject<T extends Record<string | number, AbstractCodec<any>>> = {
	[K in Exclude<RequiredKeys<T>, undefined>]: CodecType<T[K]>;
} & {
	[K in Exclude<OptionalKeys<T>, undefined>]?: CodecType<T[K]>;
};

type OutputObject<T extends Record<string | number, AbstractCodec<any>>> = {
	[K in keyof _OutputObject<T>]: _OutputObject<T>[K];
};

export class ObjectCodec<Properties extends Record<string, AbstractCodec>> extends AbstractCodec<OutputObject<Properties>> {
	entries: Array<[keyof Properties, AbstractCodec]>;

	constructor(public readonly properties: Properties) {
		super();

		this.entries = Object.entries(properties);
	}

	isValid(value: unknown): value is OutputObject<Properties> {
		if (typeof value !== "object" || value === null) return false;

		for (const [key, codec] of this.entries) if (!codec.isValid(value[key as keyof typeof value])) return false;

		return true;
	}

	byteLength(value: OutputObject<Properties>): number {
		let byteLength = 0;

		for (const [key, codec] of this.entries) byteLength += codec.byteLength(value[key as keyof OutputObject<Properties>]);

		return byteLength;
	}

	_encode(value: OutputObject<Properties>, buffer: Buffer, c: Context): void {
		for (const [key, codec] of this.entries) codec._encode(value[key as keyof OutputObject<Properties>], buffer, c);
	}

	async _encodeChunks(value: OutputObject<Properties>, transform: EncodeTransform): Promise<void> {
		for (const [key, codec] of this.entries) await codec._encodeChunks(value[key as keyof OutputObject<Properties>], transform);
	}

	_decode(buffer: Buffer, c: Context): OutputObject<Properties> {
		const value: Partial<Record<keyof OutputObject<Properties>, unknown>> = {};

		for (const [key, codec] of this.entries) value[key as keyof OutputObject<Properties>] = codec._decode(buffer, c);

		return value as OutputObject<Properties>;
	}

	async _decodeChunks(transform: DecodeTransform): Promise<OutputObject<Properties>> {
		const value: Partial<Record<keyof OutputObject<Properties>, unknown>> = {};

		for (const [key, codec] of this.entries) value[key as keyof OutputObject<Properties>] = await codec._decodeChunks(transform);

		return value as OutputObject<Properties>;
	}
}
