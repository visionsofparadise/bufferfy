import { ConstantCodec } from ".";
import { BufferReadStream } from "../../utilities/BufferStream.ignore";

describe("correctly performs null codec methods", () => {
	const value = null;
	const codec = new ConstantCodec(value);
	const byteLength = 0;

	it("valid for null", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not null", () => {
		const isValid = codec.isValid(true);

		expect(isValid).toBe(false);
	});

	it("returns byteLength of null", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes null to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes null from buffer", async () => {
		const result = codec.decode(Buffer.from([]));

		expect(result).toStrictEqual(value);
	});

	it(`streams null from buffer`, async () => {
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
