import { describe, expect, it } from "vitest";
import { BigUIntBECodec, createBigUIntCodec } from ".";
import { BufferfyRangeError } from "../../utilities/Error";

describe("BigUInt validation with validationMode", () => {
	describe("validationMode: both (default)", () => {
		it("validates minimum on encode", () => {
			const codec = new BigUIntBECodec({ minimum: 1000n });

			expect(() => codec.encode(500n)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(500n)).toThrow("Encoded value 500 is less than minimum 1000");
		});

		it("validates maximum on encode", () => {
			const codec = new BigUIntBECodec({ maximum: 10000n });

			expect(() => codec.encode(15000n)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(15000n)).toThrow("Encoded value 15000 exceeds maximum 10000");
		});

		it("validates minimum on decode", () => {
			const codec = new BigUIntBECodec({ minimum: 1000n });
			const validCodec = new BigUIntBECodec();
			const buffer = validCodec.encode(500n);

			expect(() => codec.decode(buffer)).toThrow(BufferfyRangeError);
			expect(() => codec.decode(buffer)).toThrow("Decoded value 500 is less than minimum 1000");
		});

		it("validates maximum on decode", () => {
			const codec = new BigUIntBECodec({ maximum: 10000n });
			const validCodec = new BigUIntBECodec();
			const buffer = validCodec.encode(15000n);

			expect(() => codec.decode(buffer)).toThrow(BufferfyRangeError);
			expect(() => codec.decode(buffer)).toThrow("Decoded value 15000 exceeds maximum 10000");
		});

		it("allows valid values on encode", () => {
			const codec = new BigUIntBECodec({ minimum: 1000n, maximum: 10000n });

			expect(() => codec.encode(5000n)).not.toThrow();
			expect(() => codec.encode(1000n)).not.toThrow();
			expect(() => codec.encode(10000n)).not.toThrow();
		});

		it("allows valid values on decode", () => {
			const codec = new BigUIntBECodec({ minimum: 1000n, maximum: 10000n });
			const validCodec = new BigUIntBECodec();

			expect(() => codec.decode(validCodec.encode(5000n))).not.toThrow();
			expect(() => codec.decode(validCodec.encode(1000n))).not.toThrow();
			expect(() => codec.decode(validCodec.encode(10000n))).not.toThrow();
		});
	});

	describe("validationMode: encode", () => {
		it("validates minimum on encode only", () => {
			const codec = new BigUIntBECodec({ minimum: 1000n, validationMode: "encode" });

			expect(() => codec.encode(500n)).toThrow(BufferfyRangeError);
		});

		it("validates maximum on encode only", () => {
			const codec = new BigUIntBECodec({ maximum: 10000n, validationMode: "encode" });

			expect(() => codec.encode(15000n)).toThrow(BufferfyRangeError);
		});

		it("does not validate on decode", () => {
			const codec = new BigUIntBECodec({ minimum: 1000n, maximum: 10000n, validationMode: "encode" });
			const validCodec = new BigUIntBECodec();

			expect(() => codec.decode(validCodec.encode(500n))).not.toThrow();
			expect(() => codec.decode(validCodec.encode(15000n))).not.toThrow();
		});
	});

	describe("validationMode: decode", () => {
		it("validates minimum on decode only", () => {
			const codec = new BigUIntBECodec({ minimum: 1000n, validationMode: "decode" });
			const validCodec = new BigUIntBECodec();
			const buffer = validCodec.encode(500n);

			expect(() => codec.decode(buffer)).toThrow(BufferfyRangeError);
		});

		it("validates maximum on decode only", () => {
			const codec = new BigUIntBECodec({ maximum: 10000n, validationMode: "decode" });
			const validCodec = new BigUIntBECodec();
			const buffer = validCodec.encode(15000n);

			expect(() => codec.decode(buffer)).toThrow(BufferfyRangeError);
		});

		it("does not validate on encode", () => {
			const codec = new BigUIntBECodec({ minimum: 1000n, maximum: 10000n, validationMode: "decode" });

			expect(() => codec.encode(500n)).not.toThrow();
			expect(() => codec.encode(15000n)).not.toThrow();
		});
	});

	describe("validationMode: none", () => {
		it("does not validate on encode", () => {
			const codec = new BigUIntBECodec({ minimum: 1000n, maximum: 10000n, validationMode: "none" });

			expect(() => codec.encode(500n)).not.toThrow();
			expect(() => codec.encode(15000n)).not.toThrow();
		});

		it("does not validate on decode", () => {
			const codec = new BigUIntBECodec({ minimum: 1000n, maximum: 10000n, validationMode: "none" });
			const validCodec = new BigUIntBECodec();

			expect(() => codec.decode(validCodec.encode(500n))).not.toThrow();
			expect(() => codec.decode(validCodec.encode(15000n))).not.toThrow();
		});
	});

	describe("isValid always validates", () => {
		it("validates regardless of validationMode: none", () => {
			const codec = new BigUIntBECodec({ minimum: 1000n, maximum: 10000n, validationMode: "none" });

			expect(codec.isValid(500n)).toBe(false);
			expect(codec.isValid(15000n)).toBe(false);
			expect(codec.isValid(5000n)).toBe(true);
		});

		it("validates regardless of validationMode: encode", () => {
			const codec = new BigUIntBECodec({ minimum: 1000n, maximum: 10000n, validationMode: "encode" });

			expect(codec.isValid(500n)).toBe(false);
			expect(codec.isValid(15000n)).toBe(false);
			expect(codec.isValid(5000n)).toBe(true);
		});

		it("validates regardless of validationMode: decode", () => {
			const codec = new BigUIntBECodec({ minimum: 1000n, maximum: 10000n, validationMode: "decode" });

			expect(codec.isValid(500n)).toBe(false);
			expect(codec.isValid(15000n)).toBe(false);
			expect(codec.isValid(5000n)).toBe(true);
		});
	});

	describe("works with different BigUInt variants", () => {
		it("validates BigUIntLE", () => {
			const codec = createBigUIntCodec("LE", { minimum: 1000n, maximum: 10000n });

			expect(() => codec.encode(500n)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(15000n)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(5000n)).not.toThrow();
		});
	});
});
