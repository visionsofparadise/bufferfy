import { TransformCodec } from ".";
import { createBenchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";
import { BooleanCodec } from "../Boolean";

const codec = new TransformCodec(new BooleanCodec(), {
	decode: (boolean) => {
		if (boolean === true) return 1;
		if (boolean === false) return 0;

		throw new Error("Invalid value");
	},
	encode: (value) => {
		if (value !== 1 && value !== 0) throw new Error("Invalid value");

		return value === 1;
	},
});
const value: CodecType<typeof codec> = 1;

createBenchmark("Transform", value, codec);
