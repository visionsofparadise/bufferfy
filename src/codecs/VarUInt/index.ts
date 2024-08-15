import { endianness as osEndianness } from "os";
import { Context } from "../../utilities/Context";
import { BufferfyError } from "../../utilities/Error";
import { PointableOptions } from "../../utilities/Pointable";
import { Stream } from "../../utilities/Stream";
import { AbstractCodec } from "../Abstract";
import { Endianness } from "../UInt";

export interface VarUIntCodecOptions extends PointableOptions {}

export class VarUIntCodec extends AbstractCodec<number> {
	private readonly _isLittleEndian: boolean;

	constructor(public readonly endianness: Endianness = osEndianness(), options?: VarUIntCodecOptions) {
		super();

		this._id = options?.id;
		this._isLittleEndian = endianness === "LE";
	}

	match(value: any, context: Context): value is number {
		const isMatch = typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 281474976710656;

		if (isMatch) this.setContext(value, context);

		return isMatch;
	}

	encodingLength(value: number, context: Context = new Context()): number {
		this.setContext(value, context);

		if (value < 253) return 1;
		if (value < 65536) return 3;
		if (value < 4294967296) return 5;
		if (value < 281474976710656) return 7;

		throw new BufferfyError("Integer value to large for VarUInt.");
	}

	write(value: number, stream: Stream, context: Context): void {
		this.setContext(value, context);

		if (value < 253) {
			stream.buffer[stream.position++] = value;

			return;
		}

		if (value < 65536) {
			stream.buffer[stream.position++] = 0xfd;
			stream.view.setUint16(stream.position, value - 0xfd, this._isLittleEndian);

			stream.position += 2;

			return;
		}

		if (value < 4294967296) {
			stream.buffer[stream.position++] = 0xfe;
			stream.view.setUint32(stream.position, value - 0xfe, this._isLittleEndian);

			stream.position += 4;

			return;
		}

		stream.buffer[stream.position++] = 0xff;
		stream.buffer[`writeUInt${this.endianness}`](value - 0xff, stream.position, 6);

		stream.position += 6;

		return;
	}

	read(stream: Stream, context: Context): number {
		const byte0 = stream.buffer[stream.position++];

		if (byte0 < 0xfd) {
			this.setContext(byte0, context);

			return byte0;
		}

		if (byte0 === 0xfd) {
			const value = byte0 + stream.view.getUint16(stream.position, this._isLittleEndian);

			stream.position += 2;

			this.setContext(value, context);

			return value;
		}

		if (byte0 === 0xfe) {
			const value = byte0 + stream.view.getUint32(stream.position, this._isLittleEndian);

			stream.position += 4;

			this.setContext(value, context);

			return value;
		}

		const value = byte0 + stream.buffer[`readUInt${this.endianness}`](stream.position, 6);

		stream.position += 6;

		this.setContext(value, context);

		return value;
	}
}

export function createVarUIntCodec(...parameters: ConstructorParameters<typeof VarUIntCodec>) {
	return new VarUIntCodec(...parameters);
}
