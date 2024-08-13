import { TupleCodec } from ".";
import { Context } from "../../utilities/Context";
import { Stream } from "../../utilities/Stream";
import { CodecType } from "../Abstract";
import { StringCodec } from "../String";
import { UIntCodec } from "../UInt";

const context = new Context();

const codec = new TupleCodec([new StringCodec({ length: 5 }), new UIntCodec(8), new StringCodec({ length: 5 })]);

const tuple: CodecType<typeof codec> = ["test1", 27, "test3"];

it("matches tuple", () => {
	const isMatch = codec.match(tuple, context);

	expect(isMatch).toBe(true);
});

it("does not match not tuple", () => {
	const isMatch = codec.match(10, context);

	expect(isMatch).toBe(false);
});

it("returns size of tuple", () => {
	const size = codec.encodingLength(tuple, context);

	expect(size).toBe(11);
});

describe("encodes then decodes tuple", () => {
	const writeStream = new Stream(Buffer.alloc(11), 0);

	it("encodes tuple", () => {
		codec.write(tuple, writeStream, context);

		expect(writeStream.position).toBe(11);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes tuple", () => {
		const value = codec.read(readStream, context);

		expect(value).toStrictEqual(tuple);
	});
});
