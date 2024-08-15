import { VarUIntCodec } from ".";
import { Context } from "../../utilities/Context";
import { Stream } from "../../utilities/Stream";
import { CodecType } from "../Abstract";

const context = new Context();

const codec = new VarUIntCodec();

const uInt1: CodecType<typeof codec> = 27;

it("matches unsigned integer", () => {
	const isMatch = codec.match(uInt1, context);

	expect(isMatch).toBe(true);
});

it("does not match not unsigned integer", () => {
	const isMatch = codec.match(uInt1.toString(10), context);

	expect(isMatch).toBe(false);
});

it("returns size of unsigned integer 1", () => {
	const size = codec.encodingLength(uInt1, context);

	expect(size).toBe(1);
});

describe("encodes then decodes unsigned integer 1", () => {
	const writeStream = new Stream(Buffer.alloc(1), 0);

	it("encodes unsigned integer 1", () => {
		codec.write(uInt1, writeStream, context);

		expect(writeStream.position).toBe(1);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes unsigned integer 1", () => {
		const value = codec.read(readStream, context);

		expect(value).toBe(uInt1);
	});
});

const uInt2: CodecType<typeof codec> = 281474976710655;

it("returns size of unsigned integer 2", () => {
	const size = codec.encodingLength(uInt2, context);

	expect(size).toBe(7);
});

describe("encodes then decodes unsigned integer 2", () => {
	const writeStream = new Stream(Buffer.alloc(7), 0);

	it("encodes unsigned integer 2", () => {
		codec.write(uInt2, writeStream, context);

		expect(writeStream.position).toBe(7);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes unsigned integer 2", () => {
		const value = codec.read(readStream, context);

		expect(value).toBe(uInt2);
	});
});
