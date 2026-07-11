import { hex } from "@scure/base";
import { randomBytes } from "crypto";
import { decodeHex, encodeHex, hexByteLength } from "./hex";

describe("table-based hex matches @scure/base hex", () => {
	it("encodeHex equals scure hex.encode for random buffers", () => {
		for (let index = 0; index < 100; index++) {
			const bytes = new Uint8Array(randomBytes(index));

			expect(encodeHex(bytes)).toBe(hex.encode(bytes));
		}
	});

	it("decodeHex equals scure hex.decode for random hex strings", () => {
		for (let index = 0; index < 100; index++) {
			const value = hex.encode(new Uint8Array(randomBytes(index)));

			expect(decodeHex(value)).toEqual(hex.decode(value));
		}
	});

	it("round-trips bytes through encode then decode", () => {
		const bytes = new Uint8Array(randomBytes(64));

		expect(decodeHex(encodeHex(bytes))).toEqual(bytes);
	});

	it("covers every byte value 0x00-0xff", () => {
		const bytes = new Uint8Array(256);

		for (let byte = 0; byte < 256; byte++) bytes[byte] = byte;

		expect(encodeHex(bytes)).toBe(hex.encode(bytes));
		expect(decodeHex(encodeHex(bytes))).toEqual(bytes);
	});

	it("handles empty input", () => {
		expect(encodeHex(new Uint8Array(0))).toBe("");
		expect(decodeHex("")).toEqual(new Uint8Array(0));
	});

	it("throws on odd length", () => {
		expect(() => decodeHex("abc")).toThrow();
	});

	it("throws on non-hex characters", () => {
		expect(() => decodeHex("zz")).toThrow();
		expect(() => decodeHex("0g")).toThrow();
	});

	it("decodes uppercase case-insensitively, matching scure", () => {
		expect(decodeHex("AB")).toEqual(hex.decode("AB"));
		expect(decodeHex("DeadBEEF")).toEqual(hex.decode("DeadBEEF"));
	});

	it("hexByteLength returns half the string length", () => {
		expect(hexByteLength("deadbeef")).toBe(4);
		expect(hexByteLength("")).toBe(0);
	});
});
