import { PointerCodec } from ".";
import { Context } from "../../utilities/Context";
import { Stream } from "../../utilities/Stream";
import { CodecType } from "../Abstract";
import { ObjectCodec } from "../Object";
import { UIntCodec } from "../UInt";

const context = new Context();

const codec = new ObjectCodec({
	property1: new UIntCodec(8, undefined, { id: "property1" }),
	property2: new PointerCodec<number>("property1"),
});

type Value = CodecType<typeof codec>;

const value: Value = {
	property1: 32,
	property2: 26,
};

it("matches object with pointer", () => {
	const isMatch = codec.match(value, context);

	expect(isMatch).toBe(true);
});

it("does not match not object with pointer", () => {
	const isMatch = codec.match(null, context);

	expect(isMatch).toBe(false);
});

it("returns size of object with pointer", () => {
	const size = codec.encodingLength(value, context);

	expect(size).toBe(2);
});

describe("encodes then decodes object with pointer", () => {
	const writeStream = new Stream(Buffer.alloc(2), 0);

	it("encodes object with pointer", () => {
		codec.write(value, writeStream, context);

		expect(true).toBe(true);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes object with pointer", () => {
		const value = codec.read(readStream, context);

		expect(value).toBe(value);
	});
});
