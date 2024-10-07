import { BufferReadStream, BufferWriteStream } from "./utilities/BufferStream.ignore";
import { CommonCodec, commonValue, SpreadCodec, spreadValue } from "./utilities/TestValues.ignore";

describe("encodes and decodes spread of types", () => {
	const byteLength = 50;

	let buffer: Buffer | undefined;

	it("valid for spread value", () => {
		const isValid = SpreadCodec.isValid(spreadValue);

		expect(isValid).toBe(true);
	});

	it("invalid for not spread value", () => {
		const isValid = SpreadCodec.isValid("test");

		expect(isValid).toBe(false);
	});

	it("returns byteLength of spread value", () => {
		const resultByteLength = SpreadCodec.byteLength(spreadValue);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes spread value", () => {
		buffer = SpreadCodec.encode(spreadValue);

		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes spread value", () => {
		const resultValue = SpreadCodec.decode(buffer!);

		expect(resultValue).toStrictEqual(spreadValue);
	});

	it(`streams spread value to buffer`, async () => {
		const stream = new BufferWriteStream();

		const encoder = SpreadCodec.Encoder();

		await new Promise((resolve) => {
			stream.on("finish", resolve);

			encoder.pipe(stream);
			encoder.write(spreadValue);
			encoder.end();
		});

		expect(stream.offset).toBe(byteLength);
	});

	it(`streams spread value from buffer`, async () => {
		const buffer = SpreadCodec.encode(spreadValue);

		const stream = new BufferReadStream(buffer);

		const decoder = SpreadCodec.Decoder();

		await new Promise((resolve) => {
			decoder.on("finish", resolve);

			stream.pipe(decoder);
		});

		expect(decoder.read(1)).toStrictEqual(spreadValue);
	});
});

describe("encodes and decodes common types", () => {
	const byteLength = 1050;

	let buffer: Buffer | undefined;

	it("valid for common value", () => {
		const isValid = CommonCodec.isValid(commonValue);

		expect(isValid).toBe(true);
	});

	it("invalid for not common value", () => {
		const isValid = CommonCodec.isValid("test");

		expect(isValid).toBe(false);
	});

	it("returns byteLength of common value", () => {
		const resultByteLength = CommonCodec.byteLength(commonValue);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes common value", () => {
		buffer = CommonCodec.encode(commonValue);

		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes common value", () => {
		const resultValue = CommonCodec.decode(buffer!);

		expect(resultValue).toStrictEqual(commonValue);
	});

	it(`streams common value to buffer`, async () => {
		const stream = new BufferWriteStream();

		const encoder = CommonCodec.Encoder();

		await new Promise((resolve) => {
			stream.on("finish", resolve);

			encoder.pipe(stream);
			encoder.write(commonValue);
			encoder.end();
		});

		expect(stream.offset).toBe(byteLength);
	});

	it(`streams common value from buffer`, async () => {
		const buffer = CommonCodec.encode(commonValue);

		const stream = new BufferReadStream(buffer);

		const decoder = CommonCodec.Decoder();

		await new Promise((resolve) => {
			decoder.on("finish", resolve);

			stream.pipe(decoder);
		});

		expect(decoder.read(1)).toStrictEqual(commonValue);
	});
});
