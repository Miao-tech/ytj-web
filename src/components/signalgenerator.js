import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import wsManager from '../io';

function SignalGenerator() {
    // 从 Redux store 中获取信号发生器数据
    const signalGeneratorData = useSelector((state) => {
        const integratedMachine = state?.integratedMachine || {};
        return integratedMachine.signalGenerator || {
            waveform: 'sine',
            frequency: 1000,
            amplitude: 1.0,
            dcOffset: 0.0,
            outputEnabled: false
        };
    });

    // 支持的电压档位
    const freqOptions = [
        { value: 1, label: '1 Hz' },
        { value: 100, label: '100 Hz' },
    ];
    
    const [waveform, setWaveform] = useState('sine');
    const [frequency, setFrequency] = useState(1);
    const [amplitude, setAmplitude] = useState(1.0);
    const [dcOffset, setDcOffset] = useState(0.0);
    const [outputEnabled, setOutputEnabled] = useState(false);
    const [customFrequency, setCustomFrequency] = useState('1000');

    // 波形选项
    const waveformOptions = [
        { value: 'sine', label: '正弦波', icon: '〜' },
        { value: 'square', label: '方波', icon: '⊏' },
        { value: 'triangle', label: '三角波', icon: '△' }
    ];

    // 格式化频率显示
    const formatFrequency = (freq) => {
        if (freq < 1000) return `${freq} Hz`;
    };

    // 波形预览SVG生成
    const renderWaveformPreview = () => {
        const width = 200;
        const height = 80;
        const numPoints = 100;
        const points = [];
        
        for (let i = 0; i <= numPoints; i++) {
            const x = (i / numPoints) * width;
            let y = height / 2;
            
            const t = (i / numPoints) * Math.PI * 4;
            const amplitude_px = (height / 2 - 5) * (amplitude / 5);
            const offset_px = dcOffset * height / 6;
            
            switch (waveform) {
                case 'sine':
                    y = height / 2 + Math.sin(t) * amplitude_px + offset_px;
                    break;
                case 'square':
                    y = height / 2 + (Math.sin(t) > 0 ? -amplitude_px : amplitude_px) + offset_px;
                    break;
                case 'triangle':
                    y = height / 2 + ((Math.abs(((t / Math.PI) % 2) - 1) * 2 - 1) * amplitude_px) + offset_px;
                    break;
            }
            
            points.push({ x: Math.floor(x), y: Math.max(0, Math.min(height, Math.floor(y))) });
        }
        
        const pathCommands = points.map((point, i) => 
            `${i === 0 ? 'M' : 'L'}${point.x},${point.y}`
        ).join(' ');
        
        return (
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                {/* 网格线 */}
                <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#333" strokeWidth="0.5"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3"/>
                
                {/* 中心线 */}
                <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#666" strokeWidth="1" strokeDasharray="3,3"/>
                
                {/* 波形 */}
                <path 
                    d={pathCommands} 
                    fill="none" 
                    stroke={outputEnabled ? "#f7df1e" : "#888"} 
                    strokeWidth="2"
                />
            </svg>
        );
    };

    // 输出开关切换
    const handleOutputToggle = async () => {
        const newState = !outputEnabled;
        console.log('信号发生器输出切换:', newState ? '开启' : '关闭');
        
        if (newState) {
            // 开启时：发送波形和频率设置请求
            console.log(`设置波形: ${waveform}, 频率: ${frequency}Hz`);
            const success = await wsManager.controlSignalGenerator('set_waveform', {
                waveform: waveform,
                frequency: frequency
            });
            
            if (success) {
                setOutputEnabled(true);
            }
        } else {
            // 关闭时：发送停止请求
            const success = await wsManager.controlSignalGenerator('stop');
            if (success) {
                setOutputEnabled(false);
            }
        }
    };

    // 修改波形切换函数（仅在关闭状态下允许切换）
    const handleWaveformChange = (newWaveform) => {
        if (outputEnabled) {
            console.log('输出开启时不允许切换波形');
            return;
        }
        setWaveform(newWaveform);
        console.log(`波形切换为: ${newWaveform}`);
    };

    // 修改频率切换函数（仅在关闭状态下允许切换）
    const handleFrequencyChange = (newFrequency) => {
        if (outputEnabled) {
            console.log('输出开启时不允许切换频率档位');
            return;
        }
        setFrequency(newFrequency);
        console.log(`频率档位切换为: ${newFrequency}Hz`);
    };




    // 监听 Redux store 变化
    useEffect(() => {
        console.log('信号发生器数据更新:', signalGeneratorData);
    }, [signalGeneratorData]);

    return (
        <div className="mx-auto px-4 sm:container pt-[10px] pb-[20px] mt-[10px] bg-[#f6f6f6] rounded-[10px]">
            {/* 标题和总开关 */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">信号发生器</h2>
                    <p className="text-sm text-gray-600">生成各种波形信号</p>
                </div>
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
                    <h3 className="text-lg font-medium mb-4 text-gray-800">信号控制</h3>
                    
                    {/* 波形选择 */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">波形选择</label>
                        <div className="grid grid-cols-3 gap-2">
                            {waveformOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleWaveformChange(option.value)}
                                    className={`
                                        p-3 rounded-md text-sm font-medium transition-all duration-200 flex flex-col items-center
                                        ${waveform === option.value 
                                            ? 'bg-blue-500 text-white shadow-md' 
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }
                                    `}
                                >
                                    <span className="text-lg mb-1">{option.icon}</span>
                                    <span className="text-xs">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 频率控制 */}
                    <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2">
                            <label className="text-gray-700">频率</label>
                            <span className="font-mono text-blue-600">{formatFrequency(frequency)}</span>
                        </div>
                        {/* 自定义ToggleGroup样式 */}
                        <div className="grid grid-cols-2 gap-2">
                            {freqOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleFrequencyChange(option.value)}
                                    className={`
                                        py-2 px-3 rounded-md text-sm font-medium transition-all duration-200
                                        ${frequency === option.value 
                                            ? 'bg-blue-500 text-white shadow-md' 
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }
                                    `}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        {/* // 添加提示信息 */}
                        {outputEnabled && (
                            <div className="text-xs text-orange-600 mt-2 text-center">
                                输出开启时无法切换设置，请先关闭输出
                            </div>
                        )}

                        {!outputEnabled && (
                            <div className="text-xs text-gray-500 mt-2 text-center">
                                选择波形和频率后点击开启输出
                            </div>
                        )}
                    </div>

                </div>

                {/* 右侧：波形预览和状态显示 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-medium mb-4 text-gray-800">波形预览</h3>
                    
                    {/* 波形显示区域 */}
                    <div className={`h-40 border rounded-md p-2 mb-4 ${outputEnabled ? 'bg-black' : 'bg-gray-800'}`}>
                        {renderWaveformPreview()}
                    </div>

                    {/* 参数显示 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                            <div className="text-xs text-gray-600 mb-1">波形类型</div>
                            <div className="text-sm font-semibold text-gray-800">
                                {waveformOptions.find(w => w.value === waveform)?.label}
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded">
                            <div className="text-xs text-gray-600 mb-1">频率</div>
                            <div className="text-sm font-semibold text-blue-600">
                                {formatFrequency(frequency)}
                            </div>
                        </div>
                        
                        
                        <div className="bg-gray-50 p-3 rounded">
                            <div className="text-xs text-gray-600 mb-1">输出状态</div>
                            <div className={`text-sm font-semibold ${outputEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                                {outputEnabled ? '运行中' : '已停止'}
                            </div>
                        </div>
                    </div>

                    {/* DC偏置显示 */}
                    {Math.abs(dcOffset) > 0.01 && (
                        <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <div className="text-xs text-yellow-700">
                                DC偏置: <span className="font-mono">{dcOffset.toFixed(2)}V</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}

export default SignalGenerator;