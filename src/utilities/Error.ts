export class BufferfyError extends Error {}

export class BufferfyByteLengthError extends BufferfyError {
	constructor() {
		super("Buffer is not of sufficient byteLength to decode.");
	}
}
