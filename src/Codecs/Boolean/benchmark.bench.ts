import { BooleanCodec } from ".";
import { createBenchmark } from "../../utilities/benchmark";

createBenchmark("Boolean", true, new BooleanCodec());
