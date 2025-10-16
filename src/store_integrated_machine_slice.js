import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    // 温度和湿度
    temperature: 0,
    humidity: 0,

    // 手势、超声波、光照强度传感器
    gestureSensor: 0,
    infraredSensor: 0, // 实际上是超声波传感器，变量名保持不变以保持兼容性
    lightIntensitySensor: 0,
    buzzer: 0, // 蜂鸣器时间（0-255ms）

    // LED
    led1: false,
    led2: false,
    led3: false,
    led4: false,
    led5: false,
    led6: false,
    led7: false,
    led8: false,
    led9: false,
    led10: false,
    led11: false,

    // 万用表
    multimeterValue: '---',
    multimeterUnit: '',

    // 示波器
    oscilloscope: {
        isRunning: false,
        isConnected: false
    },

     // 电源数据
     powerSupply: {
        setVoltage: 2.0,
        actualVoltage: 0.0,
        outputEnabled: false,
        isConnected: false
    },
    // 信号发生器数据
    signalGenerator: {
        waveform: 'sine',
        frequency: 1,
        amplitude: 1.0,
        dcOffset: 0.0,
        outputEnabled: false,
        isConnected: false
    },
}

export const storeIntegratedMachineSlice = createSlice({
    name: 'integratedmachine',
    initialState,
    reducers: {
        // 设置手势传感器
        setGestureSensor: (state, action) => {
            state.gestureSensor = action.payload
        },
        // 设置超声波传感器（变量名保持 infraredSensor 以保持兼容性）
        setInfraredSensor: (state, action) => {
            state.infraredSensor = action.payload
        },
        // 设置光照强度传感器
        setLightIntensitySensor: (state, action) => {
            state.lightIntensitySensor = action.payload
        },
        // 设置蜂鸣器
        setBuzzer: (state, action) => {
            state.buzzer = action.payload
        },
        // 设置温度
        setTemperature: (state, action) => {
            state.temperature = action.payload
        },
        // 设置湿度
        setHumidity: (state, action) => {
            state.humidity = action.payload
        },
        // 打开LED
        open_led: (state, action) => {
            console.log(action.payload.number)
            state['led' + action.payload.number] = true
        },
        // 关闭LED
        close_led: (state, action) => {
            state['led' + action.payload.number] = false
        },
        // 设置万用表数值和单位
        setMultimeterData: (state, action) => {
            state.multimeterValue = action.payload.value;
            state.multimeterUnit = action.payload.unit;
        },

        // 设置示波器运行状态
        setOscilloscopeRunning: (state, action) => {
            state.oscilloscope.isRunning = action.payload;
        },

        // 设置示波器连接状态
        setOscilloscopeConnection: (state, action) => {
            state.oscilloscope.isConnected = action.payload;
        },

        // 设置电源数据
        setPowerSupplyData: (state, action) => {
            const { setVoltage, actualVoltage, outputEnabled } = action.payload;
            
            if (setVoltage !== undefined) state.powerSupply.setVoltage = setVoltage;
            if (actualVoltage !== undefined) state.powerSupply.actualVoltage = actualVoltage;
            if (outputEnabled !== undefined) state.powerSupply.outputEnabled = outputEnabled;
            
            // state.devices.lastUpdate = new Date().toISOString();
        },

        // 设置电源输出状态
        setPowerSupplyOutput: (state, action) => {
            state.powerSupply.outputEnabled = action.payload;
            if (!action.payload) {
                // 关闭输出时清零实际值
                state.powerSupply.actualVoltage = 0.0;
            }
        },

        // 设置电源连接状态
        setPowerSupplyConnection: (state, action) => {
            state.powerSupply.isConnected = action.payload;
        },

        // 设置信号发生器数据
        setSignalGeneratorData: (state, action) => {
            const { waveform, frequency, amplitude, dcOffset, outputEnabled } = action.payload;
            
            if (waveform !== undefined) state.signalGenerator.waveform = waveform;
            if (frequency !== undefined) state.signalGenerator.frequency = frequency;
            if (amplitude !== undefined) state.signalGenerator.amplitude = amplitude;
            if (dcOffset !== undefined) state.signalGenerator.dcOffset = dcOffset;
            if (outputEnabled !== undefined) state.signalGenerator.outputEnabled = outputEnabled;
        },

        // 设置信号发生器输出状态
        setSignalGeneratorOutput: (state, action) => {
            state.signalGenerator.outputEnabled = action.payload;
        }
    },
})

export const {
    setGestureSensor,
    setInfraredSensor,
    setLightIntensitySensor,
    setBuzzer,
    setHumidity,
    setTemperature,
    open_led,
    close_led,
    setMultimeterData,
    setOscilloscopeRunning,
    setOscilloscopeConnection,
    setPowerSupplyData,
    setPowerSupplyOutput,
    setPowerSupplyConnection,
    setSignalGeneratorData,
    setSignalGeneratorOutput
} = storeIntegratedMachineSlice.actions
export default storeIntegratedMachineSlice.reducer
