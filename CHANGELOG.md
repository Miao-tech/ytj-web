# 协议修改文档

> 项目：ytj-web IoT设备控制系统
> 修改日期：2025-10-15
> 版本：v2.0

---

## 📋 目录

1. [修改概述](#修改概述)
2. [LED灯控制模块](#1-led灯控制模块)
3. [电源模块](#2-电源模块)
4. [信号发生器模块](#3-信号发生器模块)
5. [传感器模块](#4-传感器模块)
6. [万用表模块](#5-万用表模块)
7. [文件修改清单](#文件修改清单)
8. [协议对照表](#协议对照表)

---

## 修改概述

本次更新对IoT设备控制系统的通信协议进行了重大调整，主要目的是：

- ✅ 扩展LED灯数量从9个增加到11个
- ✅ 调整电源电压档位为更实用的固定值
- ✅ 增加信号发生器的10Hz频率选项，仅支持正弦波
- ✅ 修改传感器通信协议以避免冲突
- ✅ 简化万用表为3个常用档位
- ✅ 添加蜂鸣器传感器
- ✅ **新增三合一红外传感器组（位掩码协议，动态图标显示）** 🆕

---

## 1. LED灯控制模块

### 📌 修改内容

**增加LED灯数量：从 9 个扩展到 11 个**

### 🔧 前端修改

#### 文件：`src/components/led.js`

**Redux Store 选择器添加**
```javascript
const led10 = useSelector((state) => state.integratedMachine.led10)
const led11 = useSelector((state) => state.integratedMachine.led11)
```

**UI 网格布局调整**
```javascript
// 修改前
<div className='grid grid-cols-9 gap-2'>

// 修改后
<div className='grid grid-cols-11 gap-2'>
```

#### 文件：`src/store_integrated_machine_slice.js`

**初始状态添加**
```javascript
const initialState = {
    // ... 其他状态
    led10: false,
    led11: false,
}
```

### 🔧 后端修改

#### 文件：`main.py`

**LED 命令字典更新**
```python
# 修改前
LED_COMMANDS = {
    1: 0x10, 2: 0x11, 3: 0x12, 4: 0x13, 5: 0x14,
    6: 0x15, 7: 0x16, 8: 0x17, 9: 0x18
}

# 修改后
LED_COMMANDS = {
    1: 0x10, 2: 0x11, 3: 0x12, 4: 0x13, 5: 0x14,
    6: 0x15, 7: 0x16, 8: 0x17, 9: 0x18, 10: 0x19, 11: 0x1A
}
```

**API 循环范围更新**
```python
# 修改前
for led_num in range(1, 10):

# 修改后
for led_num in range(1, 12):
```

**影响的 API 端点**
- `/api/open_all_led` (main.py:375-383)
- `/api/close_all_led` (main.py:385-393)
- `/api/device_status` (main.py:576-584)

### 📡 协议定义

| LED编号 | 命令字节 | 打开指令 | 关闭指令 |
|---------|---------|---------|---------|
| LED10 | 0x19 | `0x19 0x00 0x01 0xFE` | `0x19 0x00 0x00 0xFE` |
| LED11 | 0x1A | `0x1A 0x00 0x01 0xFE` | `0x1A 0x00 0x00 0xFE` |

### 🔍 WebSocket 数据解析

#### 文件：`src/request/io.js`

**添加 LED10 和 LED11 的解析**
```javascript
case 0x19: return { type: 'led', ledNumber: 10, status: packet[2] };
case 0x1A: return { type: 'led', ledNumber: 11, status: packet[2] };
```

---

## 2. 电源模块

### 📌 修改内容

**电压档位调整：从 0.1V/1.0V/10.0V/10.1V 改为 2.0V/3.0V/5.0V/12.0V**

### 🔧 前端修改

#### 文件：`src/components/powersupply.js`

**电压选项更新**
```javascript
// 修改前
const voltageOptions = [0.1, 1.0, 10.0, 10.1];
const defaultVoltage = 5.0;

// 修改后
const voltageOptions = [2.0, 3.0, 5.0, 12.0];
const defaultVoltage = 2.0;
```

**初始状态调整**
```javascript
const initialState = {
    powerSupply: {
        setVoltage: 2.0,  // 从 5.0 改为 2.0
        // ...
    }
}
```

### 🔧 后端修改

#### 文件：`main.py`

**API 端点：`/api/set_voltage` (main.py:518-540)**

```python
# 修改前
if not (0 <= voltage <= 10.1):
    return {"status": "error", "message": "电压超出范围 (0-10.1V)"}

command = None
if voltage == 0.1: command = bytes([0x09, 0x00, 0x01, 0xFE])
elif voltage == 1.0: command = bytes([0x09, 0x00, 0x64, 0xFE])
elif voltage == 10.0: command = bytes([0x09, 0x03, 0xe8, 0xFE])
elif voltage == 10.1: command = bytes([0x09, 0x03, 0xe9, 0xFE])

# 修改后
if not (0 <= voltage <= 12.0):
    return {"status": "error", "message": "电压超出范围 (0-12.0V)"}

command = None
if voltage == 2.0: command = bytes([0x09, 0x00, 0x14, 0xFE])   # 2.0V = 20/10
elif voltage == 3.0: command = bytes([0x09, 0x00, 0x1E, 0xFE]) # 3.0V = 30/10
elif voltage == 5.0: command = bytes([0x09, 0x00, 0x32, 0xFE]) # 5.0V = 50/10
elif voltage == 12.0: command = bytes([0x09, 0x00, 0x78, 0xFE]) # 12.0V = 120/10
```

### 📡 协议定义

**命令格式**: `0x09 [高字节] [低字节] 0xFE`
**计算方式**: 电压值 × 10 = 16位整数 (高字节 + 低字节)

| 电压 | 计算值 | 高字节 | 低字节 | 完整指令 |
|------|--------|--------|--------|----------|
| 2.0V | 20 | 0x00 | 0x14 | `0x09 0x00 0x14 0xFE` |
| 3.0V | 30 | 0x00 | 0x1E | `0x09 0x00 0x1E 0xFE` |
| 5.0V | 50 | 0x00 | 0x32 | `0x09 0x00 0x32 0xFE` |
| 12.0V | 120 | 0x00 | 0x78 | `0x09 0x00 0x78 0xFE` |

### 🔍 WebSocket 数据解析

#### 文件：`src/request/io.js`

**电源数据解析 (case 0x09)**
```javascript
case 0x09: // 电源数据
    const voltage = ((packet[1] << 8) | packet[2]) / 10; // 除以10转换为V
    console.log(`🔌 电源数据: ${voltage}V`);
    return {
        type: 'power_supply',
        voltage: voltage,
        description: '电源数据'
    };
```

---

## 3. 信号发生器模块

### 📌 修改内容

**频率选项：从 1Hz/100Hz 扩展为 1Hz/10Hz/100Hz**
**命令字节：从 0x30 改为 0x0A**
**波形选项：仅支持正弦波（删除方波和三角波）**

### 🔧 前端修改

#### 文件：`src/components/signalgenerator.js`

**频率选项更新**
```javascript
// 修改前
const frequencyOptions = [1, 100];
const defaultFrequency = 1000;

// 修改后
const frequencyOptions = [1, 10, 100];
const defaultFrequency = 1;
```

**网格布局调整**
```javascript
// 修改前
<div className="grid grid-cols-2 gap-4">

// 修改后
<div className="grid grid-cols-3 gap-4">
```

**初始状态调整**
```javascript
const initialState = {
    signalGenerator: {
        frequency: 1,  // 从 1000 改为 1
        // ...
    }
}
```

### 🔧 后端修改

#### 文件：`main.py`

**API 端点：`/api/set_waveform` (main.py:542-562)**

```python
# 修改前
freq_codes = {1: 0x01, 100: 0x64}
command = bytes([0x30, waveform_code, freq_code, 0xFE])

# 修改后（只支持正弦波，波形代码固定为 0x00）
waveform_codes = {"sine": 0x00}
freq_codes = {1: 0x01, 10: 0x0A, 100: 0x64}
command = bytes([0x0A, waveform_code, freq_code, 0xFE])
```

### 📡 协议定义

**命令格式**: `0x0A [波形代码] [频率代码] 0xFE`

| 参数 | 选项 | 代码 |
|------|------|------|
| 波形 | sine (正弦波) | 0x00 |
| 频率 | 1 Hz | 0x01 |
| | 10 Hz | 0x0A |
| | 100 Hz | 0x64 |

**示例指令**
```
正弦波 1Hz:   0x0A 0x00 0x01 0xFE
正弦波 10Hz:  0x0A 0x00 0x0A 0xFE
正弦波 100Hz: 0x0A 0x00 0x64 0xFE
```

### 🔍 WebSocket 数据解析

#### 文件：`src/request/io.js`

**信号发生器数据解析 (case 0x0A)**
```javascript
case 0x0A: // 信号发生器数据（仅支持正弦波）
    const waveformCode = packet[1];
    const freq = packet[2];
    const signalFreq = freq;

    // 只支持正弦波（0x01）
    const waveformType = 'sine';

    console.log(`🌊 信号发生器数据: ${waveformType}, ${signalFreq}Hz`);
    return {
        type: 'signal_generator',
        waveform: waveformType,
        frequency: signalFreq,
        description: '信号发生器数据'
    };
```

---

## 4. 传感器模块

### 📌 修改内容

1. **光强度传感器**: 协议从 0x0E 改为 0x05
2. **温度湿度传感器**: 协议从 0x0B 改为 0x0D
3. **删除手势传感器**
4. **添加蜂鸣器传感器** (协议 0x06)
5. **UI布局**: 从 4 列改为 5 列

### 🔧 前端修改

#### 文件：`src/components/sensornew.js`

**Redux 状态选择器**
```javascript
// 添加蜂鸣器
const buzzer = useSelector((state) => state.integratedMachine.buzzer)

// 添加 loading 状态
const [loading6, setLoading6] = useState(false)  // 蜂鸣器
```

**网格布局调整**
```javascript
// 修改前
<div className='grid grid-cols-4'>

// 修改后
<div className='grid grid-cols-5'>
```

**蜂鸣器 UI 组件**
```javascript
{/* 蜂鸣器传感器 */}
<div className="mx-auto flex max-w-xs flex-col">
    <div className="flex flex-row">
        {iconEle('icon-a-cellimage_huaban1fuben94', 'rgb(255, 165, 0)', 'rgb(255, 235, 205)')}

        <div style={{ fontSize: '16px', marginRight: "20px", textAlign: "left" }}>
            <div className="text-m text-white">蜂鸣器</div>
            <div className="text-2xl font-mono font-bold text-white">
                {buzzer}
            </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            {loading6 ?
                <span className={'iconfont icon-gengxin'}
                      style={{ animation: 'spin 1s linear infinite' }}>
                </span> :
                <span className={'iconfont icon-gengxin'}
                      onClick={() => refreshSingleSensor('buzzer', setLoading6)}>
                </span>
            }
        </div>
    </div>
</div>
```

#### 文件：`src/store_integrated_machine_slice.js`

**添加蜂鸣器状态**
```javascript
const initialState = {
    buzzer: 0,  // 蜂鸣器时间（0-255）
    // ...
}

// 添加 action
setBuzzer: (state, action) => {
    state.buzzer = action.payload
},

// 导出
export const {
    // ...
    setBuzzer,
} = storeIntegratedMachineSlice.actions
```

### 🔧 后端修改

#### 文件：`main.py`

**光强度传感器 API (main.py:495-499)**
```python
# 修改前
@app.get("/api/get_light")
async def get_light(exchange: aio_pika.Exchange = Depends(get_mq_exchange)):
    await send_serial_command(bytes([0x0E, 0x00, 0x01, 0xFE]), exchange)

# 修改后
@app.get("/api/get_light")
async def get_light(exchange: aio_pika.Exchange = Depends(get_mq_exchange)):
    await send_serial_command(bytes([0x05, 0x00, 0x01, 0xFE]), exchange)
```

**温度湿度传感器 API (main.py:477-481)**
```python
# 修改前
@app.get("/api/get_temperature")
async def get_temperature(exchange: aio_pika.Exchange = Depends(get_mq_exchange)):
    await send_serial_command(bytes([0x0B, 0x00, 0x01, 0xFE]), exchange)

# 修改后
@app.get("/api/get_temperature")
async def get_temperature(exchange: aio_pika.Exchange = Depends(get_mq_exchange)):
    await send_serial_command(bytes([0x0D, 0x00, 0x01, 0xFE]), exchange)
```

### 📡 协议定义

#### 光强度传感器

**请求指令**: `0x05 0x00 0x01 0xFE`
**返回格式**: `0x05 [高字节] [低字节] 0xFE`
**数据解析**: 光照值 = (高字节 << 8) | 低字节
**单位**: Lux

#### 温度湿度传感器

**请求指令**: `0x0D 0x00 0x01 0xFE`
**返回格式**: `0x0D [温度] [湿度] 0xFE`
**数据范围**: 温度 0-255°C, 湿度 0-255%

#### 超声波传感器 (HC-SR04)

**请求指令**: `0x0C 0x00 0x01 0xFE`
**返回格式**: `0x0C [高字节] [低字节] 0xFE`
**模块型号**: HC-SR04
**数据类型**: 时间值（微秒）

**HC-SR04 工作原理**:
```
声波速度: 340 m/s = 0.034 cm/μs
往返距离 = 时间(μs) × 0.034 cm/μs
实际距离 = 往返距离 / 2 = 时间(μs) × 0.017
```

**数据解析**:
```javascript
时间(μs) = (高字节 << 8) | 低字节
距离(cm) = 时间(μs) × 0.017
```

**换算示例**:
- 时间 588 μs → 距离 = 588 × 0.017 = 10.0 cm
- 时间 1176 μs → 距离 = 1176 × 0.017 = 20.0 cm
- 时间 2941 μs → 距离 = 2941 × 0.017 = 50.0 cm

**测量范围**: 2cm ~ 400cm (对应时间: 118 μs ~ 23529 μs)
**精度**: ±3mm

#### 蜂鸣器传感器

**协议**: `0x06 0x00 [时间] 0xFE`
**数据范围**: 0-255
**说明**: 蜂鸣器时间，通过 WebSocket 被动接收

**触发功能**:
- **触发命令**: `0x06 0x00 0x10 0xFE`
- **响应时长**: 0.01秒 (0x10 = 16 = 0.01s × 1600)
- **用途**: 点击蜂鸣器图标时触发蜂鸣，用于测试或提示

**API 端点**: `/api/trigger_buzzer` (GET)
**前端调用**: 点击蜂鸣器传感器图标即可触发

#### 三合一红外传感器组

**新增日期**: 2025-10-16
**协议**: `0x0B 0x00 0x01 0xFE`
**返回格式**: `0x0B 0x00 [状态字节] 0xFE`

**工作原理**:
这是一个三合一的红外传感器组，通过发送一个请求即可获取所有3个传感器的状态。返回值的第3个字节（packet[2]）是位掩码（bit mask）。

**位掩码解析**:
- **Bit 0 (0x01)**: 红外传感器A有遮挡
- **Bit 1 (0x02)**: 红外传感器B有遮挡
- **Bit 2 (0x04)**: 红外传感器C有遮挡

**返回值示例**:
```
0x0B 0x00 0x01 0xFE : 仅A传感器有遮挡
0x0B 0x00 0x02 0xFE : 仅B传感器有遮挡
0x0B 0x00 0x04 0xFE : 仅C传感器有遮挡
0x0B 0x00 0x03 0xFE : A和B传感器有遮挡 (0x01 | 0x02 = 0x03)
0x0B 0x00 0x05 0xFE : A和C传感器有遮挡 (0x01 | 0x04 = 0x05)
0x0B 0x00 0x06 0xFE : B和C传感器有遮挡 (0x02 | 0x04 = 0x06)
0x0B 0x00 0x07 0xFE : A、B、C全部有遮挡 (0x01 | 0x02 | 0x04 = 0x07)
0x0B 0x00 0x00 0xFE : 所有传感器正常，无遮挡
```

**API 端点**: `/api/get_infrared_sensors` (GET)
**前端特性**:
- 单独的第二行显示区域（5列布局）
- 统一的刷新按钮（一次获取所有3个传感器状态）
- 不需要启动/停止操作（传感器组始终工作）
- 动态图标显示：
  - 正常状态：Eye图标（睁眼）+ 绿色背景
  - 遮挡状态：EyeOff图标（闭眼）+ 红色背景
- 状态文字和颜色实时变化

### 🔍 WebSocket 数据解析

#### 文件：`src/request/io.js`

**光强度数据解析**
```javascript
case 0x05: // 光强度数据
    const lightValue = (packet[1] << 8) | packet[2];
    console.log(`💡 光强度值: ${lightValue} Lux`);
    return {
        type: 'light',
        value: lightValue,
        unit: 'Lux',
        description: '光强度数据'
    };
```

**温度湿度数据解析**
```javascript
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
```

**超声波传感器数据解析 (HC-SR04)**
```javascript
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
```

**蜂鸣器数据解析**
```javascript
case 0x06: // 蜂鸣器数据
    const buzzerTime = packet[2];
    console.log(`🔔 蜂鸣器时间: ${buzzerTime}`);
    return {
        type: 'buzzer',
        value: buzzerTime,
        description: '蜂鸣器数据'
    };
```

**三合一红外传感器数据解析**
```javascript
case 0x0B: // 3个红外传感器数据
    const sensorStatus = packet[2]; // 传感器状态字节（第3个字节）

    // 使用位掩码解析3个红外传感器状态
    const sensor1Blocked = (sensorStatus & 0x01) !== 0; // Bit 0
    const sensor2Blocked = (sensorStatus & 0x02) !== 0; // Bit 1
    const sensor3Blocked = (sensorStatus & 0x04) !== 0; // Bit 2

    console.log(`👁️ 红外传感器状态: 传感器A=${sensor1Blocked ? '遮挡' : '正常'}, 传感器B=${sensor2Blocked ? '遮挡' : '正常'}, 传感器C=${sensor3Blocked ? '遮挡' : '正常'}`);

    return {
        type: 'infrared_sensors',
        sensor1: sensor1Blocked,
        sensor2: sensor2Blocked,
        sensor3: sensor3Blocked,
        description: '3个红外传感器数据'
    };
```

**Redux store 更新**
```javascript
case 'distance':
    store.dispatch(setInfraredSensor(result.value));
    break;

case 'buzzer':
    store.dispatch(setBuzzer(result.value));
    break;

case 'infrared_sensors':
    console.log('👁️ 更新3个红外传感器状态:', result);
    // 更新3个红外传感器状态
    store.dispatch(setInfraredSensors({
        sensor1: result.sensor1,
        sensor2: result.sensor2,
        sensor3: result.sensor3
    }));
    break;
```

---

## 5. 万用表模块

### 📌 修改内容

**档位简化：从 5 档减少到 3 档**

- ✅ 保留：RES (电阻档), CONT (通断档), DCV (直流电压档)
- ❌ 删除：ACV (交流电压档), DCA (直流电流档)

### 🔧 前端修改

#### 文件：`src/components/multimeter.js`

**档位配置更新**
```javascript
// 修改前
const modes = [
    { key: 'RES', label: 'Ω', subLabel: '电阻', unit: 'Ω' },
    { key: 'CONT', label: 'CONT', subLabel: '通断蜂鸣器', unit: '' },
    { key: 'DCV', label: 'DCV', subLabel: '直流电压', unit: 'V' },
    { key: 'ACV', label: 'ACV', subLabel: '交流电压', unit: 'V' },
    { key: 'DCA', label: 'DCA', subLabel: '直流电流', unit: 'A' },
];

// 修改后
const modes = [
    { key: 'RES', label: 'Ω', subLabel: '电阻', unit: 'Ω', color: 'text-green-500' },
    { key: 'CONT', label: 'CONT', subLabel: '通断蜂鸣器', unit: '', color: 'text-blue-500' },
    { key: 'DCV', label: 'DCV', subLabel: '直流电压', unit: 'V', color: 'text-blue-500' },
];
```

**网格布局调整**
```javascript
// 修改前
<div className="grid grid-cols-5 gap-4">

// 修改后
<div className="grid grid-cols-3 gap-4">
```

**删除的 API 导入**
```javascript
// 删除
import { APIOpenACV, APIOpenDCA } from '../request/api';
```

### 🔧 后端修改

#### 文件：`main.py`

**删除的 API 端点**
```python
# ❌ 删除
@app.get("/api/open_acv")
@app.get("/api/open_dca")
```

**状态识别逻辑更新 (多处)**

```python
# 修改前
elif last_stream_common and last_stream_common[0] in [0x02, 0x03, 0x04, 0x05, 0x06]:

# 修改后
elif last_stream_common and last_stream_common[0] in [0x02, 0x03, 0x04]:
```

**万用表类型映射更新**
```python
# 修改前
multimeter_types = {
    "02": {"type": "multimeter_resistance", "name": "万用表-电阻档"},
    "03": {"type": "multimeter_continuity", "name": "万用表-通断档"},
    "04": {"type": "multimeter_dc_voltage", "name": "万用表-直流电压档"},
    "05": {"type": "multimeter_ac_voltage", "name": "万用表-交流电压档"},
    "06": {"type": "multimeter_dc_current", "name": "万用表-直流电流档"}
}

# 修改后
multimeter_types = {
    "02": {"type": "multimeter_resistance", "name": "万用表-电阻档"},
    "03": {"type": "multimeter_continuity", "name": "万用表-通断档"},
    "04": {"type": "multimeter_dc_voltage", "name": "万用表-直流电压档"}
}
```

**multimeter_buttons 更新**
```python
# 修改前
multimeter_buttons = {
    "resistance": "closed",
    "continuity": "closed",
    "dc_voltage": "closed",
    "ac_voltage": "closed",
    "dc_current": "closed"
}

# 修改后
multimeter_buttons = {
    "resistance": "closed",
    "continuity": "closed",
    "dc_voltage": "closed"
}
```

**影响的函数**
- `broadcast_state_update()` (main.py:110-118)
- `check_current_status()` (main.py:344)
- `restore_device_state_on_startup()` (main.py:363-365)
- `get_device_status()` (main.py:634-647)
- `websocket_endpoint()` (main.py:749-756)

### 📡 协议定义

| 档位 | 命令字节 | 开启指令 | 关闭指令 | 数据返回 |
|------|---------|---------|---------|---------|
| RES (电阻) | 0x02 | `0x02 0x00 0x01 0xFE` | `0x01 0x00 0x00 0xFE` | `0x02 [H] [L] 0xFE` |
| CONT (通断) | 0x03 | `0x03 0x00 0x02 0xFE` | `0x01 0x00 0x00 0xFE` | `0x03 [H] [L] 0xFE` |
| DCV (直流电压) | 0x04 | `0x04 0x00 0x03 0xFE` | `0x01 0x00 0x00 0xFE` | `0x04 [H] [L] 0xFE` |

**注意**: 所有万用表档位共用一个关闭指令 `0x01 0x00 0x00 0xFE`

### 🔍 WebSocket 数据解析

#### 文件：`src/request/io.js`

**万用表数据解析**
```javascript
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
```

**Redux store 更新**
```javascript
case 'res':
case 'dcv':
    store.dispatch(setMultimeterData({
        value: result.value,
        unit: result.unit
    }));
    break;

case 'multimeter_off':
    store.dispatch(setMultimeterData({
        value: null,
        unit: null,
        mode: 'RES'
    }));
    break;
```

---

## 文件修改清单

### 前端文件 (React + Redux)

| 文件路径 | 修改内容 | 影响范围 |
|---------|---------|---------|
| `src/components/led.js` | 添加LED10/LED11支持，11列布局 | LED控制UI |
| `src/components/powersupply.js` | 电压档位改为2.0/3.0/5.0/12.0V | 电源控制UI |
| `src/components/signalgenerator.js` | 添加10Hz，3列布局，默认频率改为1 | 信号发生器UI |
| `src/components/sensornew.js` | 添加蜂鸣器，5列布局，删除手势传感器；**新增三合一红外传感器组（第二行显示，Eye/EyeOff动态图标）** | 传感器监控UI |
| `src/components/multimeter.js` | 简化为3档，3列布局 | 万用表控制UI |
| `src/store_integrated_machine_slice.js` | 添加led10/led11/buzzer状态和action；**新增infraredSensor1/2/3和setInfraredSensors** | Redux全局状态 |
| `src/request/io.js` | 更新协议解析：0x05/0x06/0x0A/0x0D/0x19/0x1A；**新增0x0B三合一红外传感器解析（位掩码）** | WebSocket数据处理 |
| `src/request/api.js` | 删除ACV/DCA相关API调用；**新增APIGetInfraredSensors，删除启动/停止API** | API接口 |

### 后端文件 (Python + FastAPI)

| 文件路径 | 修改内容 | 影响范围 |
|---------|---------|---------|
| `main.py` (全局) | LED_COMMANDS字典添加10/11 | LED控制 |
| `main.py` (API) | 电压API更新为4档 | `/api/set_voltage` |
| `main.py` (API) | 信号发生器添加10Hz，命令改0x0A | `/api/set_waveform` |
| `main.py` (API) | 光强度协议改为0x05 | `/api/get_light` |
| `main.py` (API) | 温湿度协议改为0x0D | `/api/get_temperature` |
| `main.py` (API) | **新增三合一红外传感器API** | **`/api/get_infrared_sensors`** |
| `main.py` (API) | 删除ACV/DCA端点 | `/api/open_acv`, `/api/open_dca` |
| `main.py` (逻辑) | 万用表识别逻辑只保留3档 | 多个函数 |
| `main.py` (状态) | LED循环范围1-11 | 状态管理 |

---

## 协议对照表

### 完整协议映射表

| 模块 | 功能 | 旧协议 | 新协议 | 变更说明 |
|------|------|--------|--------|----------|
| **LED** | LED10 | ❌ 不存在 | `0x19` | 新增 |
| | LED11 | ❌ 不存在 | `0x1A` | 新增 |
| **电源** | 电压设置 | 0.1V~10.1V (4档) | 2.0/3.0/5.0/12.0V | 档位调整 |
| **信号发生器** | 命令字节 | `0x30` | `0x0A` | 字节修改 |
| | 频率 | 1Hz/100Hz | 1Hz/10Hz/100Hz | 添加10Hz |
| **传感器** | 光强度 | `0x0E` | `0x05` | 避免冲突 |
| | 温湿度 | `0x0B` | `0x0D` | 协议更新 |
| | 手势 | `0x0D` | ❌ 删除 | 功能移除 |
| | 蜂鸣器 | ❌ 不存在 | `0x06` | 新增 |
| | **三合一红外** | ❌ 不存在 | **`0x0B`** | **新增（位掩码）** |
| **万用表** | ACV | `0x05` | ❌ 删除 | 功能移除 |
| | DCA | `0x06` | ❌ 删除 | 功能移除 |

### 十六进制命令速查表

#### LED 控制命令

```
LED1  打开: 0x10 0x00 0x01 0xFE  关闭: 0x10 0x00 0x00 0xFE
LED2  打开: 0x11 0x00 0x01 0xFE  关闭: 0x11 0x00 0x00 0xFE
...
LED10 打开: 0x19 0x00 0x01 0xFE  关闭: 0x19 0x00 0x00 0xFE
LED11 打开: 0x1A 0x00 0x01 0xFE  关闭: 0x1A 0x00 0x00 0xFE
```

#### 电源控制命令

```
设置2.0V:  0x09 0x00 0x14 0xFE
设置3.0V:  0x09 0x00 0x1E 0xFE
设置5.0V:  0x09 0x00 0x32 0xFE
设置12.0V: 0x09 0x00 0x78 0xFE
```

#### 信号发生器命令（仅正弦波）

```
正弦波 1Hz:   0x0A 0x00 0x01 0xFE
正弦波 10Hz:  0x0A 0x00 0x0A 0xFE
正弦波 100Hz: 0x0A 0x00 0x64 0xFE
```

#### 传感器查询命令

```
光强度: 0x05 0x00 0x01 0xFE
温湿度: 0x0D 0x00 0x01 0xFE
超声波: 0x0C 0x00 0x01 0xFE
三合一红外传感器: 0x0B 0x00 0x01 0xFE
```

#### 蜂鸣器触发命令

```
触发蜂鸣器(响0.01秒): 0x06 0x00 0x10 0xFE
```

#### 三合一红外传感器返回值

```
无遮挡:       0x0B 0x00 0x00 0xFE
仅A遮挡:      0x0B 0x00 0x01 0xFE  (Bit 0)
仅B遮挡:      0x0B 0x00 0x02 0xFE  (Bit 1)
仅C遮挡:      0x0B 0x00 0x04 0xFE  (Bit 2)
A+B遮挡:      0x0B 0x00 0x03 0xFE  (0x01 | 0x02)
A+C遮挡:      0x0B 0x00 0x05 0xFE  (0x01 | 0x04)
B+C遮挡:      0x0B 0x00 0x06 0xFE  (0x02 | 0x04)
A+B+C全遮挡:  0x0B 0x00 0x07 0xFE  (0x01 | 0x02 | 0x04)
```

#### 万用表控制命令

```
打开电阻档:     0x02 0x00 0x01 0xFE
打开通断档:     0x03 0x00 0x02 0xFE
打开直流电压档: 0x04 0x00 0x03 0xFE
关闭万用表:     0x01 0x00 0x00 0xFE
```

---

## 测试建议

### 1. LED 模块测试

```bash
# 测试 LED10 和 LED11
curl http://localhost:8000/api/open_led?numbers=10,11
curl http://localhost:8000/api/close_led?numbers=10,11
```

### 2. 电源模块测试

```bash
# 测试新的电压档位
curl http://localhost:8000/api/set_voltage?voltage=2.0
curl http://localhost:8000/api/set_voltage?voltage=3.0
curl http://localhost:8000/api/set_voltage?voltage=5.0
curl http://localhost:8000/api/set_voltage?voltage=12.0
```

### 3. 信号发生器测试

```bash
# 测试不同频率的正弦波
curl "http://localhost:8000/api/set_waveform?waveform=sine&frequency=1"
curl "http://localhost:8000/api/set_waveform?waveform=sine&frequency=10"
curl "http://localhost:8000/api/set_waveform?waveform=sine&frequency=100"
```

### 4. 传感器模块测试

```bash
# 测试新协议
curl http://localhost:8000/api/get_light      # 0x05
curl http://localhost:8000/api/get_temperature # 0x0D

# 测试蜂鸣器触发
curl http://localhost:8000/api/trigger_buzzer  # 触发蜂鸣器响0.01秒

# 测试三合一红外传感器
curl http://localhost:8000/api/get_infrared_sensors  # 获取A/B/C三个传感器状态
```

**三合一红外传感器测试要点**:
- 发送一次请求即可获取所有3个传感器状态
- 观察WebSocket返回的状态字节（第3个字节）
- 验证位掩码解析：Bit 0=A, Bit 1=B, Bit 2=C
- 前端UI应显示动态图标（Eye/EyeOff）和颜色变化

### 5. 万用表模块测试

```bash
# 测试保留的3个档位
curl http://localhost:8000/api/open_resistense  # RES
curl http://localhost:8000/api/open_cont        # CONT
curl http://localhost:8000/api/open_dcv         # DCV

# 确认删除的端点返回 404
curl http://localhost:8000/api/open_acv  # 应返回 404
curl http://localhost:8000/api/open_dca  # 应返回 404
```

---

## 注意事项

### ⚠️ 破坏性变更

以下修改可能导致与旧版本不兼容：

1. **电源电压档位完全改变**
   - 旧的 0.1V/1.0V/10.0V/10.1V 设置将无法使用
   - 需要更新所有调用电源API的代码

2. **信号发生器命令字节改变**
   - 从 0x30 改为 0x0A
   - 旧设备固件需要同步更新

3. **传感器协议冲突解决**
   - 光强度从 0x0E 改为 0x05
   - 温湿度从 0x0B 改为 0x0D
   - 可能需要固件同步更新

4. **万用表功能删减**
   - ACV 和 DCA 档位完全移除
   - 依赖这两个档位的功能将失效

### 🔄 兼容性建议

1. **版本标识**: 在API响应中添加版本号
2. **固件同步**: 确保硬件固件支持新协议
3. **渐进式升级**: 建议先在测试环境验证
4. **数据备份**: 升级前备份设备状态数据

---

## 版本历史

| 版本 | 日期 | 主要变更 |
|------|------|---------|
| v2.1 | 2025-10-16 | **新增三合一红外传感器组**：位掩码协议(0x0B)、动态Eye/EyeOff图标、单次请求获取3个传感器状态 |
| v2.0 | 2025-10-15 | 完整协议重构：LED扩展、电源调整、信号发生器增强、传感器优化、万用表简化 |
| v1.0 | - | 初始版本 |

---

## 联系方式

如有问题或建议，请联系开发团队。

**文档生成时间**: 2025-10-15
**文档版本**: 2.0.0



```
cat > ~/.local/share/applications/elecpack.desktop << 'EOF'
[Desktop Entry]
Name=ElecPack
Comment=Simple Electron application
Exec=/opt/ElecPack-1.0.0-arm64.AppImage
Icon=application-x-executable
Terminal=false
Type=Application
Categories=Utility;
EOF
```
