import { describe, expect, it } from "vitest";
import { Float32BECodec, createFloatCodec } from ".";
import { BufferfyRangeError } from "../../utilities/Error";

describe("Float validation with validationMode", () => {
	describe("validationMode: both (default)", () => {
		it("validates minimum on encode", () => {
			const codec = new Float32BECodec({ minimum: 10.5 });

			expect(() => codec.encode(5.2)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(5.2)).toThrow("Encoded value 5.2 is less than minimum 10.5");
		});

		it("validates maximum on encode", () => {
			const codec = new Float32BECodec({ maximum: 100.5 });

			expect(() => codec.encode(150.8)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(150.8)).toThrow("Encoded value 150.8 exceeds maximum 100.5");
		});

		it("validates minimum on decode", () => {
			const codec = new Float32BECodec({ minimum: 10.5 });
			const validCodec = new Float32BECodec();
			const buffer = validCodec.encode(5.2);

			expect(() => codec.decode(buffer)).toThrow(BufferfyRangeError);
		});

		it("validates maximum on decode", () => {
			const codec = new Float32BECodec({ maximum: 100.5 });
			const validCodec = new Float32BECodec();
			const buffer = validCodec.encode(150.8);

			expect(() => codec.decode(buffer)).toThrow(BufferfyRangeError);
		});

		it("allows valid values on encode", () => {
			const codec = new Float32BECodec({ minimum: 10.5, maximum: 100.5 });

			expect(() => codec.encode(50.5)).not.toThrow();
			expect(() => codec.encode(10.5)).not.toThrow();
			expect(() => codec.encode(100.5)).not.toThrow();
		});

		it("allows valid values on decode", () => {
			const codec = new Float32BECodec({ minimum: 10.5, maximum: 100.5 });
			const validCodec = new Float32BECodec();

			expect(() => codec.decode(validCodec.encode(50.5))).not.toThrow();
			expect(() => codec.decode(validCodec.encode(10.5))).not.toThrow();
			expect(() => codec.decode(validCodec.encode(100.5))).not.toThrow();
		});
	});

	describe("validationMode: encode", () => {
		it("validates minimum on encode only", () => {
			const codec = new Float32BECodec({ minimum: 10.5, validationMode: "encode" });

			expect(() => codec.encode(5.2)).toThrow(BufferfyRangeError);
		});

		it("validates maximum on encode only", () => {
			const codec = new Float32BECodec({ maximum: 100.5, validationMode: "encode" });

			expect(() => codec.encode(150.8)).toThrow(BufferfyRangeError);
		});

		it("does not validate on decode", () => {
			const codec = new Float32BECodec({ minimum: 10.5, maximum: 100.5, validationMode: "encode" });
			const validCodec = new Float32BECodec();

			expect(() => codec.decode(validCodec.encode(5.2))).not.toThrow();
			expect(() => codec.decode(validCodec.encode(150.8))).not.toThrow();
		});
	});

	describe("validationMode: decode", () => {
		it("validates minimum on decode only", () => {
			const codec = new Float32BECodec({ minimum: 10.5, validationMode: "decode" });
			const validCodec = new Float32BECodec();
			const buffer = validCodec.encode(5.2);

			expect(() => codec.decode(buffer)).toThrow(BufferfyRangeError);
		});

		it("validates maximum on decode only", () => {
			const codec = new Float32BECodec({ maximum: 100.5, validationMode: "decode" });
			const validCodec = new Float32BECodec();
			const buffer = validCodec.encode(150.8);

			expect(() => codec.decode(buffer)).toThrow(BufferfyRangeError);
		});

		it("does not validate on encode", () => {
			const codec = new Float32BECodec({ minimum: 10.5, maximum: 100.5, validationMode: "decode" });

			expect(() => codec.encode(5.2)).not.toThrow();
			expect(() => codec.encode(150.8)).not.toThrow();
		});
	});

	describe("validationMode: none", () => {
		it("does not validate on encode", () => {
			const codec = new Float32BECodec({ minimum: 10.5, maximum: 100.5, validationMode: "none" });

			expect(() => codec.encode(5.2)).not.toThrow();
			expect(() => codec.encode(150.8)).not.toThrow();
		});

		it("does not validate on decode", () => {
			const codec = new Float32BECodec({ minimum: 10.5, maximum: 100.5, validationMode: "none" });
			const validCodec = new Float32BECodec();

			expect(() => codec.decode(validCodec.encode(5.2))).not.toThrow();
			expect(() => codec.decode(validCodec.encode(150.8))).not.toThrow();
		});
	});

	describe("isValid always validates", () => {
		it("validates regardless of validationMode: none", () => {
			const codec = new Float32BECodec({ minimum: 10.5, maximum: 100.5, validationMode: "none" });

			expect(codec.isValid(5.2)).toBe(false);
			expect(codec.isValid(150.8)).toBe(false);
			expect(codec.isValid(50.5)).toBe(true);
		});

		it("validates regardless of validationMode: encode", () => {
			const codec = new Float32BECodec({ minimum: 10.5, maximum: 100.5, validationMode: "encode" });

			expect(codec.isValid(5.2)).toBe(false);
			expect(codec.isValid(150.8)).toBe(false);
			expect(codec.isValid(50.5)).toBe(true);
		});

		it("validates regardless of validationMode: decode", () => {
			const codec = new Float32BECodec({ minimum: 10.5, maximum: 100.5, validationMode: "decode" });

			expect(codec.isValid(5.2)).toBe(false);
			expect(codec.isValid(150.8)).toBe(false);
			expect(codec.isValid(50.5)).toBe(true);
		});
	});

	describe("works with different Float variants", () => {
		it("validates Float32LE", () => {
			const codec = createFloatCodec(32, "LE", { minimum: 10.5, maximum: 100.5 });

			expect(() => codec.encode(5.2)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(150.8)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(50.5)).not.toThrow();
		});

		it("validates Float64BE", () => {
			const codec = createFloatCodec(64, "BE", { minimum: 10.5, maximum: 100.5 });

			expect(() => codec.encode(5.2)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(150.8)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(50.5)).not.toThrow();
		});

		it("validates Float64LE", () => {
			const codec = createFloatCodec(64, "LE", { minimum: 10.5, maximum: 100.5 });

			expect(() => codec.encode(5.2)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(150.8)).toThrow(BufferfyRangeError);
			expect(() => codec.encode(50.5)).not.toThrow();
		});
	});
});
