import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { APIPowerSupplyOff, APIPowerSupplyOn, APISetVoltage } from '../request/api';

function PowerSupply() {
    // 从 Redux store 中获取电源数据

    const powerSupplyData = useSelector((state) => state.integratedMachine.powerSupply);

    // 支持的电压档位
    const voltageOptions = [
        { value: 0.1, label: '0.1 V' },
        { value: 1.0, label: '1.0 V' },
        { value: 10.0, label: '10.0 V' },
        { value: 10.1, label: '10.1 V' }
    ];

    const [voltage, setVoltage] = useState(1.0);
    // const [currentLimit, setCurrentLimit] = useState(1.0);
    const [outputEnabled, setOutputEnabled] = useState(false);
    const [isAdjusting] = useState(false);

    // 格式化数值显示
    const formatValue = (value, decimals = 2) => {
        return Number(value).toFixed(decimals);
    };

    // 获取实际输出值（优先显示硬件返回的数据）
    const getActualVoltage = () => {
        return powerSupplyData?.actualVoltage ?? (outputEnabled ? voltage : 0);
    };

    // const getActualCurrent = () => {
    //     return powerSupplyData?.actualCurrent ?? (outputEnabled ? 0.1 : 0);
    // };


    // 添加电源控制方法
    const controlPowerSupply = async (action, value = null) => {
        switch (action) {
            case 'output':
                if (value) {
                    await APIPowerSupplyOn();
                } else {
                    await APIPowerSupplyOff();
                }
                break;
            case 'voltage':
                await APISetVoltage(value)
                break;
            default:
                console.error('未知电源控制动作:', action);
                return false;
        }

        return true;
    }

    // 输出开关切换
    const handleOutputToggle = async () => {
        const newState = !outputEnabled;
        console.log('电源输出切换:', newState ? '开启' : '关闭');

        if (newState) {
            // 开启时：先发送电压设置请求，再开启输出
            console.log(`设置电压为: ${voltage}V`);
            const voltageSuccess = await controlPowerSupply('voltage', voltage);

            if (voltageSuccess) {
                const outputSuccess = await controlPowerSupply('output', true);
                if (outputSuccess) {
                    setOutputEnabled(true);
                }
            }
        } else {
            // 关闭时：直接关闭输出
            const success = await controlPowerSupply('output', false);
            if (success) {
                setOutputEnabled(false);
            }
        }
    };

    // 电压档位切换（仅在关闭状态下允许切换）
    // const handleVoltageChange = (newVoltage) => {
    //     if (outputEnabled) {
    //         console.log('输出开启时不允许切换电压档位');
    //         return;
    //     }
    //     setVoltage(newVoltage);
    //     console.log(`电压档位切换为: ${newVoltage}V`);
    // };
    // 修改电压档位切换函数
    const handleVoltageChange = async (newVoltage) => {
        setVoltage(newVoltage);
        console.log(`电压档位切换为: ${newVoltage}V`);

        // 如果输出已开启，立即发送电压设置请求
        if (outputEnabled) {
            const success = await controlPowerSupply('voltage', newVoltage);
            console.log('电压设置结果:', success ? '成功' : '失败');
        }
    };


    // 监听 Redux store 中的电源数据变化
    useEffect(() => {
        console.log('电源数据更新:', powerSupplyData);
    }, [powerSupplyData]);


    return (
        <div className="mx-auto px-4 sm:container pt-[10px] pb-[20px] mt-[10px] bg-[#f6f6f6] rounded-[10px]">
            {/* 标题和副标题 */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">直流电源</h2>
                    <p className="text-sm text-gray-600">可调电压电源控制</p>
                </div>
                {/* 总输出开关 */}
                <label className="inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={outputEnabled}
                        onChange={handleOutputToggle}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                    <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        {outputEnabled ? '输出开启' : '输出关闭'}
                    </span>
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 左侧：控制面板 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-medium mb-4 text-gray-800">输出控制</h3>

                    {/* 电压控制 - 改为档位选择 */}
                    <div className="mb-6">
                        <div className="flex justify-between text-sm mb-3">
                            <span className="text-gray-600">输出电压</span>
                            <span className="font-mono text-blue-600">{voltage} V</span>
                        </div>

                        {/* 自定义ToggleGroup样式 */}
                        <div className="grid grid-cols-2 gap-2">
                            {voltageOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleVoltageChange(option.value)}
                                    disabled={false}
                                    className={`
                                        py-2 px-3 rounded-md text-sm font-medium transition-all duration-200
                                        ${voltage === option.value
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }
                                        ${!outputEnabled && 'opacity-50 cursor-not-allowed'}
                                        ${isAdjusting && voltage === option.value && 'opacity-75'}
                                    `}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        {isAdjusting && (
                            <div className="text-xs text-orange-600 mt-2 text-center">正在切换电压档位...</div>
                        )}

                        {/* {!outputEnabled && (
                            <div className="text-xs text-gray-500 mt-2 text-center">请先开启输出后选择电压档位</div>
                        )} */}

                        {outputEnabled ? (
                            <div className="text-xs text-green-600 mt-2 text-center">
                                切换档位将立即应用到输出
                            </div>
                        ) : (
                            <div className="text-xs text-gray-500 mt-2 text-center">
                                选择电压档位后点击开启输出
                            </div>
                        )}
                    </div>

                    {/* 状态指示 */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${outputEnabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-sm text-gray-700">输出状态</span>
                        </div>
                        <span className={`text-sm font-medium ${outputEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                            {outputEnabled ? '启用' : '禁用'}
                        </span>
                    </div>
                </div>

                {/* 右侧：实时测量显示 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-medium mb-4 text-gray-800">实时测量</h3>

                    <div className="space-y-4">
                        {/* 输出电压显示 */}
                        <div className="bg-[#1a1a1a] p-4 rounded-lg">
                            <div className="text-xs mb-1 text-gray-400">输出电压</div>
                            <div className="flex items-end">
                                <span className="text-4xl font-mono text-blue-500 leading-none">
                                    {outputEnabled ? formatValue(getActualVoltage(), 2) : formatValue(0.0, 2)}
                                </span>
                                <span className="text-2xl text-blue-400 ml-1 mb-1">V</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
}

export default PowerSupply;