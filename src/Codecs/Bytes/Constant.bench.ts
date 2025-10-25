import { createBenchmark } from "../../utilities/benchmark";
import { BytesConstantCodec } from "./Constant";

const value = new Uint8Array(16).fill(0);
const codec = new BytesConstantCodec(value);

createBenchmark("BytesConstant", value, codec);
