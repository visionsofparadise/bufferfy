import { TransformCodec } from ".";
import { BufferReadStream, BufferWriteStream } from "../../utilities/BufferStream.ignore";
import { CodecType } from "../Abstract";
import { BooleanCodec } from "../Boolean";

describe("correctly performs transform codec methods", () => {
	const codec = new TransformCodec(new BooleanCodec(), {
		decode: (boolean) => {
			if (boolean === true) return 1;
			if (boolean === false) return 0;

			throw new Error("Invalid value");
		},
		encode: (value) => {
			if (value !== 1 && value !== 0) throw new Error("Invalid value");

			return value === 1;
		},
	});
	const value: CodecType<typeof codec> = 1;
	const byteLength = 1;

	it("valid for transform", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not transform", () => {
		const isValid = codec.isValid("test");

		expect(isValid).toBe(false);
	});

	it("returns byteLength of transform", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes transform to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes transform from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value);
	});

	it(`streams transform to buffer`, async () => {
		const stream = new BufferWriteStream();

		const encoder = codec.Encoder();

		await new Promise((resolve) => {
			stream.on("finish", resolve);

			encoder.pipe(stream);
			encoder.write(value);
			encoder.end();
		});

		expect(stream.offset).toBe(byteLength);
	});

	it(`streams transform from buffer`, async () => {
		const buffer = codec.encode(value);

		const stream = new BufferReadStream(buffer);

		const decoder = codec.Decoder();

		await new Promise((resolve) => {
			decoder.on("finish", resolve);

			stream.pipe(decoder);
		});

		expect(decoder.read(1)).toStrictEqual(value);
	});
});
