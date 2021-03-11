"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decode_1 = require("./decode");
const validationMatrix_1 = require("./validationMatrix");
it("should decode H5074 values", () => {
    // sources: https://github.com/wcbonner/GoveeBTTempLogger/blob/master/goveebttemplogger.cpp#L206
    //          https://github.com/neilsheps/GoveeTemperatureAndHumidity
    // 88EC00 0902 CD15 64 02 (Temp) 41.378°F (Humidity) 55.81% (Battery) 100%
    //                                5.21 C
    const hex = "88EC000902CD156402";
    const expectedReading = {
        battery: 100,
        humidity: 55.81,
        tempInC: 5.21,
        tempInF: 41.378,
    };
    const reading = decode_1.decodeH5074Values(hex);
    expect(reading).toMatchObject(expectedReading);
});
it("should decode H5075 values", () => {
    const hex = "88ec000368d15800";
    const expectedReading = {
        battery: 88,
        humidity: 44.1,
        tempInC: 22.3441,
        tempInF: 72.21938,
    };
    const reading = decode_1.decodeH5075Values(hex);
    expect(reading).toMatchObject(expectedReading);
});
it("should decode H5101 values", () => {
    const hex = "0100010103165564";
    const expectedReading = {
        battery: 100,
        humidity: 32.5,
        tempInC: 20.2325,
        tempInF: 68.41850000000001,
    };
    const reading = decode_1.decodeH5101Values(hex);
    expect(reading).toMatchObject(expectedReading);
});
it("should decode H5179 values", () => {
    const hex = "0188ec0001012e09740e64";
    const expectedReading = {
        battery: 100,
        humidity: 37,
        tempInC: 24.2,
        tempInF: 75.56,
    };
    const reading = decode_1.decodeH5179Values(hex);
    expect(reading).toMatchObject(expectedReading);
});
describe("test matrix", () => {
    test("decode from any supported device", () => {
        validationMatrix_1.validationMatrix.forEach((x) => {
            const decodedResult = decode_1.decodeAny(x.mfgData);
            expect(decodedResult).toMatchSnapshot();
        });
    });
    describe("pass heuristics", () => {
        let decodedResults = {};
        beforeAll(() => {
            validationMatrix_1.validationMatrix.forEach((x) => {
                decodedResults[x.mfgData] = decode_1.decodeAny(x.mfgData);
            });
        });
        test("battery between 0 and 100", () => {
            validationMatrix_1.validationMatrix.forEach((x) => {
                const battery = decodedResults[x.mfgData].battery;
                expect(battery).toBeGreaterThanOrEqual(0);
                expect(battery).toBeLessThanOrEqual(100);
            });
        });
        test("humidity between 0 and 100", () => {
            validationMatrix_1.validationMatrix.forEach((x) => {
                const humidity = decodedResults[x.mfgData].humidity;
                expect(humidity).toBeGreaterThanOrEqual(0);
                expect(humidity).toBeLessThanOrEqual(100);
            });
        });
        test("temperature between -20F and 140F", () => {
            validationMatrix_1.validationMatrix.forEach((x) => {
                const tempInF = decodedResults[x.mfgData].tempInF;
                expect(tempInF).toBeGreaterThanOrEqual(-20);
                expect(tempInF).toBeLessThanOrEqual(140);
            });
        });
    });
});