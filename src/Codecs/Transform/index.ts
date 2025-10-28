import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";

export interface TransformCodecOptions<Source, Target> {
	isValid?: (source: unknown) => boolean;
	encode: (source: Source) => Target;
	decode: (target: Target, buffer: Uint8Array) => Source;
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
 * @param	{(value) => boolean} [options.isValid=targetCodec.isValid] - Function that returns true if the input is a valid source type.
 * @param	{(source) => target} options.encode - Function that transforms from source to target.
 * @param	{(target, buffer) => source} options.decode - Function that transforms from target to source.
 * @return	{TransformCodec} TransformCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Transform/index.ts|Source}
 */
export const createTransformCodec = <Source, Target>(targetCodec: AbstractCodec<Target>, options: TransformCodecOptions<Source, Target>) => new TransformCodec(targetCodec, options);

export class TransformCodec<Source, Target> extends AbstractCodec<Source> {
	private readonly _isSourceValid: (value: unknown) => boolean;
	private readonly _encodeSource: (source: Source) => Target;
	private readonly _decodeTarget: (target: Target, buffer: Uint8Array) => Source;

	constructor(public readonly targetCodec: AbstractCodec<Target>, options: TransformCodecOptions<Source, Target>) {
		super();

		this._isSourceValid = options.isValid || ((value: unknown) => targetCodec.isValid(options.encode(value as any)));
		this._encodeSource = options.encode;
		this._decodeTarget = options.decode;
	}

	isValid(value: unknown): value is Source {
		try {
			const isValid = this._isSourceValid(value);

			return isValid;
		} catch (error) {
			return false;
		}
	}

	byteLength(value: Source): number {
		return this.targetCodec.byteLength(this._encodeSource(value));
	}

	_encode(value: Source, writer: Writer): void {
		return this.targetCodec._encode(this._encodeSource(value), writer);
	}

	_decode(reader: Reader): Source {
		const prePosition = reader.position;

		const targetValue = this.targetCodec._decode(reader);

		const postPosition = reader.position;

		const targetBuffer = reader.peekBytes(prePosition, postPosition);

		return this._decodeTarget(targetValue, targetBuffer);
	}
}
