import { Context } from "../../utilities/Context";
import { PointableOptions } from "../../utilities/Pointable";
import { Stream } from "../../utilities/Stream";
import { AbstractCodec } from "../Abstract";

export interface TransformCodecOptions<Source, Target> extends PointableOptions {
	encode: (source: Source) => Target;
	decode: (target: Target, buffer: Buffer) => Source;
}

export class TransformCodec<Source, Target> extends AbstractCodec<Source> {
	private readonly _encode: (source: Source) => Target;
	private readonly _decode: (target: Target, buffer: Buffer) => Source;

	constructor(private readonly targetCodec: AbstractCodec<Target>, options: TransformCodecOptions<Source, Target>) {
		super();

		this._id = options.id;
		this._encode = options.encode;
		this._decode = options.decode;
	}

	match(value: any, context: Context): value is Source {
		try {
			const isMatch = this.targetCodec.match(this._encode(value), context);

			if (isMatch) this.setContext(value, context);

			return isMatch;
		} catch (error) {
			return false;
		}
	}

	encodingLength(value: Source, context: Context = new Context()): number {
		this.setContext(value, context);

		return this.targetCodec.encodingLength(this._encode(value), context);
	}

	write(value: Source, stream: Stream, context: Context): void {
		this.setContext(value, context);

		return this.targetCodec.write(this._encode(value), stream, context);
	}

	read(stream: Stream, context: Context): Source {
		const initialPosition = stream.position;

		const targetValue = this.targetCodec.read(stream, context);

		const buffer = stream.buffer.subarray(initialPosition, stream.position);

		const value = this._decode(targetValue, buffer);

		this.setContext(value, context);

		return value;
	}
}

export function createTransformCodec<Source extends any, Target extends any>(...parameters: ConstructorParameters<typeof TransformCodec<Source, Target>>) {
	return new TransformCodec<Source, Target>(...parameters);
}
