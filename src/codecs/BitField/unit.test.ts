import { BitFieldCodec } from ".";
import { Context } from "../../utilities/Context";
import { Stream } from "../../utilities/Stream";
import { CodecType } from "../Abstract";

const context = new Context();

const codec = new BitFieldCodec(["test1", "test2", "test3", "test4", "test5", "test6", "test7", "test8", "test9"]);

const flags: CodecType<typeof codec> = {
	test1: true,
	test2: false,
	test3: true,
	test4: true,
	test5: false,
	test6: true,
	test7: true,
	test8: false,
	test9: true,
};

it("matches bit field", () => {
	const isMatch = codec.match(flags, context);

	expect(isMatch).toBe(true);
});

it("does not match not bit field", () => {
	const isMatch = codec.match(null, context);

	expect(isMatch).toBe(false);
});

it("returns size of bit field", () => {
	const size = codec.encodingLength(flags, context);

	expect(size).toBe(2);
});

describe("encodes then decodes bit field", () => {
	const writeStream = new Stream(Buffer.alloc(2), 0);

	it("encodes bit field", () => {
		codec.write(flags, writeStream, context);

		expect(writeStream.position).toBe(2);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes bit field", () => {
		const value = codec.read(readStream, context);

		expect(value).toStrictEqual(flags);
	});
});
