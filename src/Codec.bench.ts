import { createBenchmark } from "./utilities/benchmark";
import { CommonCodec, commonValue, SpreadCodec, spreadValue } from "./utilities/TestValues.ignore";

createBenchmark("Spread", spreadValue, SpreadCodec);
createBenchmark("Common", commonValue, CommonCodec);
