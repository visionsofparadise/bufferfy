import { Codec } from "../..";
import { benchmark } from "../../utilities/benchmark";

const codec = Codec.Null();

it("benchmarks for null", () => {
	benchmark("null", null, codec);

	expect(true).toStrictEqual(true);
});
