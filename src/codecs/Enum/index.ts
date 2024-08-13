import { Context } from "../../utilities/Context";
import { BufferfyError } from "../../utilities/Error";
import { PointableOptions } from "../../utilities/Pointable";
import { Stream } from "../../utilities/Stream";
import { AbstractCodec } from "../Abstract";
import { UIntCodec } from "../UInt";

export interface EnumCodecOptions extends PointableOptions {
	indexCodec?: UIntCodec;
}

export class EnumCodec<const Value> extends AbstractCodec<Value> {
	private readonly _indexCodec: UIntCodec;

	constructor(public readonly values: Array<Value>, options?: EnumCodecOptions) {
		super();

		this._id = options?.id;
		this._indexCodec = options?.indexCodec || new UIntCodec();
	}

	match(value: any, context: Context): value is Value {
		let index = this.values.length;

		while (index-- && this.values[index] !== value) {}

		if (index < 0) return false;

		this.setContext(value, context);

		return true;
	}

	encodingLength(value: Value, context: Context): number {
		this.setContext(value, context);

		return this._indexCodec.encodingLength(0, context);
	}

	write(value: Value, stream: Stream, context: Context): void {
		this.setContext(value, context);

		let index = this.values.length;

		while (index-- && this.values[index] !== value) {}

		if (index < 0) throw new BufferfyError("Value does not match any enumerated values");

		this._indexCodec.write(index, stream, context);
	}

	read(stream: Stream, context: Context): Value {
		const value = this.values[this._indexCodec.read(stream, context)];

		this.setContext(value, context);

		return value;
	}
}

export function createEnumCodec<const Value>(...parameters: ConstructorParameters<typeof EnumCodec<Value>>) {
	return new EnumCodec<Value>(...parameters);
}
