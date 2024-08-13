import { UIntCodec } from ".";
import { Context } from "../../utilities/Context";
import { Stream } from "../../utilities/Stream";
import { CodecType } from "../Abstract";

const context = new Context();

const codec = new UIntCodec(8);

const uInt: CodecType<typeof codec> = 27;

it("matches unsigned integer", () => {
	const isMatch = codec.match(uInt, context);

	expect(isMatch).toBe(true);
});

it("does not match not unsigned integer", () => {
	const isMatch = codec.match(uInt.toString(10), context);

	expect(isMatch).toBe(false);
});

it("returns size of unsigned integer", () => {
	const size = codec.encodingLength(uInt, context);

	expect(size).toBe(1);
});

describe("encodes then decodes unsigned integer", () => {
	const writeStream = new Stream(Buffer.alloc(1), 0);

	it("encodes unsigned integer", () => {
		codec.write(uInt, writeStream, context);

		expect(writeStream.position).toBe(1);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes unsigned integer", () => {
		const value = codec.read(readStream, context);

		expect(value).toBe(uInt);
	});
});
