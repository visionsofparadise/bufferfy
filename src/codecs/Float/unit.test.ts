import { FloatCodec } from ".";
import { Context } from "../../utilities/Context";
import { Stream } from "../../utilities/Stream";
import { CodecType } from "../Abstract";

const context = new Context();

const codec = new FloatCodec(32);

const float: CodecType<typeof codec> = 85.32127;

it("matches float", () => {
	const isMatch = codec.match(float, context);

	expect(isMatch).toBe(true);
});

it("does not match not float", () => {
	const isMatch = codec.match(float.toString(10), context);

	expect(isMatch).toBe(false);
});

it("returns size of float", () => {
	const size = codec.encodingLength(float, context);

	expect(size).toBe(4);
});

describe("encodes then decodes float", () => {
	const writeStream = new Stream(Buffer.alloc(4), 0);

	it("encodes float", () => {
		codec.write(float, writeStream, context);

		expect(writeStream.position).toBe(4);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes float", () => {
		const value = codec.read(readStream, context);

		expect(value).toBeCloseTo(float);
	});
});
