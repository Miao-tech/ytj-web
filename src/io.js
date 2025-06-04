import { store } from './store';
import { 
    setGestureSensor, 
    setInfraredSensor, 
    setLightIntensitySensor, 
    setTemperature, 
    setHumidity,
    open_led,
    close_led,
    setMultimeterData,
    setPowerSupplyData,
    setSignalGeneratorData
} from './store_integrated_machine_slice';

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


    // 添加启动定时获取温湿度的方法
    startTemperaturePolling(interval = 5000) { // 默认5秒获取一次
        // 清除之前的定时器
        if (this.temperatureTimer) {
            clearInterval(this.temperatureTimer);
        }
        
        console.log(`开始定时获取温湿度数据，间隔: ${interval}ms`);
        
        this.temperatureTimer = setInterval(() => {
            if (this.isConnected) {
                this.fetchTemperature();
            }
        }, interval);
    }

    // 添加停止定时获取的方法
    stopTemperaturePolling() {
        if (this.temperatureTimer) {
            clearInterval(this.temperatureTimer);
            this.temperatureTimer = null;
            console.log('停止定时获取温湿度数据');
        }
    }

    init() {
        this.connect();
    }

    connect() {
        try {
            const wsUrl = process.env.REACT_APP_WEBSOCKET_URL || 'ws://192.168.35.25:8000/ws';
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

        // 启动定时获取温湿度（延迟5秒后开始，避免与初始化数据冲突）
        setTimeout(() => {
            this.startTemperaturePolling(10000); // 每10秒获取一次
        }, 5000);
    }

    scheduleInitialDataFetch() {
        // 分批获取初始数据，避免同时请求
        setTimeout(() => this.fetchTemperature(), 1000);
        setTimeout(() => this.fetchDistance(), 2000);
        setTimeout(() => this.fetchLight(), 3000);
    }

    handleMessage(event) {
        // console.log('收到消息:', event.data);
        const result = this.processData(event.data);
        if (result) {
            this.updateStore(result);
        }
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

    // API调用方法
    async fetchTemperature() {
        try {
            const response = await fetch('http://192.168.35.25:8000/open_tempature');
            const data = await response.json();
            console.log('温度请求响应:', data);
        } catch (error) {
            console.error('获取温度数据失败:', error);
        }
    }

    async fetchDistance() {
        try {
            const response = await fetch('http://192.168.35.25:8000/get_distance');
            const data = await response.json();
            console.log('测距请求响应:', data);
        } catch (error) {
            console.error('获取测距数据失败:', error);
        }
    }

    async fetchLight() {
        try {
            const response = await fetch('http://192.168.35.25:8000/get_light');
            const data = await response.json();
            console.log('光照请求响应:', data);
        } catch (error) {
            console.error('获取光照数据失败:', error);
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
                case 0x0D: // 手势传感器数据
                    return { 
                        type: 'gesture', 
                        value: packet[2],
                        description: '手势传感器数据'
                    };

                // LED状态反馈 (0x10-0x18)
                case 0x10: return { type: 'led', ledNumber: 1, status: packet[2] };
                case 0x11: return { type: 'led', ledNumber: 2, status: packet[2] };
                case 0x12: return { type: 'led', ledNumber: 3, status: packet[2] };
                case 0x13: return { type: 'led', ledNumber: 4, status: packet[2] };
                case 0x14: return { type: 'led', ledNumber: 5, status: packet[2] };
                case 0x15: return { type: 'led', ledNumber: 6, status: packet[2] };
                case 0x16: return { type: 'led', ledNumber: 7, status: packet[2] };
                case 0x17: return { type: 'led', ledNumber: 8, status: packet[2] };
                case 0x18: return { type: 'led', ledNumber: 9, status: packet[2] };

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
                    
                case 0x0E: // 光照度数据
                    const lightValue = (packet[1] << 8) | packet[2];
                    console.log(`💡 光照度值: ${lightValue} Lux`);
                    return { 
                        type: 'light', 
                        value: lightValue, 
                        unit: 'Lux',
                        description: '光照度数据'
                    };
                    
                case 0x0B: // 温湿度数据
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

                case 0x0C: // 测距数据
                    const distanceInMm = (packet[1] << 8) | packet[2];
                    const distanceInCm = distanceInMm / 10;
                    console.log(`📏 测距值: ${distanceInCm} cm`);
                    return { 
                        type: 'distance', 
                        value: distanceInCm, 
                        unit: 'cm',
                        description: '测距数据'
                    };
                
                case 0x01: // 万用表关闭状态数据
                    console.log('📊 收到万用表关闭信号');
                    return { 
                        type: 'multimeter_off',
                        description: '万用表关闭状态'
                    };

                case 0x02: // 万用表数据
                    const decimalValue = (packet[1] << 8) | packet[2];
                    // 假设服务器返回的数据中包含了单位信息，或者根据当前模式判断单位
                    // 这里我们简化处理，假设接收到的数据是电阻值，单位是欧姆 (Ω)
                    const multimeterValue = decimalValue; // 根据实际数据格式调整
                    const resUnit = 'Ω'; // 根据实际数据格式或当前模式调整

            
                    // console.log(`📥 万用表数据: ${Array.from(packet).map(n => '0x' + n.toString(16).padStart(2, '0').toUpperCase()).join(' ')} (十进制值: ${decimalValue})`);
                    return { type: 'res', value: decimalValue, unit: resUnit };
                
                case 0x09: // 电源数据 (假设0x0F是电源数据的命令字节)
                    const voltage = ((packet[1] << 8) | packet[2]) / 100; // 电压，除以100转换为V
                    
                    console.log(`🔌 电源数据: ${voltage}V`);
                    return { 
                        type: 'power_supply', 
                        voltage: voltage,
                        description: '电源数据'
                    };
                case 0x0A: // 信号发生器数据 (假设0x30是信号发生器数据的命令字节)
                    const waveformCode = packet[1]; // 波形类型代码
                    const freq = packet[2];
                    const signalFreq = freq; // 频率
                    
                    // 根据代码确定波形类型
                    let waveformType = 'sine';
                    switch (waveformCode) {
                        case 0x01: waveformType = 'sine'; break;
                        case 0x02: waveformType = 'square'; break;
                        case 0x03: waveformType = 'triangle'; break;
                    }
                    
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
                case 'temperature_humidity':
                    store.dispatch(setTemperature(result.temperature));
                    store.dispatch(setHumidity(result.humidity));
                    break;
                case 'led':
                    // 更新LED状态
                    const action = result.status === 1 ? open_led : close_led;
                    store.dispatch(action({ number: result.ledNumber }));
                    break;
                case 'res':
                    // 如果需要存储电阻数据，可以在这里添加
                    // Dispatch action 更新 Redux store
                    store.dispatch(setMultimeterData({ value: result.value, unit: result.unit }));
                    // console.log('电阻数据已接收:', result.value);
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
                    console.log('示波器切换到关闭状态');
                    // 这里可以添加Redux action来更新示波器状态，如果你有相关的状态管理
                    // 通知示波器组件关闭
                    this.notifyOscilloscopeListeners(null); // 或者发送特殊值表示关闭
                    break;
                case 'multimeter_off':
                    console.log('示波器切换到关闭状态');
                    // 这里可以添加Redux action来更新示波器状态，如果你有相关的状态管理
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

    // 修改 LED 控制方法
    async controlLed(ledNumber, isOpen) {
        try {
            const endpoint = isOpen ? 'open_led' : 'close_led';
            const response = await fetch(`http://192.168.35.25:8000/${endpoint}?numbers=${ledNumber}`);
            const data = await response.json();
            console.log(`LED ${ledNumber} ${isOpen ? '打开' : '关闭'} 响应:`, data);
            
            // 更新 Redux store
            const action = isOpen ? open_led : close_led;
            store.dispatch(action({ number: ledNumber }));
        } catch (error) {
            console.error(`LED ${ledNumber} ${isOpen ? '打开' : '关闭'} 失败:`, error);
        }
    }

    // 添加示波器控制方法
    async controlOscilloscope(isOpen) {
        try {
            const endpoint = isOpen ? 'open_occ' : 'close_occ';
            const response = await fetch(`http://192.168.35.25:8000/${endpoint}`);
            const data = await response.json();
            console.log(`示波器${isOpen ? '打开' : '关闭'}响应:`, data);
            return true;
        } catch (error) {
            console.error(`示波器${isOpen ? '打开' : '关闭'}失败:`, error);
            return false;
        }
    }

    // 添加示波器数据监听器
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

    // 添加万用表控制方法
    async controlMultimeter(action, mode = null) {
        try {
            let endpoint = '';
            let method = 'GET'; // 假设所有请求都是GET

            switch (action) {
                case 'open':
                    endpoint = '/open_resistense'; // 打开时默认电阻档
                    break;
                case 'close':
                    endpoint = '/close_multimeter';
                    break;
                case 'changeMode':
                    switch (mode) {
                        case 'DCV':
                            endpoint = '/open_dcv';
                            break;
                        case 'ACV':
                            endpoint = '/open_acv';
                            break;
                        case 'DCA':
                            endpoint = '/open_dca';
                            break;
                        case 'CONT':
                            endpoint = '/open_cont'
                        case 'RES':
                            endpoint = '/open_resistense'; // 电阻档
                            break;
                        default:
                            console.error('未知万用表模式:', mode);
                            return false;
                    }
                    break;
                default:
                    console.error('未知万用表控制动作:', action);
                    return false;
            }

            if (!endpoint) return false; // 防止空请求

            const response = await fetch(`http://192.168.35.25:8000${endpoint}`);
            const data = await response.json();
            console.log(`万用表控制 (${action}${mode ? '-' + mode : ''}) 响应:`, data);
            return true;
        } catch (error) {
            console.error(`万用表控制 (${action}${mode ? '-' + mode : ''}) 失败:`, error);
            return false;
        }
    }

    // 添加电源控制方法
    async controlPowerSupply(action, value = null) {
        try {
            let endpoint = '';
            let params = '';

            switch (action) {
                case 'output':
                    endpoint = value ? '/power_supply_on' : '/power_supply_off';
                    break;
                case 'voltage':
                    endpoint = '/set_voltage';
                    params = `?voltage=${value}`;
                    break;
                default:
                    console.error('未知电源控制动作:', action);
                    return false;
            }

            const response = await fetch(`http://192.168.35.25:8000${endpoint}${params}`);
            const data = await response.json();
            console.log(`电源控制 (${action}${value !== null ? '-' + value : ''}) 响应:`, data);
            return true;
        } catch (error) {
            console.error(`电源控制 (${action}${value !== null ? '-' + value : ''}) 失败:`, error);
            return false;
        }
    }

    // 修改io.js中的controlSignalGenerator函数
    async controlSignalGenerator(action, params = null) {
        try {
            let endpoint = '';
            let queryParams = '';

            switch (action) {
                case 'set_waveform':
                    endpoint = '/set_waveform';
                    if (params) {
                        queryParams = `?waveform=${params.waveform}&frequency=${params.frequency}`;
                    }
                    break;
                case 'stop':
                    endpoint = '/signal_generator_stop';
                    break;
                default:
                    console.error('未知信号发生器控制动作:', action);
                    return false;
            }

            const response = await fetch(`http://192.168.35.25:8000${endpoint}${queryParams}`);
            const data = await response.json();
            console.log(`信号发生器控制 (${action}) 响应:`, data);
            return true;
        } catch (error) {
            console.error(`信号发生器控制 (${action}) 失败:`, error);
            return false;
        }
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