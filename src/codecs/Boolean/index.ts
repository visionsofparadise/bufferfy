import { Context } from "../../utilities/Context";
import { PointableOptions } from "../../utilities/Pointable";
import { Stream } from "../../utilities/Stream";
import { AbstractCodec } from "../Abstract";

export interface BooleanCodecOptions extends PointableOptions {}

export class BooleanCodec extends AbstractCodec<boolean> {
	constructor(options?: BooleanCodecOptions) {
		super();

		this._id = options?.id;
	}

	match(value: any, context: Context = new Context()): value is boolean {
		const isMatch = typeof value === "boolean";

		if (isMatch) this.setContext(value, context);

		return isMatch;
	}

	encodingLength(value: boolean, context: Context = new Context()): number {
		this.setContext(value, context);

		return 1;
	}

	write(value: boolean, stream: Stream, context: Context = new Context()): void {
		this.setContext(value, context);

		stream.buffer[stream.position++] = value ? 0x01 : 0x00;
	}

	read(stream: Stream, context: Context = new Context()): boolean {
		switch (stream.buffer[stream.position++]) {
			case 0x01:
				this.setContext(true, context);
				return true;
			case 0x00:
				this.setContext(false, context);
				return false;
			default:
				this.setContext(false, context);
				return false;
		}
	}
}

export function createBooleanCodec(...parameters: ConstructorParameters<typeof BooleanCodec>): BooleanCodec {
	return new BooleanCodec(...parameters);
}
