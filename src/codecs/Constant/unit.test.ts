import { ConstantCodec } from ".";
import { Context } from "../../utilities/Context";

const context = new Context();

const constant = "test";

const codec = new ConstantCodec(constant);

it("matches constant", () => {
	const isMatch = codec.match(constant, context);

	expect(isMatch).toBe(true);
});

it("does not match not constant", () => {
	const isMatch = codec.match(null, context);

	expect(isMatch).toBe(false);
});

it("returns size of constant", () => {
	const size = codec.encodingLength(constant, context);

	expect(size).toBe(0);
});

describe("encodes then decodes constant", () => {
	it("encodes constant", () => {
		codec.write(constant, {} as any, context);

		expect(true).toBe(true);
	});

	it("decodes constant", () => {
		const value = codec.read({} as any, context);

		expect(value).toBe(constant);
	});
});
