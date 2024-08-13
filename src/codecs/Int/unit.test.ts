import { IntCodec } from ".";
import { Context } from "../../utilities/Context";
import { Stream } from "../../utilities/Stream";
import { CodecType } from "../Abstract";

const context = new Context();

const codec = new IntCodec(8);

const integer: CodecType<typeof codec> = -27;

it("matches integer", () => {
	const isMatch = codec.match(integer, context);

	expect(isMatch).toBe(true);
});

it("does not match not integer", () => {
	const isMatch = codec.match(integer.toString(10), context);

	expect(isMatch).toBe(false);
});

it("returns size of integer", () => {
	const size = codec.encodingLength(integer, context);

	expect(size).toBe(1);
});

describe("encodes then decodes integer", () => {
	const writeStream = new Stream(Buffer.alloc(1), 0);

	it("encodes integer", () => {
		codec.write(integer, writeStream, context);

		expect(writeStream.position).toBe(1);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes integer", () => {
		const value = codec.read(readStream, context);

		expect(value).toBe(integer);
	});
});
