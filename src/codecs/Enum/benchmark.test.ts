import { Codec } from "../..";
import { benchmark } from "../../utilities/benchmark";

const values = ["1", 2, "test"];

const codec = Codec.Enum(values, { indexCodec: Codec.UInt(8) });

it("benchmarks for enum", () => {
	benchmark("enum", values[2], codec);

	expect(true).toStrictEqual(true);
});
