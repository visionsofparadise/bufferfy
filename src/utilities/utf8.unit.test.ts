import { decodeUtf8, encodeUtf8Into, utf8ByteLength } from "./utf8";

const cases: Array<{ name: string; value: string }> = [
	{ name: "empty", value: "" },
	{ name: "ascii", value: "hello world" },
	{ name: "2-byte", value: "café résumé" },
	{ name: "3-byte", value: "€ ¥ 你好" },
	{ name: "4-byte emoji", value: "😀🎉🚀" },
	{ name: "lone high surrogate alone", value: "\uD800" },
	{ name: "lone low surrogate alone", value: "\uDC00" },
	{ name: "lone high surrogate at end of string", value: "abc\uD800" },
	{ name: "high surrogate followed by non-low", value: "\uD800x" },
	{ name: "high surrogate followed by high surrogate", value: "\uD800\uD800" },
	{ name: "valid pair then lone low", value: "𝄞\uDC00" },
	{ name: "mixed multibyte and surrogates", value: "a€b😀c𝄞d\uDC00e" },
	{ name: "short below threshold", value: "abc€😀\uD800" },
	{ name: "long ascii above threshold", value: "abcdefghij".repeat(10) },
	{ name: "long multibyte above threshold", value: "café😀€".repeat(20) },
];

describe("utf8ByteLength equals TextEncoder byte length", () => {
	for (const { name, value } of cases) {
		it(name, () => {
			expect(utf8ByteLength(value)).toBe(new TextEncoder().encode(value).byteLength);
		});
	}
});

describe("encodeUtf8Into equals TextEncoder bytes", () => {
	for (const { name, value } of cases) {
		it(name, () => {
			const expected = new TextEncoder().encode(value);
			const offset = 3;
			const buffer = new Uint8Array(offset + expected.byteLength + 4);

			const written = encodeUtf8Into(value, buffer, offset);

			expect(written).toBe(expected.byteLength);
			expect(buffer.subarray(offset, offset + written)).toEqual(expected);
		});
	}
});

describe("decodeUtf8 equals TextDecoder", () => {
	for (const { name, value } of cases) {
		it(name, () => {
			const encoded = new TextEncoder().encode(value);
			const offset = 2;
			const buffer = new Uint8Array(offset + encoded.byteLength);
			buffer.set(encoded, offset);

			expect(decodeUtf8(buffer, offset, offset + encoded.byteLength)).toBe(new TextDecoder().decode(encoded));
		});
	}
});

describe("decodeUtf8 matches TextDecoder on invalid or truncated bytes", () => {
	const byteCases: Array<{ name: string; bytes: Array<number> }> = [
		{ name: "truncated 3-byte sequence", bytes: [0x61, 0xe2] },
		{ name: "lone continuation byte", bytes: [0x80] },
		{ name: "truncated 4-byte sequence", bytes: [0xf0, 0x9f, 0x98] },
		{ name: "overlong-looking prefix", bytes: [0xc0, 0x80] },
	];

	for (const { name, bytes } of byteCases) {
		it(name, () => {
			const buffer = Uint8Array.from(bytes);

			expect(decodeUtf8(buffer, 0, buffer.byteLength)).toBe(new TextDecoder().decode(buffer));
		});
	}
});
