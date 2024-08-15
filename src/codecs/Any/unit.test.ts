import { AnyCodec } from ".";
import { Context } from "../../utilities/Context";
import { Stream } from "../../utilities/Stream";
import { CodecType } from "../Abstract";

const context = new Context();

const codec = new AnyCodec();

const value: CodecType<typeof codec> = {
	test1: true,
	test2: false,
};

it("matches any", () => {
	const isMatch = codec.match(value, context);

	expect(isMatch).toBe(true);
});

it("returns size of any", () => {
	const size = codec.encodingLength(value, context);

	expect(size).toBe(29);
});

describe("encodes then decodes any", () => {
	const writeStream = new Stream(Buffer.alloc(29), 0);

	it("encodes any", () => {
		codec.write(value, writeStream, context);

		expect(writeStream.position).toBe(29);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes any", () => {
		const value = codec.read(readStream, context);

		expect(value).toStrictEqual(value);
	});
});
