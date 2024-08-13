import { Context } from "../../utilities/Context";
import { PointableOptions } from "../../utilities/Pointable";
import { Stream } from "../../utilities/Stream";
import { AbstractCodec } from "../Abstract";

export interface TupleCodecOptions extends PointableOptions {}

export class TupleCodec<Tuple extends [...any[]]> extends AbstractCodec<Tuple> {
	private _reverseCodecs: [
		...{
			[Index in keyof Tuple]: AbstractCodec<Tuple[Index]>;
		}
	];

	constructor(
		codecs: [
			...{
				[Index in keyof Tuple]: AbstractCodec<Tuple[Index]>;
			}
		],
		options?: TupleCodecOptions
	) {
		super();

		this._id = options?.id;
		this._reverseCodecs = codecs;
		this._reverseCodecs.reverse();
	}

	match(value: any, context: Context): value is Tuple {
		if (!Array.isArray(value)) return false;

		let index = this._reverseCodecs.length;

		while (index--) if (!this._reverseCodecs[index].match(value[this._reverseCodecs.length - (index + 1)], context)) return false;

		this.setContext(value as any, context);

		return true;
	}

	encodingLength(value: Tuple, context: Context): number {
		this.setContext(value, context);

		let size = 0;
		let index = this._reverseCodecs.length;

		while (index--) size += this._reverseCodecs[index].encodingLength(value[this._reverseCodecs.length - (index + 1)], context);

		return size;
	}

	write(value: Tuple, stream: Stream, context: Context): void {
		this.setContext(value, context);

		let index = this._reverseCodecs.length;

		while (index--) this._reverseCodecs[index].write(value[this._reverseCodecs.length - (index + 1)], stream, context);
	}

	read(stream: Stream, context: Context): Tuple {
		let value: Array<any> = [];
		let index = this._reverseCodecs.length;

		while (index--) value.push(this._reverseCodecs[index].read(stream, context));

		this.setContext(value as Tuple, context);

		return value as Tuple;
	}
}

export function createTupleCodec<Tuple extends [...any[]]>(...parameters: ConstructorParameters<typeof TupleCodec<Tuple>>) {
	return new TupleCodec<Tuple>(...parameters);
}
