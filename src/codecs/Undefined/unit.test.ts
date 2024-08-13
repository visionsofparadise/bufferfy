import { UndefinedCodec } from ".";
import { Context } from "../../utilities/Context";

const context = new Context();

const codec = new UndefinedCodec();

it("matches undefined", () => {
	const isMatch = codec.match(undefined, context);

	expect(isMatch).toBe(true);
});

it("does not match not undefined", () => {
	const isMatch = codec.match(null, context);

	expect(isMatch).toBe(false);
});

it("returns size of undefined", () => {
	const size = codec.encodingLength(undefined, context);

	expect(size).toBe(0);
});

describe("encodes then decodes undefined", () => {
	it("encodes undefined", () => {
		codec.write(undefined, {} as any, context);

		expect(true).toBe(true);
	});

	it("decodes undefined", () => {
		const value = codec.read({} as any, context);

		expect(value).toBe(undefined);
	});
});
