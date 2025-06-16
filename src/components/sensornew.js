import { useEffect, useState } from "react";
import { useSelector } from 'react-redux'
import {
    APIGetDistance,
    APIGetLight,
    APIGetTemperature,
    APIGetGesture
} from "../request/api";

function SensorNew() {
    const gestureSensor = useSelector((state) => state.integratedMachine.gestureSensor)
    const infraredSensor = useSelector((state) => state.integratedMachine.infraredSensor)
    const lightIntensitySensor = useSelector((state) => state.integratedMachine.lightIntensitySensor)
    const temperature = useSelector((state) => state.integratedMachine.temperature)
    const humidity = useSelector((state) => state.integratedMachine.humidity)

    const [loading1, setLoading1] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const [loading3, setLoading3] = useState(false)
    const [loading4, setLoading4] = useState(false)
    const [loading5, setLoading5] = useState(false)
    
    // 🕐 新增：自动刷新相关状态
    const [autoRefresh, setAutoRefresh] = useState(true)
    const [lastUpdateTime, setLastUpdateTime] = useState(new Date())
    const [nextUpdateCountdown, setNextUpdateCountdown] = useState(60)

    // 手势传感器数值转换成文本
    const [gestureSensorText, setGestureSensorText] = useState("-")
    useEffect(() => {
        switch (gestureSensor) {
            case 1:
                setGestureSensorText("手势1")
                break;
            case 2:
                setGestureSensorText("手势2")
                break;
            case 3:
                setGestureSensorText("手势3")
                break;
            case 4:
                setGestureSensorText("手势4")
                break;
            case 5:
                setGestureSensorText("手势5")
                break;
            case 6:
                setGestureSensorText("手势6")
                break;
            case 7:
                setGestureSensorText("手势7")
                break;
            case 8:
                setGestureSensorText("手势8")
                break;
            case 9:
                setGestureSensorText("手势9")
                break;
            default:
                setGestureSensorText("-")
        };
    }, [gestureSensor]);

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
                APIGetGesture(), 
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
                case 'gesture':
                    await APIGetGesture();
                    break;
                case 'light':
                    await APIGetLight();
                    break;
                case 'distance':
                    await APIGetDistance();
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

    const iconEle = (iconName, iconColor = "black", bgColor = "white") => <div style={{
        height: "60px",
        width: "60px",
        borderRadius: "100px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginRight: "10px",
        background: bgColor,
        color: iconColor
    }}>
        <span className={["iconfont", iconName].join(' ')} style={{ fontSize: '30px' }}></span>
    </div>

    return (
        <div className="py-[10px] mx-auto px-4 sm:container mt-[10px] pb-6" style={{
            backgroundColor: "#f6f6f6",
            borderRadius: "5px"
        }}>
            {/* 标题和自动刷新控制 */}
            <div className='mb-2'>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }}>
                    <h2 className="text-xl font-semibold text-gray-900">传感器</h2>
                    
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
                            <span className="ml-2 text-sm font-medium text-gray-700">
                                自动刷新
                            </span>
                        </label>

                        {/* 状态信息 */}
                        <div className="text-xs text-gray-500">
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

            <div className='grid grid-cols-5 sm:container bg-white p-6 rounded-lg shadow-sm border'>
                {/* 温度传感器 */}
                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <div className="flex flex-row">
                        {iconEle('icon-wenduji', 'rgb(245, 94, 80)', 'rgb(244, 214, 212)')}

                        <div style={{ fontSize: '16px', marginRight: "20px", textAlign: "left" }}>
                            <div className="text-m text-muted-foreground" >温度传感器</div>
                            <div className="text-2xl font-mono font-bold">
                                {temperature}
                                <span className="text-muted-foreground text-sm ml-1">°C</span>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {
                                loading4 ?
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer", animation: 'spin 1s linear infinite' }}></span>
                                    :
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer" }} onClick={() => refreshSingleSensor('temperature', setLoading4)}></span>
                            }
                        </div>
                    </div>
                </div>

                {/* 湿度传感器 */}
                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <div className="flex flex-row">
                        {iconEle('icon-wenduji', 'rgb(78, 158, 240)', 'rgb(207, 225, 244)')}

                        <div style={{ fontSize: '16px', marginRight: "20px", textAlign: "left" }}>
                            <div className="text-m text-muted-foreground" >湿度传感器</div>
                            <div className="text-2xl font-mono font-bold">
                                {humidity}
                                <span className="text-muted-foreground text-sm ml-1">%</span>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {
                                loading5 ?
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer", animation: 'spin 1s linear infinite' }}></span>
                                    :
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer" }} onClick={() => refreshSingleSensor('temperature', setLoading5)}></span>
                            }
                        </div>
                    </div>
                </div>

                {/* 光强度传感器 */}
                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <div className="flex flex-row">
                        {iconEle('icon-a-cellimage_huaban1fuben94', 'rgb(248, 195, 60)', 'rgb(245, 234, 205)')}

                        <div style={{ fontSize: '16px', marginRight: "20px", textAlign: "left" }}>
                            <div className="text-m text-muted-foreground" >光强度传感器</div>
                            <div className="text-2xl font-mono font-bold">
                                {lightIntensitySensor}
                                <span className="text-muted-foreground text-sm ml-1">Lux</span>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {
                                loading3 ?
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer", animation: 'spin 1s linear infinite' }}></span>
                                    :
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer" }} onClick={() => refreshSingleSensor('light', setLoading3)}></span>
                            }
                        </div>
                    </div>
                </div>

                {/* 手势传感器 */}
                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <div className="flex flex-row">
                        {iconEle('icon-a-shoushoushi', 'rgb(97, 175, 91)', 'rgb(214, 230, 214)')}

                        <div style={{ fontSize: '16px', marginRight: "20px", textAlign: "left" }}>
                            <div className="text-m text-muted-foreground" >手势传感器</div>
                            <div className="text-2xl font-mono font-bold">
                                {gestureSensorText}
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {
                                loading1 ?
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer", animation: 'spin 1s linear infinite' }}></span>
                                    :
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer" }} onClick={() => refreshSingleSensor('gesture', setLoading1)}></span>
                            }
                        </div>
                    </div>
                </div>

                {/* 红外传感器 */}
                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <div className="flex flex-row">
                        {iconEle('icon-act006', 'rgb(149, 48, 173)', 'rgb(225, 205, 231)')}

                        <div style={{ fontSize: '16px', marginRight: "20px", textAlign: "left" }}>
                            <div className="text-m text-muted-foreground" >红外传感器</div>
                            <div className="text-2xl font-mono font-bold">
                                {infraredSensor}
                                <span className="text-muted-foreground text-sm ml-1">cm</span>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {
                                loading2 ?
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer", animation: 'spin 1s linear infinite' }}></span>
                                    :
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer" }} onClick={() => refreshSingleSensor('distance', setLoading2)}></span>
                            }
                        </div>
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
