import { ObjectCodec } from ".";
import { Context } from "../../utilities/Context";
import { Stream } from "../../utilities/Stream";
import { CodecType } from "../Abstract";
import { NullCodec } from "../Null";
import { StringCodec } from "../String";
import { UIntCodec } from "../UInt";

const context = new Context();

const codec = new ObjectCodec({
	test1: new StringCodec({
		length: 5,
	}),
	test2: new NullCodec(),
	test3: new UIntCodec(8),
});

const object: CodecType<typeof codec> = {
	test1: "test1",
	test2: null,
	test3: 54,
};

it("matches object", () => {
	const isMatch = codec.match(object, context);

	expect(isMatch).toBe(true);
});

it("does not match not object", () => {
	const isMatch = codec.match(10, context);

	expect(isMatch).toBe(false);
});

it("returns size of object", () => {
	const size = codec.encodingLength(object, context);

	expect(size).toBe(6);
});

describe("encodes then decodes object", () => {
	const writeStream = new Stream(Buffer.alloc(6), 0);

	it("encodes object", () => {
		codec.write(object, writeStream, context);

		expect(writeStream.position).toBe(6);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes object", () => {
		const value = codec.read(readStream, context);

		expect(value).toStrictEqual(object);
	});
});
