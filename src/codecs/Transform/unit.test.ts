import { TransformCodec } from ".";
import { Context } from "../../utilities/Context";
import { Stream } from "../../utilities/Stream";
import { CodecType } from "../Abstract";
import { BooleanCodec } from "../Boolean";

const context = new Context();

const codec = new TransformCodec(new BooleanCodec(), {
	decode: (boolean) => (boolean ? 1 : 0),
	encode: (value) => {
		if (value !== 1 && value !== 0) throw new Error("Invalid value");

		return value === 1;
	},
});

const value: CodecType<typeof codec> = 1;

it("matches transform value", () => {
	const isMatch = codec.match(value, context);

	expect(isMatch).toBe(true);
});

it("does not match not transform value", () => {
	const isMatch = codec.match("test", context);

	expect(isMatch).toBe(false);
});

it("returns size of transform value", () => {
	const size = codec.encodingLength(value, context);

	expect(size).toBe(1);
});

describe("encodes then decodes transform value", () => {
	const writeStream = new Stream(Buffer.alloc(1), 0);

	it("encodes transform value", () => {
		codec.write(value, writeStream, context);

		expect(writeStream.position).toBe(1);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes transform value", () => {
		const value = codec.read(readStream, context);

		expect(value).toBe(value);
	});
});
