import { ArrayCodec } from ".";
import { Context } from "../../utilities/Context";
import { Stream } from "../../utilities/Stream";
import { CodecType } from "../Abstract";
import { StringCodec } from "../String";
import { UIntCodec } from "../UInt";

const context = new Context();

const codec = new ArrayCodec(new StringCodec({ length: 5 }), { lengthCodec: new UIntCodec(8) });

const array: CodecType<typeof codec> = ["test1", "test2", "test3"];

it("matches array", () => {
	const isMatch = codec.match(array, context);

	expect(isMatch).toBe(true);
});

it("does not match not array", () => {
	const isMatch = codec.match(10, context);

	expect(isMatch).toBe(false);
});

it("returns size of array", () => {
	const size = codec.encodingLength(array, context);

	expect(size).toBe(16);
});

describe("encodes then decodes array", () => {
	const writeStream = new Stream(Buffer.alloc(16), 0);

	it("encodes array", () => {
		codec.write(array, writeStream, context);

		expect(writeStream.position).toBe(16);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes array", () => {
		const value = codec.read(readStream, context);

		expect(value).toStrictEqual(array);
	});
});

const fixedCodec = new ArrayCodec(new StringCodec({ length: 5 }), { length: 3 });

it("returns size of fixed byteLength array", () => {
	const size = fixedCodec.encodingLength(array, context);

	expect(size).toBe(15);
});

describe("encodes then decodes fixed byteLength array", () => {
	const writeStream = new Stream(Buffer.alloc(15), 0);

	it("encodes array", () => {
		fixedCodec.write(array, writeStream, context);

		expect(writeStream.position).toBe(15);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes array", () => {
		const value = fixedCodec.read(readStream, context);

		expect(value).toStrictEqual(array);
	});
});
