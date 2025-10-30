import { describe, expect, it } from "vitest";
import { UInt8Codec, createUIntCodec } from ".";
import { BufferfyRangeError } from "../../utilities/Error";

describe("UInt validation with validationMode", () => {
	describe("validationMode: both (default)", () => {
		it("validates minimum on encode", () => {
			const codec = new UInt8Codec({ minimum: 10 });

			expect(() => codec.encode(5)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(5)).toThrow("Encoded value 5 is less than minimum 10");
		});

		it("validates maximum on encode", () => {
			const codec = new UInt8Codec({ maximum: 100 });

			expect(() => codec.encode(150)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(150)).toThrow("Encoded value 150 exceeds maximum 100");
		});

		it("validates minimum on decode", () => {
			const codec = new UInt8Codec({ minimum: 10 });
			const buffer = Uint8Array.from([5]);

			expect(() => codec.decode(buffer)).toThrow(BufferfyRangeError);
			expect(() => codec.decode(buffer)).toThrow("Decoded value 5 is less than minimum 10");
		});

		it("validates maximum on decode", () => {
			const codec = new UInt8Codec({ maximum: 100 });
			const buffer = Uint8Array.from([150]);

			expect(() => codec.decode(buffer)).toThrow(BufferfyRangeError);
			expect(() => codec.decode(buffer)).toThrow("Decoded value 150 exceeds maximum 100");
		});

		it("allows valid values on encode", () => {
			const codec = new UInt8Codec({ minimum: 10, maximum: 100 });

			expect(() => codec.encode(50)).not.toThrow();
			expect(() => codec.encode(10)).not.toThrow();
			expect(() => codec.encode(100)).not.toThrow();
		});

		it("allows valid values on decode", () => {
			const codec = new UInt8Codec({ minimum: 10, maximum: 100 });

			expect(() => codec.decode(Uint8Array.from([50]))).not.toThrow();
			expect(() => codec.decode(Uint8Array.from([10]))).not.toThrow();
			expect(() => codec.decode(Uint8Array.from([100]))).not.toThrow();
		});
	});

	describe("validationMode: encode", () => {
		it("validates minimum on encode only", () => {
			const codec = new UInt8Codec({ minimum: 10, validationMode: "encode" });

			expect(() => codec.encode(5)).toThrow(BufferfyRangeError);
		});

		it("validates maximum on encode only", () => {
			const codec = new UInt8Codec({ maximum: 100, validationMode: "encode" });

			expect(() => codec.encode(150)).toThrow(BufferfyRangeError);
		});

		it("does not validate on decode", () => {
			const codec = new UInt8Codec({ minimum: 10, maximum: 100, validationMode: "encode" });

			expect(() => codec.decode(Uint8Array.from([5]))).not.toThrow();
			expect(() => codec.decode(Uint8Array.from([150]))).not.toThrow();
		});
	});

	describe("validationMode: decode", () => {
		it("validates minimum on decode only", () => {
			const codec = new UInt8Codec({ minimum: 10, validationMode: "decode" });
			const buffer = Uint8Array.from([5]);

			expect(() => codec.decode(buffer)).toThrow(BufferfyRangeError);
		});

		it("validates maximum on decode only", () => {
			const codec = new UInt8Codec({ maximum: 100, validationMode: "decode" });
			const buffer = Uint8Array.from([150]);

			expect(() => codec.decode(buffer)).toThrow(BufferfyRangeError);
		});

		it("does not validate on encode", () => {
			const codec = new UInt8Codec({ minimum: 10, maximum: 100, validationMode: "decode" });

			expect(() => codec.encode(5)).not.toThrow();
			expect(() => codec.encode(150)).not.toThrow();
		});
	});

	describe("validationMode: none", () => {
		it("does not validate on encode", () => {
			const codec = new UInt8Codec({ minimum: 10, maximum: 100, validationMode: "none" });

			expect(() => codec.encode(5)).not.toThrow();
			expect(() => codec.encode(150)).not.toThrow();
		});

		it("does not validate on decode", () => {
			const codec = new UInt8Codec({ minimum: 10, maximum: 100, validationMode: "none" });

			expect(() => codec.decode(Uint8Array.from([5]))).not.toThrow();
			expect(() => codec.decode(Uint8Array.from([150]))).not.toThrow();
		});
	});

	describe("isValid always validates", () => {
		it("validates regardless of validationMode: none", () => {
			const codec = new UInt8Codec({ minimum: 10, maximum: 100, validationMode: "none" });

			expect(codec.isValid(5)).toBe(false);
			expect(codec.isValid(150)).toBe(false);
			expect(codec.isValid(50)).toBe(true);
		});

		it("validates regardless of validationMode: encode", () => {
			const codec = new UInt8Codec({ minimum: 10, maximum: 100, validationMode: "encode" });

			expect(codec.isValid(5)).toBe(false);
			expect(codec.isValid(150)).toBe(false);
			expect(codec.isValid(50)).toBe(true);
		});

		it("validates regardless of validationMode: decode", () => {
			const codec = new UInt8Codec({ minimum: 10, maximum: 100, validationMode: "decode" });

			expect(codec.isValid(5)).toBe(false);
			expect(codec.isValid(150)).toBe(false);
			expect(codec.isValid(50)).toBe(true);
		});
	});

	describe("works with different UInt variants", () => {
		it("validates UInt16BE", () => {
			const codec = createUIntCodec(16, "BE", { minimum: 1000, maximum: 50000 });

			expect(() => codec.encode(500)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(60000)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(25000)).not.toThrow();
		});

		it("validates UInt16LE", () => {
			const codec = createUIntCodec(16, "LE", { minimum: 1000, maximum: 50000 });

			expect(() => codec.encode(500)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(60000)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(25000)).not.toThrow();
		});
	});
});
