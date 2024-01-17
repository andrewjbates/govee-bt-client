import { isHt5074, isHt5075, isHt5101, isHt5179 } from "./validation";
import {
    DecodeCommand,
    DecodeCommandResult,
    SensorModel,
    parseBatTwoChar,
    parseEnvBitwiseAnd,
    parseEnvLsbTc,
    parseEnvLsbTcExtended,
} from "./parsing";

const models: SensorModel[] = [
    {
        modelName: "H5074",
        functions: {
            validator: isHt5074,
            environment: parseEnvLsbTc,
            battery: parseBatTwoChar,
        },
        offsets: {
            envStart: 6,
            envEnd: 14,
            batStart: 14,
            batEnd: 16,
        },
    },
    {
        modelName: "H5075",
        functions: {
            validator: isHt5075,
            environment: parseEnvBitwiseAnd,
            battery: parseBatTwoChar,
        },
        offsets: {
            envStart: 6,
            envEnd: 12,
            batStart: 12,
            batEnd: 14,
        },
    },
    {
        modelName: "H5101",
        functions: {
            validator: isHt5101,
            environment: parseEnvBitwiseAnd,
            battery: parseBatTwoChar,
        },
        offsets: {
            envStart: 8,
            envEnd: 14,
            batStart: 14,
            batEnd: 16,
        },
    },
    {
        modelName: "H5179",
        functions: {
            validator: isHt5179,
            environment: parseEnvLsbTcExtended,
            battery: parseBatTwoChar,
        },
        offsets: {
            envStart: 14,
            envEnd: 20,
            batStart: 20,
            batEnd: 22,
        },
    },
];

export const decodeAny: DecodeCommand = (streamUpdate) => {
    for (let i = 0; i < models.length; i++) {
        const { modelName, functions, offsets } = models[i];
        if (functions.validator(streamUpdate)) {
            return {
                ...functions.environment(streamUpdate, offsets),
                ...functions.battery(streamUpdate, offsets),
            } as DecodeCommandResult;
        }
    }

    throw new Error(
        `Unsupported stream update (len: ${streamUpdate.length}): ${streamUpdate}`
    );
};

export const decodeH5074Values: DecodeCommand = (streamUpdate) => {
    return decodeValuesForModel("H5074", streamUpdate);
};

export const decodeH5075Values: DecodeCommand = (streamUpdate) => {
    return decodeValuesForModel("H5075", streamUpdate);
};

export const decodeH5101Values: DecodeCommand = (streamUpdate) => {
    return decodeValuesForModel("H5101", streamUpdate);
};

export const decodeH5179Values: DecodeCommand = (streamUpdate) => {
    return decodeValuesForModel("H5179", streamUpdate);
};

const decodeValuesForModel = (model: string, streamUpdate: string) => {
    const modelObj = models.filter((m) => m.modelName == model)[0];
    const { functions, offsets } = modelObj;
    return {
        ...functions.environment(streamUpdate, offsets),
        ...functions.battery(streamUpdate, offsets),
    } as DecodeCommandResult;
};
