export type DecodeCommand = (streamUpdate: string) => DecodeCommandResult;

export type DecodeCommandInput = {
    streamUpdate: string;
};

export type DecodeCommandResult = ParseBatteryResult & ParseEnvironmentResult;

export type SensorModel = {
    modelName: string;
    functions: ModelFunctions;
    offsets: ModelOffsets;
};

type ModelFunctions = {
    [key in "battery" | "environment"]: ReadingParser;
} &
    {
        [key in "validator"]: SensorDataValidator;
    };

type ModelOffsets = {
    envStart: number;
    envEnd: number;
    batStart: number;
    batEnd: number;
};

type ParseBatteryResult = { battery: number };

type ParseEnvironmentResult = {
    humidity: number;
    tempInC: number;
    tempInF: number;
};

type ReadingParser = (
    streamUpdate: string,
    offset: ModelOffsets
) => ParseBatteryResult | ParseEnvironmentResult;

type SensorDataValidator = (streamUpdate: string) => boolean;

export const parseEnvLsbTc: ReadingParser = (streamUpdate, offset) => {
    const { envStart, envEnd } = offset;
    const environmentData = streamUpdate.substring(envStart, envEnd);

    const temp_lsb = reverseHexBytes(environmentData.substring(0, 4));
    const hum_lsb = reverseHexBytes(environmentData.substring(4, 8));

    const tempInC = twos_complement(parseInt(temp_lsb, 16)) / 100;
    const tempInF = tempC2F(tempInC);
    const humidity = parseInt(hum_lsb, 16) / 100;

    return {
        humidity,
        tempInC,
        tempInF,
    };
};

export const parseEnvLsbTcExtended: ReadingParser = (streamUpdate, offset) => {
    const { envStart, envEnd } = offset;
    const environmentData = streamUpdate.substring(envStart, envEnd);

    const env_basis = environmentData.substring(2, 4);
    const temp_lsb = environmentData.substring(0, 2).concat(env_basis);
    const hum_lsb = environmentData.substring(4, 6).concat(env_basis);

    const tempInC = twos_complement(parseInt(temp_lsb, 16)) / 100;
    const tempInF = tempC2F(tempInC);
    const humidity = parseInt(hum_lsb, 16) / 100;

    return {
        humidity,
        tempInC,
        tempInF,
    };
};

export const parseEnvBitwiseAnd: ReadingParser = (streamUpdate, offset) => {
    const { envStart, envEnd } = offset;

    let environmentData = parseInt(
        streamUpdate.substring(envStart, envEnd),
        16
    );

    let tempIsNegative = false;
    if (environmentData & 0x800000) {
        tempIsNegative = true;
        environmentData = environmentData ^ 0x800000;
    }

    let tempInC = environmentData / 10000;
    if (tempIsNegative) {
        tempInC = 0 - tempInC;
    }
    const tempInF = tempC2F(tempInC);
    const humidity = (environmentData % 1000) / 10;

    return {
        humidity,
        tempInC,
        tempInF,
    };
};

export const parseBatTwoChar: ReadingParser = (streamUpdate, offset) => {
    const { batStart, batEnd } = offset;
    return {
        battery: parseInt(streamUpdate.substring(batStart, batEnd), 16),
    };
};

const reverseHexBytes = (bytes: string): string => {
    if (bytes.length % 2 !== 0) {
        throw new Error(
            `Cannot reverse an odd number of bytes (got ${bytes.length})`
        );
    }
    let byteList: string[] = [];
    for (let i = 0; i < bytes.length; i += 2) {
        byteList.push(bytes.substring(i, i + 2));
    }
    return byteList.reverse().join("");
};

const tempC2F = (tempInC: number): number => {
    return (tempInC * 9) / 5 + 32;
};

const twos_complement = (n: number, w: number = 16): number => {
    // Adapted from: https://stackoverflow.com/a/33716541.
    if (n & (1 << (w - 1))) {
        n = n - (1 << w);
    }
    return n;
};
