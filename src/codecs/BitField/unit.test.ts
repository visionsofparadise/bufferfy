import { BitFieldCodec } from ".";
import { BufferReadStream, BufferWriteStream } from "../../utilities/BufferStream.ignore";
import { CodecType } from "../Abstract";

describe("correctly performs bitfield codec methods", () => {
	const codec = new BitFieldCodec(["test1", "test2", "test3", "test4", "test5", "test6", "test7", "test8", "test9"]);
	const value: CodecType<typeof codec> = {
		test1: true,
		test2: false,
		test3: true,
		test4: true,
		test5: false,
		test6: true,
		test7: true,
		test8: false,
		test9: true,
	};
	const byteLength = 2;

	it("valid for bitfield", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not bitfield", () => {
		const isValid = codec.isValid(null);

		expect(isValid).toBe(false);
	});

	it("returns byteLength of bitfield", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes bitfield to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes bitfield from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value);
	});

	it(`streams bitfield to buffer`, async () => {
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

	it(`streams bitfield from buffer`, async () => {
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
