import request from './request.js';

// 打开LED
export const APIOpenLED = (numbers) => request(`/open_led?numbers=${numbers}`);

// 关闭LED
export const APICloseLED = (numbers) => request(`/close_led?numbers=${numbers}`);

// 得到温湿度
export const APIGetTemperature = () => request('/get_temperature');

// 得到手势传感器
export const APIGetGesture = () => request('/get_gesture');

// 得到距离
export const APIGetDistance = () => request('/get_distance');

// 得到灯光
export const APIGetLight = () => request('/get_light');

// 打开OCC
export const APIOpenOCC = () => request('/open_occ');

// 关闭OCC
export const APICloseOCC = () => request('/close_occ');

// 打开电阻
export const APIOpenResistense = () => request('/open_resistense');

// 关闭万用表
export const APICloseMultimeter = () => request('/close_multimeter');

// 打开直流电压
export const APIOpenDCV = () => request('/open_dcv');

// 打开交流电压
export const APIOpenACV = () => request('/open_acv');

// 打开直流电流
export const APIOpenDCA = () => request('/open_dca');

// 打开控制
export const APIOpenCont = () => request('/open_cont');

// 电源开启
export const APIPowerSupplyOn = () => request('/power_supply_on');

// 电源关闭
export const APIPowerSupplyOff = () => request('/power_supply_off');

// 设置电压
export const APISetVoltage = (voltage) => request('/set_voltage?voltage=' + voltage);

// 设置波形
export const APISetWaveform = (waveform = null, frequency = null) => {
    if (waveform === null && frequency === null) {
        return request(`/set_waveform`);
    } else {
        return request(`/set_waveform?waveform=${waveform}&frequency=${frequency}`);
    }
}

// 信号发生器停止
export const APISignalGeneratorStop = () => request('/signal_generator_stop');

// export default {}
