import { base64, hex } from "@scure/base";
import { randomBytes } from "crypto";
import { BytesReadableStream, BytesWritableStream } from "../../utilities/BytesStream.ignore";
import { CodecType } from "../Abstract";
import { StringFixedCodec } from "./Fixed";

describe("correctly performs fixed string codec methods", () => {
	const byteLength = 16;
	const codec = new StringFixedCodec(16, "hex");
	const value: CodecType<typeof codec> = hex.encode(randomBytes(16));

	it("valid for fixed string", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not fixed string", () => {
		const isValid = codec.isValid(null);

		expect(isValid).toBe(false);
	});

	it("returns byteLength of fixed string", () => {
		const resultByteLength = codec.byteLength();

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes fixed string to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes buffer from fixed string", async () => {
		const buffer = hex.decode(value);

		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value);
	});

	it(`streams fixed string to buffer`, async () => {
		const stream = new BytesWritableStream();

		const encoder = codec.Encoder();

		const promise = encoder.readable.pipeTo(stream);

		const writer = encoder.writable.getWriter();

		await writer.write(value);
		await writer.close();

		await promise;

		expect(stream.offset).toBe(byteLength);
	});

	it(`streams fixed string from buffer`, async () => {
		const buffer = codec.encode(value);

		const stream = new BytesReadableStream(buffer);

		const decoder = codec.Decoder();

		const readable = stream.pipeThrough(decoder);

		const reader = readable.getReader();

		const result = await reader.read();
		await reader.cancel();

		expect(result.value).toStrictEqual(value);
	});
});

const utf8Cases = [
	{ name: "ascii", value: "hi", decoded: "hi" },
	{ name: "2-byte", value: "é", decoded: "é" },
	{ name: "3-byte", value: "€", decoded: "€" },
	{ name: "4-byte emoji", value: "😀", decoded: "😀" },
	{ name: "lone surrogate", value: "\uD800", decoded: "�" },
];

describe("fixed string utf8 exact-byte guards", () => {
	for (const { name, value, decoded } of utf8Cases) {
		it(`fixed utf8 ${name} matches TextEncoder bytes and round-trips`, () => {
			const expected = new TextEncoder().encode(value);
			const codec = new StringFixedCodec(expected.byteLength, "utf8");

			expect(codec.encode(value)).toEqual(expected);
			expect(codec.decode(codec.encode(value))).toBe(decoded);
		});
	}

	it("fixed utf8 over-length truncates to exact bytes", () => {
		const codec = new StringFixedCodec(3, "utf8");
		const expected = new TextEncoder().encode("hello").subarray(0, 3);

		expect(codec.encode("hello")).toEqual(expected);
		expect(codec.encode("hello").byteLength).toBe(3);
	});

	it("fixed utf8 truncation mid multibyte character writes exact bytes", () => {
		const codec = new StringFixedCodec(2, "utf8");
		const expected = new TextEncoder().encode("a€").subarray(0, 2);

		expect(codec.encode("a€")).toEqual(expected);
		expect(codec.encode("a€").byteLength).toBe(2);
	});
});

describe("fixed string base64 exact-byte guards", () => {
	it("fixed base64 matches decoded bytes and round-trips", () => {
		const raw = Uint8Array.from(randomBytes(15));
		const value = base64.encode(raw);
		const codec = new StringFixedCodec(raw.byteLength, "base64");

		expect(codec.encode(value)).toEqual(raw);
		expect(codec.decode(codec.encode(value))).toBe(value);
	});
});

describe("fixed string hex invalid input guards", () => {
	it("fixed hex throws on odd-length input", () => {
		const codec = new StringFixedCodec(1, "hex");

		expect(() => codec.encode("abc")).toThrow();
	});

	it("fixed hex throws on non-hex characters", () => {
		const codec = new StringFixedCodec(1, "hex");

		expect(() => codec.encode("zz")).toThrow();
	});
});
