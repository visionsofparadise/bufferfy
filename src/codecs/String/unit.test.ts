import { StringCodec } from ".";
import { Context } from "../../utilities/Context";
import { Stream } from "../../utilities/Stream";
import { CodecType } from "../Abstract";
import { UIntCodec } from "../UInt";

const context = new Context();

const codec = new StringCodec({ lengthCodec: new UIntCodec(8) });

const string: CodecType<typeof codec> = "test";

it("matches string", () => {
	const isMatch = codec.match(string, context);

	expect(isMatch).toBe(true);
});

it("does not match not string", () => {
	const isMatch = codec.match(10, context);

	expect(isMatch).toBe(false);
});

it("returns size of string", () => {
	const size = codec.encodingLength(string, context);

	expect(size).toBe(5);
});

describe("encodes then decodes string", () => {
	const writeStream = new Stream(Buffer.alloc(5), 0);

	it("encodes string", () => {
		codec.write(string, writeStream, context);

		expect(writeStream.position).toBe(5);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes string", () => {
		const value = codec.read(readStream, context);

		expect(value).toBe(string);
	});
});

const fixedCodec = new StringCodec({ length: 4 });

it("returns size of fixed byteLength string", () => {
	const size = fixedCodec.encodingLength(string, context);

	expect(size).toBe(4);
});

describe("encodes then decodes fixed byteLength string", () => {
	const writeStream = new Stream(Buffer.alloc(4), 0);

	it("encodes string", () => {
		fixedCodec.write(string, writeStream, context);

		expect(writeStream.position).toBe(4);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes string", () => {
		const value = fixedCodec.read(readStream, context);

		expect(value).toBe(string);
	});
});
