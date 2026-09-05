import { STRING_MATCHER, type CodecMatcher } from "../../utilities/matcher";
import { AbstractCodec } from "../Abstract";

export abstract class AbstractStringCodec extends AbstractCodec<string> {
	isValid(value: unknown): value is string {
		return typeof value === "string";
	}

	override get matcher(): CodecMatcher {
		return STRING_MATCHER;
	}
}
