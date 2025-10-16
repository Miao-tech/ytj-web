import { useEffect, useState } from "react";
import { useSelector } from 'react-redux'
import { Bell, Sun, Thermometer, Droplets, Waves } from 'lucide-react'
import {
    APIGetDistance,
    APIGetLight,
    APIGetTemperature,
    APITriggerBuzzer
} from "../request/api";

function SensorNew() {
    const infraredSensor = useSelector((state) => state.integratedMachine.infraredSensor)
    const lightIntensitySensor = useSelector((state) => state.integratedMachine.lightIntensitySensor)
    const temperature = useSelector((state) => state.integratedMachine.temperature)
    const humidity = useSelector((state) => state.integratedMachine.humidity)
    const buzzer = useSelector((state) => state.integratedMachine.buzzer)

    const [loading2, setLoading2] = useState(false)
    const [loading3, setLoading3] = useState(false)
    const [loading4, setLoading4] = useState(false)
    const [loading5, setLoading5] = useState(false)
    const [loading6, setLoading6] = useState(false)
    
    // 🕐 新增：自动刷新相关状态
    const [autoRefresh, setAutoRefresh] = useState(true)
    const [lastUpdateTime, setLastUpdateTime] = useState(new Date())
    const [nextUpdateCountdown, setNextUpdateCountdown] = useState(60)

    // 🕐 新增：统一的传感器数据刷新函数
    const refreshAllSensors = async (isAutoRefresh = false) => {
        if (isAutoRefresh) {
            console.log('🕐 自动刷新传感器数据...');
        } else {
            console.log('🔄 手动刷新传感器数据...');
        }

        try {
            // 并行获取所有传感器数据
            const promises = [
                APIGetTemperature(),
                APIGetLight(),
                APIGetDistance()
            ];

            await Promise.all(promises);
            setLastUpdateTime(new Date());
            console.log('✅ 传感器数据刷新完成');
        } catch (error) {
            console.error('❌ 传感器数据刷新失败:', error);
        }
    };

    // 🕐 新增：自动刷新定时器
    useEffect(() => {
        let refreshInterval;
        let countdownInterval;

        if (autoRefresh) {
            // 组件挂载时立即获取一次数据
            refreshAllSensors(true);

            // 设置每分钟自动刷新
            refreshInterval = setInterval(() => {
                refreshAllSensors(true);
                setNextUpdateCountdown(60); // 重置倒计时
            }, 60000); // 60秒 = 60000毫秒

            // 设置倒计时更新
            countdownInterval = setInterval(() => {
                setNextUpdateCountdown(prev => {
                    if (prev <= 1) {
                        return 60; // 重置为60秒
                    }
                    return prev - 1;
                });
            }, 1000); // 每秒更新倒计时

            console.log('🕐 传感器自动刷新已启用 (每60秒)');
        }

        // 清理定时器
        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
                console.log('🕐 传感器自动刷新已停止');
            }
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
        };
    }, [autoRefresh]);

    // 🕐 新增：手动刷新单个传感器的函数
    const refreshSingleSensor = async (sensorType, setLoading) => {
        setLoading(true);
        try {
            switch (sensorType) {
                case 'temperature':
                    await APIGetTemperature();
                    break;
                case 'light':
                    await APIGetLight();
                    break;
                case 'distance':
                    await APIGetDistance();
                    break;
                case 'buzzer':
                    // 蜂鸣器触发 - 发送命令使其响0.01秒
                    await APITriggerBuzzer();
                    console.log('🔔 蜂鸣器已触发');
                    break;
                default:
                    console.error('未知传感器类型:', sensorType);
            }
            setLastUpdateTime(new Date());
        } catch (error) {
            console.error(`${sensorType}传感器刷新失败:`, error);
        } finally {
            setLoading(false);
        }
    };

    const lucideIconEle = (IconComponent, iconColor = "black", bgColor = "white") => <div style={{
        height: "60px",
        width: "60px",
        borderRadius: "100px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginRight: "10px",
        background: bgColor
    }}>
        <IconComponent size={30} color={iconColor} />
    </div>

    return (
        <div className="py-[10px] mx-auto px-4 sm:container mt-[10px] pb-6" style={{
            backgroundColor: "#1a1d2e",
            borderRadius: "5px"
        }}>
            {/* 标题和自动刷新控制 */}
            <div className='mb-2'>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }}>
                    <h2 className="text-xl font-semibold text-white">传感器</h2>
                    
                    {/* 🕐 新增：自动刷新控制面板 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {/* 自动刷新开关 */}
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                            />
                            <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className="ml-2 text-sm font-medium text-white">
                                自动刷新
                            </span>
                        </label>

                        {/* 状态信息 */}
                        <div className="text-xs text-white">
                            {autoRefresh ? (
                                <div>
                                    <div>下次更新: {nextUpdateCountdown}秒</div>
                                    <div>上次更新: {lastUpdateTime.toLocaleTimeString()}</div>
                                </div>
                            ) : (
                                <div>自动刷新已关闭</div>
                            )}
                        </div>

                        {/* 手动全部刷新按钮 */}
                        <button
                            onClick={() => refreshAllSensors(false)}
                            className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded transition-colors"
                        >
                            全部刷新
                        </button>
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-5 sm:container p-6 rounded-lg shadow-sm border' style={{ backgroundColor: "#252a3d" }}>
                {/* 光强度传感器 */}
                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <div className="flex flex-row">
                        {lucideIconEle(Sun, 'rgb(248, 195, 60)', 'rgb(245, 234, 205)')}

                        <div style={{ fontSize: '16px', marginRight: "20px", textAlign: "left" }}>
                            <div className="text-m text-white" >光强度传感器</div>
                            <div className="text-2xl font-mono font-bold text-white">
                                {lightIntensitySensor}
                                <span className="text-white text-sm ml-1">Lux</span>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {
                                loading3 ?
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer", animation: 'spin 1s linear infinite', color: 'white' }}></span>
                                    :
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer", color: 'white' }} onClick={() => refreshSingleSensor('light', setLoading3)}></span>
                            }
                        </div>
                    </div>
                </div>

                {/* 温度传感器 */}
                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <div className="flex flex-row">
                        {lucideIconEle(Thermometer, 'rgb(245, 94, 80)', 'rgb(244, 214, 212)')}

                        <div style={{ fontSize: '16px', marginRight: "20px", textAlign: "left" }}>
                            <div className="text-m text-white" >温度传感器</div>
                            <div className="text-2xl font-mono font-bold text-white">
                                {temperature}
                                <span className="text-white text-sm ml-1">°C</span>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {
                                loading4 ?
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer", animation: 'spin 1s linear infinite', color: 'white' }}></span>
                                    :
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer", color: 'white' }} onClick={() => refreshSingleSensor('temperature', setLoading4)}></span>
                            }
                        </div>
                    </div>
                </div>

                {/* 湿度传感器 */}
                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <div className="flex flex-row">
                        {lucideIconEle(Droplets, 'rgb(78, 158, 240)', 'rgb(207, 225, 244)')}

                        <div style={{ fontSize: '16px', marginRight: "20px", textAlign: "left" }}>
                            <div className="text-m text-white" >湿度传感器</div>
                            <div className="text-2xl font-mono font-bold text-white">
                                {humidity}
                                <span className="text-white text-sm ml-1">%</span>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {
                                loading5 ?
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer", animation: 'spin 1s linear infinite', color: 'white' }}></span>
                                    :
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer", color: 'white' }} onClick={() => refreshSingleSensor('temperature', setLoading5)}></span>
                            }
                        </div>
                    </div>
                </div>

                {/* 超声波传感器 */}
                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <div className="flex flex-row">
                        {lucideIconEle(Waves, 'rgb(149, 48, 173)', 'rgb(225, 205, 231)')}

                        <div style={{ fontSize: '16px', marginRight: "20px", textAlign: "left" }}>
                            <div className="text-m text-white" >超声波传感器</div>
                            <div className="text-2xl font-mono font-bold text-white">
                                {infraredSensor}
                                <span className="text-white text-sm ml-1">cm</span>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {
                                loading2 ?
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer", animation: 'spin 1s linear infinite', color: 'white' }}></span>
                                    :
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer", color: 'white' }} onClick={() => refreshSingleSensor('distance', setLoading2)}></span>
                            }
                        </div>
                    </div>
                </div>

                {/* 蜂鸣器传感器 */}
                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <div className="flex flex-row">
                        {lucideIconEle(Bell, 'rgb(255, 87, 34)', 'rgb(255, 224, 178)')}

                        <div style={{ fontSize: '16px', marginRight: "20px", textAlign: "left" }}>
                            <div className="text-m text-white" >蜂鸣器</div>
                            <div className="text-2xl font-mono font-bold text-white">
                                100
                                <span className="text-white text-sm ml-1">ms</span>
                            </div>
                        </div>

                        {/* <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {
                                loading6 ?
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer", animation: 'spin 1s linear infinite', color: 'white' }}></span>
                                    :
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer", color: 'white' }} onClick={() => refreshSingleSensor('buzzer', setLoading6)}></span>
                            }
                        </div> */}
                    </div>
                </div>
            </div>

            {/* 🕐 新增：添加旋转动画的CSS */}
            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default SensorNew;
