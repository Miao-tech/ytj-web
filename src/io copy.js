import { store } from './store';
import { 
    setGestureSensor, 
    setInfraredSensor, 
    setLightIntensitySensor, 
    setTemperature, 
    setHumidity,
    open_led,
    close_led
} from './store_integrated_machine_slice';

// 创建WebSocket连接
const socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);

// 获取温度数据
async function fetchTemperature() {
    try {
        const response = await fetch('http://192.168.3.40:8000/open_tempature');
        const data = await response;
        // 假设返回的数据格式为 { temperature: number }
        console.log(data.text());
        // store.dispatch(setTemperature(data.temperature));
    } catch (error) {
        console.error('获取温度数据失败:', error);
    }
}

// 获取测距数据
async function fetchDistance() {
    try {
        const response = await fetch('http://192.168.3.40:8000/get_distance');
        const data = await response;
        console.log(data.text());
    } catch (error) {
        console.error('获取测距数据失败:', error);
    }
}

// 获取光照数据
async function fetchLight() {
    try {
        const response = await fetch('http://192.168.3.40:8000/get_light');
        const data = await response;
        console.log(data.text());
    } catch (error) {
        console.error('获取测距数据失败:', error);
    }
}

// 连接打开时触发
socket.addEventListener('open', function (event) {
    console.log('WebSocket连接已打开');
    setTimeout(()=>{
        // 获取初始温度数据
        fetchTemperature();
    }, 1000);
    
    setTimeout(() => {
        // 获取测距数据
        fetchDistance();
    }, 1000);
    setTimeout(() => {
        // 获取光照数据
        fetchLight();
    }, 1000);
});

// 接收到消息时触发
socket.addEventListener('message', function (event) {
    console.log('收到消息:', event.data);
    const hexData = event.data;
    // 处理接收到的消息
    const result = processData(hexData);
    if (result) {
        // 根据数据类型更新 Redux store
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
        }
    }
});

// 数据处理函数// 统一的传感器数据处理函数
function processData(hexData) {
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
            const gestureValue = packet[2];
            return { type: 'gesture', value: gestureValue };

        case 0x10:
            const led1 = packet[2];
            return { type: 'led1', value: led1 };
        case 0x11:
            const led2 = packet[2];
            return { type: 'led2', value: led2 };
        case 0x12:
            const led3 = packet[2];
            return { type: 'led3', value: led3 };
        case 0x13:
            const led4 = packet[2];
            return { type: 'led4', value: led4 };
        case 0x14:
            const led5 = packet[2];
            return { type: 'led5', value: led5 };
        case 0x15:
            const led6 = packet[2];
            return { type: 'led6', value: led6 };
        case 0x16:
            const led7 = packet[2];
            return { type: 'led7', value: led7 };
        case 0x17:
            const led8 = packet[2];
            return { type: 'led6', value: led8 };
        case 0x18:
            const led9 = packet[2];
            return { type: 'led7', value: led9 };
                
        case 0x08: // 示波器数据
            const oscilloscopeValue = ((packet[1] << 8) | packet[2]) / 100;
            // addDataPoint(oscilloscopeValue);
            console.log(`📊 示波器数据值: ${oscilloscopeValue}`);
            return { type: 'oscilloscope', value: oscilloscopeValue };
            
        case 0x0E: // 光照度数据
            const lightValue = (packet[1] << 8) | packet[2];
            // console.log(`💡 光照度值: ${lightValue} Lux`);
            return { type: 'light', value: lightValue, unit: 'Lux' };
            
            
        case 0x0B: // 温湿度数据
            const temperatureValue = packet[1];
            const humidityValue = packet[2];
            // console.log(`🌡️ 温度: ${temperatureValue}°C, 湿度: ${humidityValue}%`);
            return { 
                type: 'temperature_humidity', 
                temperature: temperatureValue, 
                humidity: humidityValue,
                temperatureUnit: '°C',
                humidityUnit: '%'
            };

        case 0x0C: // 测距数据
            const distanceInMm = (packet[1] << 8) | packet[2];
            const distanceInCm = distanceInMm / 10;
            // console.log(`📏 测距值: ${distanceInCm} cm`);
            return { type: 'distance', value: distanceInCm, unit: 'cm' };
        
        case 0x02: // 万用表电阻档位
            const decimalValue = (packet[1] << 8) | packet[2];
            // console.log(`📥 电阻数据: ${Array.from(packet).map(n => '0x' + n.toString(16).padStart(2, '0').toUpperCase()).join(' ')} (十进制值: ${decimalValue})`);
            return { type: 'resistance', value: decimalValue, rawPacket: packet };
            
        default:
            console.warn(`⚠️ 未知的数据类型: 0x${packet[0].toString(16).padStart(2, '0').toUpperCase()}`);
            return null;
    }
}




// 连接关闭时触发
socket.addEventListener('close', function (event) {
    console.log('WebSocket连接已关闭');
    // 可以在这里处理重连逻辑
});

// 发生错误时触发
socket.addEventListener('error', function (event) {
    console.error('WebSocket错误:', event);
    // 处理错误
});
