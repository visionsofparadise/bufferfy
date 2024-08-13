import { Codec } from "../..";
import { benchmark } from "../../utilities/benchmark";

const constant = "test";

const codec = Codec.Constant(constant);

it("benchmarks for constant", () => {
	benchmark("constant", constant, codec);

	expect(true).toStrictEqual(true);
});
