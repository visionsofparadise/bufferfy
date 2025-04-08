import { RecursiveCodec } from ".";
import { ConstantCodec } from "../Constant";
import { ObjectCodec } from "../Object";
import { UnionCodec } from "../Union";

describe("correctly performs recursive codec methods", () => {
	const value = {
		self: {
			self: {
				self: null,
			},
		},
	};
	const codec = new RecursiveCodec(
		(self) =>
			new ObjectCodec({
				self: new UnionCodec([self, new ConstantCodec(null)]),
			})
	);
	const byteLength = 3;

	it("valid for recursive", () => {
		const isValid = codec.isValid(value);

		expect(isValid).toBe(true);
	});

	it("invalid for not recursive", () => {
		const isValid = codec.isValid(true);

		expect(isValid).toBe(false);
	});

	it("returns byteLength of recursive", () => {
		const resultByteLength = codec.byteLength(value);

		expect(resultByteLength).toBe(byteLength);
	});

	it("encodes recursive to buffer", async () => {
		const buffer = codec.encode(value);

		expect(buffer.byteLength).toBe(byteLength);
	});

	it("decodes recursive from buffer", async () => {
		const buffer = codec.encode(value);

		const result = codec.decode(buffer);

		expect(result).toStrictEqual(value);
	});
});
