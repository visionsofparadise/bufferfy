import { randomBytes } from "crypto";
import { BufferReadStream, BufferWriteStream } from "../../utilities/BufferStream.ignore";
import { CodecType } from "../Abstract";
import { StringVariableCodec } from "./Variable";

describe("correctly performs variable string codec methods", () => {
	const codec = new StringVariableCodec("hex");
	const value: CodecType<typeof codec> = randomBytes(16).toString("hex");
	const byteLength = 17;

	it("valid for variable string", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not variable string", () => {
		const isValid = codec.isValid(Buffer.from(value));

		expect(isValid).toBe(false);
	});

	it("returns byteLength of variable string", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes variable string to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes buffer from variable string", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value);
	});

	it(`streams variable string to buffer`, async () => {
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

	it(`streams variable string from buffer`, async () => {
		const buffer = Buffer.concat([codec.encode(value), codec.encode(value), codec.encode(value)]);

		const stream = new BufferReadStream(buffer);

		const decoder = codec.Decoder();

		await new Promise((resolve) => {
			decoder.on("finish", resolve);

			stream.pipe(decoder);
		});

		expect(decoder.read(1)).toStrictEqual(value);
		expect(decoder.read(1)).toStrictEqual(value);
		expect(decoder.read(1)).toStrictEqual(value);
	});
});
