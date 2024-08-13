import { Context } from "../../utilities/Context";
import { PointableOptions } from "../../utilities/Pointable";
import { Stream } from "../../utilities/Stream";
import { AbstractCodec } from "../Abstract";

export interface ConstantCodecOptions extends PointableOptions {}

export class ConstantCodec<const Value> extends AbstractCodec<Value> {
	constructor(public readonly value: Value, options?: ConstantCodecOptions) {
		super();

		this._id = options?.id;
	}

	match(value: any, context: Context): value is Value {
		const isMatch = value === this.value;

		if (isMatch) this.setContext(value, context);

		return isMatch;
	}

	encodingLength(value: Value, context: Context): number {
		this.setContext(value, context);

		return 0;
	}

	write(value: Value, __: Stream, context: Context): void {
		this.setContext(value, context);
	}

	read(_: Stream, context: Context): Value {
		this.setContext(this.value, context);

		return this.value;
	}
}

export function createConstantCodec<const Value>(...parameters: ConstructorParameters<typeof ConstantCodec<Value>>) {
	return new ConstantCodec<Value>(...parameters);
}
