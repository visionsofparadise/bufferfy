import { ConstantCodec } from ".";

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
		const resultByteLength = codec.byteLength();

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes null to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes null from buffer", async () => {
		const result = codec.decode(Uint8Array.from([]));

		expect(result).toBe(value);
	});
});
