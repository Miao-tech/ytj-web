import { store } from '../store';
import {
    setGestureSensor,
    setInfraredSensor,
    setLightIntensitySensor,
    setBuzzer,
    setTemperature,
    setHumidity,
    open_led,
    close_led,
    setMultimeterData,
    setPowerSupplyData,
    setSignalGeneratorData,
    setOscilloscopeRunning
} from '../store_integrated_machine_slice';

import {
    APIGetTemperature,
    APIGetDistance,
    APIGetLight,
} from './api';

class WebSocketManager {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // 1秒
        this.isConnected = false;
        this.oscilloscopeListeners = new Set();
        this.temperatureTimer = null; // 添加温湿度定时器

        this.init();
    }

    init() {
        this.connect();
    }

    connect() {
        try {
            const wsUrl = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:8000/ws';
            this.socket = new WebSocket(wsUrl);
            this.setupEventListeners();
        } catch (error) {
            console.error('WebSocket连接失败:', error);
            this.handleReconnect();
        }
    }

    setupEventListeners() {
        this.socket.addEventListener('open', this.handleOpen.bind(this));
        this.socket.addEventListener('message', this.handleMessage.bind(this));
        this.socket.addEventListener('close', this.handleClose.bind(this));
        this.socket.addEventListener('error', this.handleError.bind(this));
    }

    handleOpen(event) {
        console.log('WebSocket连接已打开');
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // 延迟获取初始数据，避免设备冲突
        this.scheduleInitialDataFetch();
    }

    // 分批获取初始化信息
    scheduleInitialDataFetch() {
        // 分批获取初始数据，避免同时请求
        APIGetTemperature();
        APIGetDistance();
        APIGetLight();
    }

    /**
     * Handles incoming message events by processing the data and updating the store if valid.
     * @param {Event} event - The message event containing data to be processed.
     * @private
     */
    handleMessage(event) {
        // console.log('收到消息:', event.data);
        
        // 尝试解析JSON消息（状态更新等）
        try {
            const jsonData = JSON.parse(event.data);
            
            // 处理状态更新消息
            if (jsonData.type === 'state_update') {
                console.log('🔄 收到设备状态更新:', jsonData.data);
                this.handleStateUpdate(jsonData.data);
                return;
            }
            
            // 处理其他JSON消息类型
            if (jsonData.type === 'led_state_sync') {
                console.log('🔄 收到LED状态同步:', jsonData.led_states);
                this.handleLedStateSync(jsonData.led_states);
                return;
            }
            
        } catch (e) {
            // 如果不是JSON消息，按原来的方式处理（十六进制数据）
        }
        
        // 处理十六进制数据
        const result = this.processData(event.data);
        if (result) {
            this.updateStore(result);
        }
    }

    /**
     * 处理设备状态更新
     */
    handleStateUpdate(stateData) {
        console.log('📱 处理设备状态更新:', stateData);
        
        // 更好的方式：直接更新Redux store，而不是刷新页面
        this.updateStoreFromStateData(stateData);
        
        // 发出自定义事件，让组件知道状态已更新（可选）
        window.dispatchEvent(new CustomEvent('deviceStateUpdate', {
            detail: stateData
        }));
        
        // 如果你确实需要刷新页面，可以取消注释下面这行：
        // window.location.reload();
    }

    /**
     * 根据状态数据更新Redux store
     */
    updateStoreFromStateData(stateData) {
        try {
            console.log('🔄 开始更新Redux store:', stateData);
            
            // 更新LED状态
            if (stateData.led_states) {
                Object.entries(stateData.led_states).forEach(([ledNum, isOn]) => {
                    const action = isOn ? open_led : close_led;
                    store.dispatch(action({ number: parseInt(ledNum) }));
                    console.log(`✅ 已更新LED${ledNum}状态: ${isOn ? '开启' : '关闭'}`);
                });
            }
            
            // 📊 更新示波器状态 - 根据 last_stream_common 判断
            if (stateData.last_stream_common) {
                const command_hex = stateData.last_stream_common.toLowerCase();
                if (command_hex === "080001fe") { // 示波器开启指令
                    store.dispatch(setOscilloscopeRunning(true));
                    console.log(`✅ 已更新示波器状态: 运行中`);
                    
                    // 发出示波器状态更新事件
                    window.dispatchEvent(new CustomEvent('deviceStateUpdate', {
                        detail: {
                            device_type: 'oscilloscope',
                            device_state: 'opened',
                            device_name: '示波器'
                        }
                    }));
                }
                // 🔬 处理万用表状态更新 - 根据命令前缀判断
                else if (command_hex.startsWith('02') || command_hex.startsWith('03') ||
                         command_hex.startsWith('04')) {

                    const multimeterModeMap = {
                        '02': 'RES',    // 电阻档
                        '03': 'CONT',   // 通断档
                        '04': 'DCV'     // 直流电压档
                    };
                    
                    const device_prefix = command_hex.substring(0, 2);
                    const mode = multimeterModeMap[device_prefix];
                    
                    if (mode) {
                        console.log(`🔬 检测到万用表开启状态: ${mode}档`);
                        
                        // 发出万用表状态更新事件
                        window.dispatchEvent(new CustomEvent('deviceStateUpdate', {
                            detail: {
                                device_type: 'multimeter',
                                device_state: 'opened',
                                device_name: '万用表',
                                multimeter_mode: mode,
                                is_on: true
                            }
                        }));
                    }
                }
            } else {
                // last_stream_common 为 null 表示设备关闭
                store.dispatch(setOscilloscopeRunning(false));
                console.log(`✅ 已更新示波器状态: 已停止`);
                
                // 清空万用表数据
                store.dispatch(setMultimeterData({ value: null, unit: null }));
                console.log(`✅ 已清空万用表数据`);
                
                // 发出设备关闭事件
                window.dispatchEvent(new CustomEvent('deviceStateUpdate', {
                    detail: {
                        device_type: 'all_devices',
                        device_state: 'closed',
                        device_name: '所有设备'
                    }
                }));
                
                // 发出万用表关闭事件
                window.dispatchEvent(new CustomEvent('deviceStateUpdate', {
                    detail: {
                        device_type: 'multimeter',
                        device_state: 'closed',
                        device_name: '万用表',
                        is_on: false
                    }
                }));
            }
            
            // 📊 更新示波器状态 - 处理直接的device_type字段（兼容性）
            if (stateData.device_type === 'oscilloscope' || stateData.device === 'oscilloscope') {
                const isRunning = stateData.device_state === 'opened' || stateData.state === 'opened';
                store.dispatch(setOscilloscopeRunning(isRunning));
                console.log(`✅ 已更新示波器状态(兼容模式): ${isRunning ? '运行中' : '已停止'}`);
                
                // 发出示波器状态更新事件
                window.dispatchEvent(new CustomEvent('deviceStateUpdate', {
                    detail: {
                        device_type: 'oscilloscope',
                        device_state: stateData.device_state || stateData.state,
                        device_name: '示波器'
                    }
                }));
            }
            
            // 🔋 更新电源状态 - 根据 device_type 判断
            if (stateData.device_type === 'power_supply' || stateData.device === 'power_supply') {
                console.log(`🔋 检测到电源状态变化:`, stateData.power_supply_state);
                
                if (stateData.power_supply_state) {
                    const powerState = stateData.power_supply_state;
                    
                    // 更新Redux中的电源状态
                    store.dispatch(setPowerSupplyData({
                        setVoltage: powerState.setVoltage,
                        actualVoltage: powerState.actualVoltage,
                        outputEnabled: powerState.outputEnabled
                    }));
                    
                    console.log(`✅ 已更新电源状态: 输出${powerState.outputEnabled ? '开启' : '关闭'}, 设置电压${powerState.setVoltage}V, 实际电压${powerState.actualVoltage}V`);
                    
                    // 发出电源状态更新事件，让组件更新UI状态
                    window.dispatchEvent(new CustomEvent('deviceStateUpdate', {
                        detail: {
                            device_type: 'power_supply',
                            device_state: stateData.device_state || stateData.state,
                            device_name: stateData.device_name || '直流电源',
                            power_supply_state: powerState
                        }
                    }));
                }
            }
            
            // 🔋 处理电源状态变化 - 通用处理（兼容性）
            if (stateData.power_supply_state) {
                const powerState = stateData.power_supply_state;
                console.log(`🔋 通用电源状态更新:`, powerState);
                
                // 更新Redux中的电源状态
                store.dispatch(setPowerSupplyData({
                    setVoltage: powerState.setVoltage,
                    actualVoltage: powerState.actualVoltage,
                    outputEnabled: powerState.outputEnabled
                }));
                
                console.log(`✅ 已更新电源状态(通用): 输出${powerState.outputEnabled ? '开启' : '关闭'}, 设置电压${powerState.setVoltage}V, 实际电压${powerState.actualVoltage}V`);
                
                // 发出电源状态更新事件
                window.dispatchEvent(new CustomEvent('deviceStateUpdate', {
                    detail: {
                        device_type: 'power_supply',
                        device_state: 'updated',
                        device_name: '直流电源',
                        power_supply_state: powerState
                    }
                }));
            }
            
            // 🌊 更新信号发生器状态 - 根据 device_type 判断
            if (stateData.device_type === 'signal_generator' || stateData.device === 'signal_generator') {
                console.log(`🌊 检测到信号发生器状态变化:`, stateData.signal_generator_state);
                
                if (stateData.signal_generator_state) {
                    const signalState = stateData.signal_generator_state;
                    
                    // 更新Redux中的信号发生器状态
                    store.dispatch(setSignalGeneratorData({
                        waveform: signalState.waveform,
                        frequency: signalState.frequency,
                        outputEnabled: signalState.outputEnabled
                    }));
                    
                    console.log(`✅ 已更新信号发生器状态: 输出${signalState.outputEnabled ? '开启' : '关闭'}, 波形${signalState.waveform}, 频率${signalState.frequency}Hz`);
                    
                    // 发出信号发生器状态更新事件，让组件更新UI状态
                    window.dispatchEvent(new CustomEvent('deviceStateUpdate', {
                        detail: {
                            device_type: 'signal_generator',
                            device_state: stateData.device_state || stateData.state,
                            device_name: stateData.device_name || '信号发生器',
                            signal_generator_state: signalState
                        }
                    }));
                }
            }
            
            // 🌊 处理信号发生器状态变化 - 通用处理（兼容性）
            if (stateData.signal_generator_state) {
                const signalState = stateData.signal_generator_state;
                console.log(`🌊 通用信号发生器状态更新:`, signalState);
                
                // 更新Redux中的信号发生器状态
                store.dispatch(setSignalGeneratorData({
                    waveform: signalState.waveform,
                    frequency: signalState.frequency,
                    outputEnabled: signalState.outputEnabled
                }));
                
                console.log(`✅ 已更新信号发生器状态(通用): 输出${signalState.outputEnabled ? '开启' : '关闭'}, 波形${signalState.waveform}, 频率${signalState.frequency}Hz`);
                
                // 发出信号发生器状态更新事件
                window.dispatchEvent(new CustomEvent('deviceStateUpdate', {
                    detail: {
                        device_type: 'signal_generator',
                        device_state: 'updated',
                        device_name: '信号发生器',
                        signal_generator_state: signalState
                    }
                }));
            }
            
            // 🔬 更新万用表状态 - 根据 device_type 判断（兼容性）
            if (stateData.device_type && stateData.device_type.startsWith('multimeter_')) {
                console.log(`🔬 检测到万用表状态变化: ${stateData.device_type}`);
                
                // 根据设备类型确定万用表模式和状态
                const multimeterModeMap = {
                    'multimeter_resistance': 'RES',
                    'multimeter_continuity': 'CONT',
                    'multimeter_dc_voltage': 'DCV'
                };
                
                const mode = multimeterModeMap[stateData.device_type];
                const isOn = stateData.device_state === 'opened' || stateData.state === 'opened';
                
                if (mode) {
                    console.log(`✅ 已更新万用表状态: ${isOn ? '开启' : '关闭'} - 模式: ${mode}`);
                    
                    // 发出万用表状态更新事件，让组件更新UI状态
                    window.dispatchEvent(new CustomEvent('deviceStateUpdate', {
                        detail: {
                            device_type: 'multimeter',
                            device_state: stateData.device_state || stateData.state,
                            device_name: stateData.device_name || '万用表',
                            multimeter_mode: mode,
                            is_on: isOn
                        }
                    }));
                }
            }
            
            // 🔬 处理万用表关闭状态 - 当 last_stream_common 为 null 且之前是万用表状态
            if (stateData.last_stream_common === null) {
                console.log(`🔬 检测到设备关闭，可能包括万用表`);
                
                // 清空万用表数据
                store.dispatch(setMultimeterData({ value: null, unit: null }));
                console.log(`✅ 已清空万用表数据`);
                
                // 发出万用表关闭事件
                window.dispatchEvent(new CustomEvent('deviceStateUpdate', {
                    detail: {
                        device_type: 'multimeter',
                        device_state: 'closed',
                        device_name: '万用表',
                        is_on: false
                    }
                }));
            }
            
            // 如果有设备状态信息，可以进一步处理
            if (stateData.last_stream_common) {
                console.log(`📡 检测到设备状态变化: ${stateData.last_stream_common}`);
                // 这里可以根据设备状态触发相应的UI更新
                // 例如更新按钮状态、指示灯等
            }
            
            console.log('✅ Redux store状态更新完成');
            
            // 发出成功事件
            window.dispatchEvent(new CustomEvent('storeUpdated', {
                detail: { success: true, updatedData: stateData }
            }));
            
        } catch (error) {
            console.error('❌ 更新Redux store失败:', error);
            
            // 发出错误事件
            window.dispatchEvent(new CustomEvent('storeUpdateError', {
                detail: { error: error.message, stateData }
            }));
        }
    }

    /**
     * 处理LED状态同步
     */
    handleLedStateSync(ledStates) {
        console.log('💡 处理LED状态同步:', ledStates);
        
        // 发出LED状态同步事件
        window.dispatchEvent(new CustomEvent('ledStateSync', {
            detail: ledStates
        }));
    }

    handleClose(event) {
        console.log('WebSocket连接已关闭', event.code, event.reason);
        this.isConnected = false;
        this.stopTemperaturePolling(); // 停止定时获取
        this.handleReconnect();
    }

    handleError(event) {
        console.error('WebSocket错误:', event);
        this.isConnected = false;
    }

    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

            setTimeout(() => {
                this.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('WebSocket重连失败，已达到最大重试次数');
        }
    }

    // 数据处理方法
    processData(hexData) {
        try {
            // 将十六进制字符串转换为字节数组
            const packet = [];
            for (let i = 0; i < hexData.length; i += 2) {
                packet.push(parseInt(hexData.substr(i, 2), 16));
            }

            // 验证结束字节
            if (packet[packet.length - 1] !== 0xFE) {
                console.error('数据格式错误：结束字节不是0xFE');
                return null;
            }

            // 根据第一个字节判断数据类型并处理
            switch (packet[0]) {
                case 0x0D: // 温湿度数据
                    const temperatureValue = packet[1];
                    const humidityValue = packet[2];
                    console.log(`🌡️ 温度: ${temperatureValue}°C, 湿度: ${humidityValue}%`);
                    return {
                        type: 'temperature_humidity',
                        temperature: temperatureValue,
                        humidity: humidityValue,
                        temperatureUnit: '°C',
                        humidityUnit: '%',
                        description: '温湿度数据'
                    };

                // LED状态反馈 (0x10-0x1A)
                case 0x10: return { type: 'led', ledNumber: 1, status: packet[2] };
                case 0x11: return { type: 'led', ledNumber: 2, status: packet[2] };
                case 0x12: return { type: 'led', ledNumber: 3, status: packet[2] };
                case 0x13: return { type: 'led', ledNumber: 4, status: packet[2] };
                case 0x14: return { type: 'led', ledNumber: 5, status: packet[2] };
                case 0x15: return { type: 'led', ledNumber: 6, status: packet[2] };
                case 0x16: return { type: 'led', ledNumber: 7, status: packet[2] };
                case 0x17: return { type: 'led', ledNumber: 8, status: packet[2] };
                case 0x18: return { type: 'led', ledNumber: 9, status: packet[2] };
                case 0x19: return { type: 'led', ledNumber: 10, status: packet[2] };
                case 0x1A: return { type: 'led', ledNumber: 11, status: packet[2] };

                case 0x08: // 示波器数据
                    const oscilloscopeValue = ((packet[1] << 8) | packet[2]) / 100;
                    this.notifyOscilloscopeListeners(oscilloscopeValue);
                    return {
                        type: 'oscilloscope',
                        value: oscilloscopeValue,
                        description: '示波器数据'
                    };
                case 0x07: // 示波器关闭状态数据
                    console.log('📊 收到示波器关闭信号');
                    return {
                        type: 'oscilloscope_off',
                        description: '示波器关闭状态'
                    };

                case 0x05: // 光强度数据
                    const lightValue = (packet[1] << 8) | packet[2];
                    console.log(`💡 光强度值: ${lightValue} Lux`);
                    return {
                        type: 'light',
                        value: lightValue,
                        unit: 'Lux',
                        description: '光强度数据'
                    };

                case 0x06: // 蜂鸣器数据
                    const buzzerTime = packet[2];
                    console.log(`🔔 蜂鸣器时间: ${buzzerTime}`);
                    return {
                        type: 'buzzer',
                        value: buzzerTime,
                        description: '蜂鸣器数据'
                    };

                case 0x0C: // 超声波传感器数据 (HC-SR04)
                    const timeInMicroseconds = (packet[1] << 8) | packet[2];

                    // HC-SR04 距离计算（后端返回微秒值）:
                    // 声速: 340 m/s = 0.034 cm/μs
                    // 往返距离 = 时间(μs) × 0.034 cm/μs
                    // 实际距离 = 往返距离 / 2 = 时间(μs) × 0.017
                    const distanceInCm = parseFloat((timeInMicroseconds * 0.017).toFixed(2));

                    console.log(`📏 HC-SR04超声波传感器 - 时间: ${timeInMicroseconds} μs, 距离: ${distanceInCm} cm`);
                    return {
                        type: 'distance',
                        value: distanceInCm,
                        unit: 'cm',
                        description: '超声波传感器数据'
                    };

                case 0x01: // 万用表关闭状态数据
                    console.log('📊 收到万用表关闭信号');
                    return {
                        type: 'multimeter_off',
                        description: '万用表关闭状态'
                    };

                case 0x02: // 万用表电阻档数据
                    const resValue = (packet[1] << 8) | packet[2];
                    console.log(`🔬 万用表电阻档数据: ${resValue} Ω (范围: 0-4096)`);
                    return { type: 'res', value: resValue, unit: 'Ω' };

                case 0x04: // 万用表直流电压档数据
                    const dcvValue = (packet[1] << 8) | packet[2];
                    console.log(`🔬 万用表直流电压档数据: ${dcvValue} V (范围: 0-4096)`);
                    return { type: 'dcv', value: dcvValue, unit: 'V' };

                case 0x09: // 电源数据
                    const voltage = ((packet[1] << 8) | packet[2]) / 10; // 电压，除以10转换为V

                    console.log(`🔌 电源数据: ${voltage}V`);
                    return {
                        type: 'power_supply',
                        voltage: voltage,
                        description: '电源数据'
                    };
                case 0x0A: // 信号发生器数据（仅支持正弦波）
                    const waveformCode = packet[1]; // 波形类型代码
                    const freq = packet[2];
                    const signalFreq = freq; // 频率

                    // 只支持正弦波（0x01）
                    const waveformType = 'sine';

                    console.log(`🌊 信号发生器数据: ${waveformType}, ${signalFreq}Hz`);
                    return {
                        type: 'signal_generator',
                        waveform: waveformType,
                        frequency: signalFreq,
                        description: '信号发生器数据'
                    };
                default:
                    console.warn(`⚠️ 未知的数据类型: 0x${packet[0].toString(16).padStart(2, '0').toUpperCase()}`);
                    return null;
            }
        } catch (error) {
            console.error('数据处理错误:', error);
            return null;
        }
    }

    // 更新Redux Store
    updateStore(result) {
        try {
            switch (result.type) {
                case 'gesture':
                    store.dispatch(setGestureSensor(result.value));
                    break;
                case 'distance':
                    store.dispatch(setInfraredSensor(result.value));
                    break;
                case 'light':
                    store.dispatch(setLightIntensitySensor(result.value));
                    break;
                case 'buzzer':
                    store.dispatch(setBuzzer(result.value));
                    break;
                case 'temperature_humidity':
                    store.dispatch(setTemperature(result.temperature));
                    store.dispatch(setHumidity(result.humidity));
                    break;
                case 'led':
                    // 更新LED状态
                    const action = result.status === 1 ? open_led : close_led;
                    store.dispatch(action({ number: result.ledNumber }));
                    break;
                case 'oscilloscope':
                    // 处理示波器数据 - 这个是从WebSocket接收的实时数据，不需要更新状态
                    console.log(`📊 示波器实时数据: ${result.value}`);
                    // 这里不需要更新Redux状态，因为示波器的开关状态是通过API调用管理的
                    // 实时数据会通过listeners传递给组件
                    break;
                case 'res':
                    // 电阻档数据
                    store.dispatch(setMultimeterData({ value: result.value, unit: result.unit }));
                    console.log('📊 万用表电阻档数据已更新:', result.value, result.unit);
                    break;
                case 'dcv':
                    // 直流电压档数据
                    store.dispatch(setMultimeterData({ value: result.value, unit: result.unit }));
                    console.log('📊 万用表直流电压档数据已更新:', result.value, result.unit);
                    break;
                case 'power_supply':
                    console.log('正在更新电源数据到Redux:', result);
                    store.dispatch(setPowerSupplyData({
                        actualVoltage: result.voltage,
                        actualCurrent: result.current
                    }));
                    break;
                case 'signal_generator':
                    console.log('正在更新信号发生器数据到Redux:', result);
                    store.dispatch(setSignalGeneratorData({
                        waveform: result.waveform,
                        frequency: result.frequency,
                        amplitude: result.amplitude,
                        dcOffset: result.dcOffset,
                        outputEnabled: result.outputEnabled
                    }));
                    break;
                case 'oscilloscope_off':
                    console.log('📊 示波器切换到关闭状态');
                    // 通知示波器组件关闭
                    this.notifyOscilloscopeListeners(null); // 或者发送特殊值表示关闭
                    break;
                case 'multimeter_off':
                    console.log('📊 万用表切换到关闭状态');
                    // 清空万用表数据并设置为关闭状态
                    store.dispatch(setMultimeterData({
                        value: null,
                        unit: null,
                        mode: 'RES' // 重置为默认电阻档
                    }));
                    break;
                default:
                    console.log('未处理的数据类型:', result.type);
            }
        } catch (error) {
            console.error('更新Store失败:', error);
        }
    }

    // 获取连接状态
    isWebSocketConnected() {
        return this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN;
    }

    // 手动重连
    reconnect() {
        if (this.socket) {
            this.socket.close();
        }
        this.reconnectAttempts = 0;
        this.connect();
    }

    // 添加数据监听器
    onOscilloscopeData(listener) {
        this.oscilloscopeListeners.add(listener);
    }

    // 移除示波器数据监听器
    offOscilloscopeData(listener) {
        this.oscilloscopeListeners.delete(listener);
    }

    // 通知所有示波器数据监听器
    notifyOscilloscopeListeners(value) {
        this.oscilloscopeListeners.forEach(listener => listener(value));
    }

    // 在类的最后添加清理方法
    destroy() {
        this.stopTemperaturePolling();
        if (this.socket) {
            this.socket.close();
        }
    }
}

// 创建WebSocket管理器实例
const wsManager = new WebSocketManager();

// 导出管理器实例，供其他组件使用
export default wsManager;