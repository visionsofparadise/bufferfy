import { Context } from "../../utilities/Context";
import { AbstractCodec } from "../Abstract";
import { DecodeTransform } from "../Abstract/DecodeTransform";

export interface TransformCodecOptions<Source, Target> {
	encode: (source: Source) => Target;
	decode: (target: Target) => Source;
}

/**
 * Creates a codec wrapper that transforms from source type to target type
 *
 * Serializes to ```[VALUE]```
 *
 * Uses the wrapped codecs serialization.
 *
 * @param	{AbstractCodec} targetCodec - The wrapped codec.
 * @param	{TransformCodecOptions} options
 * @param	{(source) => target} options.encode - Function that transforms from source to target.
 * @param	{(target, buffer) => source} options.decode - Function that transforms from target to source.
 * @return	{TransformCodec} TransformCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Transform/index.ts|Source}
 */
export const createTransformCodec = <Source, Target>(targetCodec: AbstractCodec<Target>, options: TransformCodecOptions<Source, Target>) => new TransformCodec(targetCodec, options);

export class TransformCodec<Source, Target> extends AbstractCodec<Source> {
	private readonly _encodeSource: (source: Source) => Target;
	private readonly _decodeTarget: (target: Target) => Source;

	constructor(public readonly targetCodec: AbstractCodec<Target>, options: TransformCodecOptions<Source, Target>) {
		super();

		this._encodeSource = options.encode;
		this._decodeTarget = options.decode;
	}

	isValid(value: unknown): value is Source {
		try {
			const isValid = this.targetCodec.isValid(this._encodeSource(value as any));

			return isValid;
		} catch (error) {
			return false;
		}
	}

	byteLength(value: Source): number {
		return this.targetCodec.byteLength(this._encodeSource(value));
	}

	_encode(value: Source, buffer: Buffer, c: Context): void {
		return this.targetCodec._encode(this._encodeSource(value), buffer, c);
	}

	_decode(buffer: Buffer, c: Context): Source {
		const targetValue = this.targetCodec._decode(buffer, c);

		return this._decodeTarget(targetValue);
	}

	async _decodeChunks(transform: DecodeTransform): Promise<Source> {
		const targetValue = await this.targetCodec._decodeChunks(transform);

		return this._decodeTarget(targetValue);
	}
}
