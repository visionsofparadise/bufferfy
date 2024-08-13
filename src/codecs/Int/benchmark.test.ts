import { Codec } from "../..";
import { benchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";

const codec = Codec.Int(8);

const integer: CodecType<typeof codec> = -27;

it("benchmarks for integer", () => {
	benchmark("integer", integer, codec);

	expect(true).toStrictEqual(true);
});
