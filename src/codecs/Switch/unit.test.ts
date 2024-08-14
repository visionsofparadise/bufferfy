import { SwitchCodec } from ".";
import { Context } from "../../utilities/Context";
import { Stream } from "../../utilities/Stream";
import { CodecType } from "../Abstract";
import { ObjectCodec } from "../Object";
import { StringCodec } from "../String";
import { UIntCodec } from "../UInt";

const context = new Context();

const codec = new SwitchCodec(
	{
		0: new ObjectCodec({
			version: new UIntCodec(8),
			string: new StringCodec({ length: 4 }),
		}),
		1: new ObjectCodec({
			version: new UIntCodec(8),
			number: new UIntCodec(8),
		}),
	},
	{
		getValueCase: (value) => value.version,
		getBufferCase: (buffer) => buffer[0],
	}
);

const switch1: CodecType<typeof codec> = { version: 0, string: "test" };
const switch2: CodecType<typeof codec> = { version: 1, number: 24 };

it("matches switch", () => {
	const isMatch1 = codec.match(switch1, context);

	expect(isMatch1).toBe(true);

	const isMatch2 = codec.match(switch2, context);

	expect(isMatch2).toBe(true);
});

it("does not match not switch", () => {
	const isMatch = codec.match(null, context);

	expect(isMatch).toBe(false);
});

it("returns size of switch", () => {
	const size = codec.encodingLength(switch1, context);

	expect(size).toBe(5);
});

describe("encodes then decodes switch value 1", () => {
	const writeStream = new Stream(Buffer.alloc(5), 0);

	it("encodes switch value 1", () => {
		codec.write(switch1, writeStream, context);

		expect(writeStream.position).toBe(5);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes switch value 1", () => {
		const value = codec.read(readStream, context);

		expect(value).toStrictEqual(switch1);
	});
});

describe("encodes then decodes switch value 2", () => {
	const writeStream = new Stream(Buffer.alloc(2), 0);

	it("encodes switch value 2", () => {
		codec.write(switch2, writeStream, context);

		expect(writeStream.position).toBe(2);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes switch value 2", () => {
		const value = codec.read(readStream, context);

		expect(value).toStrictEqual(switch2);
	});
});
