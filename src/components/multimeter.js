import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    APICloseMultimeter,
    APIOpenDCV,
    APIOpenACV,
    APIOpenDCA,
    APIOpenCont,
    APIOpenResistense,
} from '../request/api';

function Multimeter() {
    // 从 Redux store 中获取万用表数据
    const multimeterValue = useSelector((state) => state.integratedMachine.multimeterValue);
    const multimeterUnit = useSelector((state) => state.integratedMachine.multimeterUnit);


    const [currentMode, setCurrentMode] = useState('RES'); // 默认选中电阻档
    const [isOn, setIsOn] = useState(false); // 添加总开关状态

    const modes = [
        { key: 'DCV', label: 'DCV', subLabel: '直流电压', unit: 'V', color: 'text-blue-500' },
        { key: 'ACV', label: 'ACV', subLabel: '交流电压', unit: 'V', color: 'text-yellow-500' },
        { key: 'DCA', label: 'DCA', subLabel: '直流电流', unit: 'A', color: 'text-blue-500' },
        { key: 'CONT', label: 'CONT', subLabel: '通断蜂鸣器', unit: '', color: 'text-blue-500' },
        { key: 'RES', label: 'Ω', subLabel: '电阻', unit: 'Ω', color: 'text-green-500' },
    ];

    // 添加万用表控制方法
    const controlMultimeter = async (action, mode = null) => {
        switch (action) {
            case 'open':
                // 打开时默认电阻档
                await APIOpenResistense();
                break;
            case 'close':
                await APICloseMultimeter();
                break;
            case 'changeMode':
                switch (mode) {
                    case 'DCV':
                        await APIOpenDCV();
                        break;
                    case 'ACV':
                        await APIOpenACV();
                        break;
                    case 'DCA':
                        await APIOpenDCA();
                        break;
                    case 'CONT':
                        await APIOpenCont();
                        break;
                    case 'RES':
                        // 电阻档
                        await APIOpenResistense();
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

        return true;
    }

    // 根据当前模式获取显示颜色
    const getDisplayColor = () => {
        const mode = modes.find(m => m.key === currentMode);
        return mode ? mode.color : 'text-foreground';
    };

    // 根据当前模式获取默认单位
    const getDisplayUnit = () => {
        const mode = modes.find(m => m.key === currentMode);
        return mode ? mode.unit : '';
    };

    // 验证返回的单位是否与当前模式匹配
    const isUnitValid = (receivedUnit, currentMode) => {
        const modeUnitMap = {
            'DCV': ['V', 'mV', 'kV'],
            'ACV': ['V', 'mV', 'kV'],
            'DCA': ['A', 'mA', 'μA', 'uA'],
            'RES': ['Ω', 'kΩ', 'MΩ', 'ohm', 'kohm', 'mohm']
        };

        const validUnits = modeUnitMap[currentMode] || [];
        return validUnits.some(unit =>
            receivedUnit?.toLowerCase() === unit.toLowerCase()
        );
    };

    // 获取要显示的数值
    const getDisplayValue = () => {
        if (!isOn) return '---';

        console.log(
            "数值：" + multimeterValue,
            "单位：" + multimeterUnit
        )

        // 检查数据是否与当前模式匹配
        if (multimeterValue !== NaN && multimeterUnit) {
            if (isUnitValid(multimeterUnit, currentMode)) {
                return multimeterValue;
            } else {
                console.warn(`单位不匹配: 收到单位 ${multimeterUnit}, 当前模式 ${currentMode}`);
                return '---'; // 单位不匹配时显示 ---
            }
        }

        return multimeterValue || '---';
    };

    // 获取要显示的单位
    const getDisplayUnitText = () => {
        if (!isOn) return '';

        // 如果有从硬件返回的单位且与当前模式匹配，使用硬件返回的单位
        if (multimeterUnit && isUnitValid(multimeterUnit, currentMode)) {
            return multimeterUnit;
        }

        // 否则使用模式默认单位
        return getDisplayUnit();
    };

    // 总开关切换处理函数
    const handlePowerToggle = async () => {
        const action = isOn ? 'close' : 'open';
        const success = await controlMultimeter(action);
        if (success) {
            setIsOn(!isOn);
            // 如果关闭万用表，清空显示
            if (!isOn) {
                // 万用表关闭时，Redux store 会被清空，这里不需要手动清空状态
            } else {
                // 如果打开万用表，默认切换到电阻档
                setCurrentMode('RES');
            }
        }
    };

    // 模式切换处理函数
    const handleModeChange = async (modeKey) => {
        if (!isOn) return; // 如果万用表未打开，不允许切换模式

        const success = await controlMultimeter('changeMode', modeKey);
        if (success) {
            setCurrentMode(modeKey);
        }
    };

    // 监听 Redux store 中的万用表数据变化
    useEffect(() => {
        // console.log('万用表数值更新:', multimeterValue, '单位:', multimeterUnit);
    }, [multimeterValue, multimeterUnit]);

    useEffect(() => {
        // 如果值变为null或'---'，可能表示设备关闭
        if (multimeterValue === null || multimeterValue === '---') {
            console.log('检测到万用表数据清空，可能设备已关闭');
            setIsOn(false);
        }
    }, [multimeterValue]);

    return (
        <div className="mx-auto px-4 sm:container pt-[10px] pb-[20px] mt-[10px] bg-[#f6f6f6] rounded-[10px]">
            {/* 标题和副标题 */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">数字万用表</h2>
                    <p className="text-sm text-gray-600">多功能电子测量仪表</p>
                </div>
                {/* 总开关按钮 */}
                <label className="inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isOn}
                        onChange={handlePowerToggle}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                    <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        {isOn ? '开启' : '关闭'}
                    </span>
                </label>
            </div>

            {/* 主要显示区域 */}
            <div className="flex items-end justify-center bg-[#1a1a1a] p-8 rounded-[10px] mb-6">
                <span className={`text-6xl font-mono leading-none transition-colors duration-300 ${getDisplayColor()}`}>
                    {getDisplayValue()}
                </span>
                <span className={`text-4xl font-mono leading-none ml-2 transition-colors duration-300 ${getDisplayColor()}`}>
                    {getDisplayUnitText()}
                </span>
            </div>


            {/* 模式按钮 */}
            <div className="grid grid-cols-5 gap-4">
                {modes.map((mode) => (
                    <button
                        key={mode.key}
                        className={`flex flex-col items-center justify-center py-3 px-2 rounded-[5px] transition-colors duration-200 
                                   ${currentMode === mode.key && isOn ? 'bg-[#3b82f6] text-white' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'} 
                                   ${!isOn && 'opacity-50 cursor-not-allowed'}`}
                        onClick={() => handleModeChange(mode.key)}
                        disabled={!isOn}
                    >
                        <span className="text-sm font-semibold">{mode.label}</span>
                        <span className="text-xs">{mode.subLabel}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}


export default Multimeter;