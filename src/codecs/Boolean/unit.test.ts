import { BooleanCodec } from ".";
import { Context } from "../../utilities/Context";
import { Stream } from "../../utilities/Stream";
import { CodecType } from "../Abstract";

const context = new Context();

const codec = new BooleanCodec();

const boolean: CodecType<typeof codec> = true;

it("matches boolean", () => {
	const isMatch = codec.match(boolean, context);

	expect(isMatch).toBe(true);
});

it("does not match not boolean", () => {
	const isMatch = codec.match(null, context);

	expect(isMatch).toBe(false);
});

it("returns size of boolean", () => {
	const size = codec.encodingLength(boolean, context);

	expect(size).toBe(1);
});

describe("encodes then decodes boolean", () => {
	const writeStream = new Stream(Buffer.alloc(1), 0);

	it("encodes boolean", () => {
		codec.write(boolean, writeStream, context);

		expect(writeStream.position).toBe(1);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes boolean", () => {
		const value = codec.read(readStream, context);

		expect(value).toBe(boolean);
	});
});
