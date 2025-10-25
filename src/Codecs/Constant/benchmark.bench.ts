import { ConstantCodec } from ".";
import { createBenchmark } from "../../utilities/benchmark";

const value = null;
const codec = new ConstantCodec(value);

createBenchmark("Constant", value, codec);
