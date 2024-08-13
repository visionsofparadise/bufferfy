import { EnumCodec } from ".";
import { Context } from "../../utilities/Context";
import { Stream } from "../../utilities/Stream";
import { UIntCodec } from "../UInt";

const context = new Context();

const values = ["1", 2, "test"];

const codec = new EnumCodec(values, { indexCodec: new UIntCodec(8) });

it("matches enumerated", () => {
	const isMatch = codec.match(values[0], context);

	expect(isMatch).toBe(true);
});

it("does not match not enumerated", () => {
	const isMatch = codec.match(3, context);

	expect(isMatch).toBe(false);
});

it("returns size of enumerated", () => {
	const size = codec.encodingLength(values[0], context);

	expect(size).toBe(1);
});

describe("encodes then decodes enumerated", () => {
	const writeStream = new Stream(Buffer.alloc(1), 0);

	it("encodes enumerated", () => {
		codec.write(values[0], writeStream, context);

		expect(writeStream.position).toBe(1);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes enumerated", () => {
		const value = codec.read(readStream, context);

		expect(value).toBe(values[0]);
	});
});

const fixedCodec = new EnumCodec(values, { indexCodec: new UIntCodec(8) });

it("returns size of enumerated", () => {
	const size = fixedCodec.encodingLength(values[2], context);

	expect(size).toBe(1);
});

describe("encodes then decodes enumerated", () => {
	const writeStream = new Stream(Buffer.alloc(1), 0);

	it("encodes enumerated", () => {
		fixedCodec.write(values[2], writeStream, context);

		expect(writeStream.position).toBe(1);
	});

	const readStream = new Stream(writeStream.buffer, 0);

	it("decodes enumerated", () => {
		const value = fixedCodec.read(readStream, context);

		expect(value).toBe(values[2]);
	});
});
