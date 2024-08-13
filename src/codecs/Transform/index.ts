import { Context } from "../../utilities/Context";
import { PointableOptions } from "../../utilities/Pointable";
import { Stream } from "../../utilities/Stream";
import { AbstractCodec } from "../Abstract";

export interface TransformCodecOptions<S, T> extends PointableOptions {
	transform: (value: T) => S;
	untransform: (value: S) => T;
}

export class TransformCodec<Source extends any, Target extends any> extends AbstractCodec<Source> {
	private readonly _transform: (value: Target) => Source;
	private readonly _untransform: (value: Source) => Target;

	constructor(private readonly codec: AbstractCodec<Target>, options: TransformCodecOptions<Source, Target>) {
		super();

		this._id = options.id;
		this._transform = options.transform;
		this._untransform = options.untransform;
	}

	match(value: any, context: Context): value is Source {
		try {
			const isMatch = this.codec.match(this._untransform(value), context);

			if (isMatch) this.setContext(value, context);

			return isMatch;
		} catch (error) {
			return false;
		}
	}

	encodingLength(value: Source, context: Context): number {
		this.setContext(value, context);

		return this.codec.encodingLength(this._untransform(value), context);
	}

	write(value: Source, stream: Stream, context: Context): void {
		this.setContext(value, context);

		return this.codec.write(this._untransform(value), stream, context);
	}

	read(stream: Stream, context: Context): Source {
		const value = this._transform(this.codec.read(stream, context));

		this.setContext(value, context);

		return value;
	}
}

export const createTransformCodec = <Source extends any, Target extends any>(...parameters: ConstructorParameters<typeof TransformCodec<Source, Target>>) => {
	return new TransformCodec<Source, Target>(...parameters);
};
