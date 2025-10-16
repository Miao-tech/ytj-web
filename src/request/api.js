import request from './request.js';

// 打开LED
export const APIOpenLED = (numbers) => request(`/api/open_led?numbers=${numbers}`);

// 关闭LED
export const APICloseLED = (numbers) => request(`/api/close_led?numbers=${numbers}`);

// 得到温湿度
export const APIGetTemperature = () => request('/api/get_temperature');

// 得到手势传感器
export const APIGetGesture = () => request('/api/get_gesture');

// 得到距离
export const APIGetDistance = () => request('/api/get_distance');

// 得到灯光
export const APIGetLight = () => request('/api/get_light');

// 打开OCC
export const APIOpenOCC = () => request('/api/open_occ');

// 关闭OCC
export const APICloseOCC = () => request('/api/close_occ');

// 打开电阻
export const APIOpenResistense = () => request('/api/open_resistense');

// 关闭万用表
export const APICloseMultimeter = () => request('/api/close_multimeter');

// 打开直流电压
export const APIOpenDCV = () => request('/api/open_dcv');

// 打开交流电压
export const APIOpenACV = () => request('/api/open_acv');

// 打开直流电流
export const APIOpenDCA = () => request('/api/open_dca');

// 打开控制
export const APIOpenCont = () => request('/api/open_cont');

// 电源开启
export const APIPowerSupplyOn = () => request('/api/power_supply_on');

// 电源关闭
export const APIPowerSupplyOff = () => request('/api/power_supply_off');

// 设置电压
export const APISetVoltage = (voltage) => request('/api/set_voltage?voltage=' + voltage);

// 设置波形
export const APISetWaveform = (waveform = null, frequency = null) => {
    if (waveform === null && frequency === null) {
        return request(`/api/set_waveform`);
    } else {
        return request(`/api/set_waveform?waveform=${waveform}&frequency=${frequency}`);
    }
}

// 信号发生器停止
export const APISignalGeneratorStop = () => request('/api/signal_generator_stop');

// 触发蜂鸣器
export const APITriggerBuzzer = () => request('/api/trigger_buzzer');

// 获取3个红外传感器状态（三合一传感器，只需获取状态，不需要启动/停止）
export const APIGetInfraredSensors = () => request('/api/get_infrared_sensors');

// export default {}
