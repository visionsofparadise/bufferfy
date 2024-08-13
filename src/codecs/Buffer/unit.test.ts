import { BufferCodec } from ".";
import { Context } from "../../utilities/Context";
import { Stream } from "../../utilities/Stream";
import { CodecType } from "../Abstract";
import { UIntCodec } from "../UInt";

const context = new Context();

const codec = new BufferCodec({ lengthCodec: new UIntCodec(8) });

const buffer: CodecType<typeof codec> = Buffer.from([1, 2, 3, 4]);

it("matches buffer", () => {
	const isMatch = codec.match(buffer, context);

	expect(isMatch).toBe(true);
});

it("does not match not buffer", () => {
	const isMatch = codec.match(10, context);

	expect(isMatch).toBe(false);
});

it("returns size of buffer", () => {
	const size = codec.encodingLength(buffer, context);

	expect(size).toBe(5);
});

describe("encodes then decodes buffer", () => {
	const writeStream = new Stream(Buffer.alloc(5), 0);

	it("encodes buffer", () => {
		codec.write(buffer, writeStream, context);

		expect(writeStream.position).toBe(5);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes buffer", () => {
		const value = codec.read(readStream, context);

		expect(value).toStrictEqual(buffer);
	});
});

const fixedCodec = new BufferCodec({ length: 4 });

it("returns size of fixed byteLength buffer", () => {
	const size = fixedCodec.encodingLength(buffer, context);

	expect(size).toBe(4);
});

describe("encodes then decodes fixed byteLength buffer", () => {
	const writeStream = new Stream(Buffer.alloc(4), 0);

	it("encodes buffer", () => {
		fixedCodec.write(buffer, writeStream, context);

		expect(writeStream.position).toBe(4);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes buffer", () => {
		const value = fixedCodec.read(readStream, context);

		expect(value).toStrictEqual(buffer);
	});
});
