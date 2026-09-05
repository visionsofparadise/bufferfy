export const varIntByteLengthOf = (value: number, thresholds: Array<number>, maximumByteLength: number): number => {
	for (let thresholdIndex = 0; thresholdIndex < thresholds.length; thresholdIndex++) {
		if (value < thresholds[thresholdIndex]) return thresholdIndex + 1;
	}

	return maximumByteLength;
};
