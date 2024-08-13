import { OptionalCodec } from ".";
import { Context } from "../../utilities/Context";
import { Stream } from "../../utilities/Stream";
import { CodecType } from "../Abstract";
import { UIntCodec } from "../UInt";

const context = new Context();

const codec = new OptionalCodec(new UIntCodec(8));

const optional1: CodecType<typeof codec> = 5;

it("matches defined optional", () => {
	const isMatch = codec.match(optional1, context);

	expect(isMatch).toBe(true);
});

it("does not match not optional", () => {
	const isMatch = codec.match("test", context);

	expect(isMatch).toBe(false);
});

it("returns size of defined optional", () => {
	const size = codec.encodingLength(optional1, context);

	expect(size).toBe(2);
});

describe("encodes then decodes defined optional", () => {
	const writeStream = new Stream(Buffer.alloc(2), 0);

	it("encodes defined optional", () => {
		codec.write(optional1, writeStream, context);

		expect(writeStream.position).toBe(2);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes defined optional", () => {
		const value = codec.read(readStream, context);

		expect(value).toStrictEqual(optional1);
	});
});

const optional2: CodecType<typeof codec> = undefined;

it("matches undefined optional", () => {
	const isMatch = codec.match(optional2, context);

	expect(isMatch).toBe(true);
});

it("returns size of undefined optional", () => {
	const size = codec.encodingLength(optional2, context);

	expect(size).toBe(1);
});

describe("encodes then decodes undefined optional", () => {
	const writeStream = new Stream(Buffer.alloc(1), 0);

	it("encodes undefined optional", () => {
		codec.write(optional2, writeStream, context);

		expect(writeStream.position).toBe(1);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes undefined optional", () => {
		const value = codec.read(readStream, context);

		expect(value).toStrictEqual(optional2);
	});
});
