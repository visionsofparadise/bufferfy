import { Context } from "../../utilities/Context";
import { BufferfyError } from "../../utilities/Error";
import { Stream } from "../../utilities/Stream";
import { AbstractCodec } from "../Abstract";

export class PointerCodec<Value extends unknown> extends AbstractCodec<Value> {
	private readonly _targetId: string;

	constructor(targetId: string) {
		super();

		this._targetId = targetId;
	}

	getCodec(context: Context): AbstractCodec<Value> {
		const codec = context.codecs[this._targetId];

		if (!codec) throw new BufferfyError("Invalid pointer.");

		return codec;
	}

	getValue(context: Context): Value {
		return context.values[this._targetId];
	}

	match(value: any, context: Context): value is Value {
		return this.getCodec(context).match(value, context);
	}

	encodingLength(value: Value, context: Context = new Context()): number {
		return this.getCodec(context).encodingLength(value, context);
	}

	write(value: Value, stream: Stream, context: Context): void {
		return this.getCodec(context).write(value, stream, context);
	}

	read(stream: Stream, context: Context): Value {
		return this.getCodec(context).read(stream, context);
	}
}

export function createPointerCodec<Value extends unknown>(...parameters: ConstructorParameters<typeof PointerCodec<Value>>) {
	return new PointerCodec<Value>(...parameters);
}
