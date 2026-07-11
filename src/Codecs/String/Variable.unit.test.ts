import { base64 } from "@scure/base";
import { randomBytes } from "crypto";
import { BytesReadableStream, BytesWritableStream } from "../../utilities/BytesStream.ignore";
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
		const isValid = codec.isValid(null);

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
		const stream = new BytesWritableStream();

		const encoder = codec.Encoder();

		const promise = encoder.readable.pipeTo(stream);

		const writer = encoder.writable.getWriter();

		await writer.write(value);
		await writer.close();

		await promise;

		expect(stream.offset).toBe(byteLength);
	});

	it(`streams variable string from buffer`, async () => {
		const buffer = Buffer.concat([codec.encode(value), codec.encode(value), codec.encode(value)]);

		const stream = new BytesReadableStream(buffer);

		const decoder = codec.Decoder();

		const readable = stream.pipeThrough(decoder);

		const reader = readable.getReader();

		const result1 = await reader.read();
		const result2 = await reader.read();
		const result3 = await reader.read();
		await reader.cancel();

		expect(result1.value).toStrictEqual(value);
		expect(result2.value).toStrictEqual(value);
		expect(result3.value).toStrictEqual(value);
	});
});

const utf8Cases = [
	{ name: "ascii", value: "hi", decoded: "hi" },
	{ name: "2-byte", value: "é", decoded: "é" },
	{ name: "3-byte", value: "€", decoded: "€" },
	{ name: "4-byte emoji", value: "😀", decoded: "😀" },
	{ name: "lone surrogate", value: "\uD800", decoded: "�" },
];

describe("variable string utf8 exact-byte and byteLength guards", () => {
	for (const { name, value, decoded } of utf8Cases) {
		it(`variable utf8 ${name} matches TextEncoder bytes, byteLength, and round-trips`, () => {
			const codec = new StringVariableCodec("utf8");
			const utf8 = new TextEncoder().encode(value);
			const expected = Uint8Array.from([...codec.lengthCodec.encode(utf8.byteLength), ...utf8]);

			const encoded = codec.encode(value);

			expect(encoded).toEqual(expected);
			expect(codec.byteLength(value)).toBe(encoded.byteLength);
			expect(codec.decode(encoded)).toBe(decoded);
		});
	}
});

describe("variable string base64 exact-byte guards", () => {
	it("variable base64 matches decoded bytes and round-trips", () => {
		const codec = new StringVariableCodec("base64");
		const raw = Uint8Array.from(randomBytes(15));
		const value = base64.encode(raw);
		const expected = Uint8Array.from([...codec.lengthCodec.encode(raw.byteLength), ...raw]);

		const encoded = codec.encode(value);

		expect(encoded).toEqual(expected);
		expect(codec.decode(encoded)).toBe(value);
	});
});

describe("variable string hex invalid input guards", () => {
	it("variable hex throws on odd-length input", () => {
		const codec = new StringVariableCodec("hex");

		expect(() => codec.encode("abc")).toThrow();
	});

	it("variable hex throws on non-hex characters", () => {
		const codec = new StringVariableCodec("hex");

		expect(() => codec.encode("zz")).toThrow();
	});
});
