import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import wsManager from '../io';
import { APICloseOCC, APIOpenOCC } from '../request/api';

function Oscilloscope() {
    const [isRunning, setIsRunning] = useState(false);
    const chartRef = useRef(null);
    const dataPoints = useRef([]);
    const maxDataPoints = 100;
    const updateTimer = useRef(null);
    const lastUpdateTime = useRef(0);
    const updateInterval = 100; // 增加到100ms，减少更新频率
    const pendingUpdates = useRef(false);
    const dataBuffer = useRef([]); // 添加数据缓冲区

    // 批量更新图表数据
    const batchUpdateChart = useCallback(() => {
        if (!chartRef.current || !pendingUpdates.current || dataBuffer.current.length === 0) {
            return;
        }

        // 处理缓冲区中的所有数据
        dataBuffer.current.forEach(value => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString();

            dataPoints.current.push({
                time: timeStr,
                value: value,
                timestamp: now.getTime()
            });

            if (dataPoints.current.length > maxDataPoints) {
                dataPoints.current.shift();
            }
        });

        // 清空缓冲区
        dataBuffer.current = [];

        // 更新图表
        const times = dataPoints.current.map(point => point.time);
        const values = dataPoints.current.map(point => point.value);

        // 计算动态Y轴范围
        if (values.length > 0) {
            const recentValues = values.slice(-20);
            const avg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
            const range = 50;

            chartRef.current.getEchartsInstance().setOption({
                xAxis: {
                    data: times
                },
                yAxis: {
                    min: avg - range,
                    max: avg + range
                },
                series: [{
                    data: values
                }]
            }, {
                animation: false,
                silent: true,
                lazyUpdate: true // 延迟更新
            });
        }

        pendingUpdates.current = false;
    }, []);

    // 优化的添加数据点方法
    const addDataPoint = useCallback((value) => {
        if (!isRunning) return;

        // 将数据添加到缓冲区
        dataBuffer.current.push(value);

        // 标记有待更新
        pendingUpdates.current = true;

        // 使用防抖更新
        const currentTime = performance.now();
        if (currentTime - lastUpdateTime.current >= updateInterval) {
            lastUpdateTime.current = currentTime;

            // 使用 requestAnimationFrame 确保在下一个重绘周期更新
            if (updateTimer.current) {
                cancelAnimationFrame(updateTimer.current);
            }

            updateTimer.current = requestAnimationFrame(() => {
                batchUpdateChart();
            });
        }
    }, [isRunning, batchUpdateChart]);

    // 添加示波器控制方法
    const controlOscilloscope = async (isOpen) => {
        if (isOpen) {
            await APIOpenOCC();
        } else {
            await APICloseOCC();
        }
        return true;
    }

    const handleOscilloscopeControl = async () => {
        const success = await controlOscilloscope(!isRunning);
        if (success) {
            setIsRunning(!isRunning);

            // 如果停止运行，清理待处理的更新
            if (isRunning) {
                if (updateTimer.current) {
                    cancelAnimationFrame(updateTimer.current);
                    updateTimer.current = null;
                }
                dataBuffer.current = [];
                pendingUpdates.current = false;
            }
        }
    };

    useEffect(() => {
        const handleOscilloscopeData = (value) => {
            if (value === null) {
                setIsRunning(false)
            } else if (isRunning) {
                addDataPoint(value);
            }
        };

        wsManager.onOscilloscopeData(handleOscilloscopeData);

        return () => {
            wsManager.offOscilloscopeData(handleOscilloscopeData);
            if (updateTimer.current) {
                cancelAnimationFrame(updateTimer.current);
            }
        };
    }, [isRunning, addDataPoint]);

    // 清理数据的方法
    // const clearData = useCallback(() => {
    //     dataPoints.current = [];
    //     dataBuffer.current = [];
    //     pendingUpdates.current = false;

    //     if (chartRef.current) {
    //         chartRef.current.getEchartsInstance().setOption({
    //             xAxis: { data: [] },
    //             series: [{ data: [] }]
    //         });
    //     }
    // }, []);

    // 优化的图表配置
    const options = {
        animation: false,
        // backgroundColor: '#1a1a1a',
        title: {
            // text: '示波器数据波形',
            left: 'center',
            textStyle: {
                // color: '#f7df1e',
                fontSize: 18,
                fontWeight: 'bold'
            }
        },
        tooltip: {
            trigger: 'axis',
            // backgroundColor: 'rgba(0,0,0,0.8)',
            // borderColor: '#f7df1e',
            // textStyle: {
            // color: '#fff'
            // },
            formatter: function (params) {
                const data = params[0];
                return `时间: ${data.name}<br/>数值: ${data.value?.toFixed(2) || 'N/A'}`;
            },
            // 优化tooltip性能
            confine: true,
            transitionDuration: 0
        },
        grid: {
            left: '2%',
            right: '2%',
            bottom: '5%',
            top: '10%',
            containLabel: true,
            // backgroundColor: '#000',
            // borderColor: '#333'
        },
        toolbox: {
            feature: {
                saveAsImage: {
                    title: '保存图片',
                    iconStyle: {
                        borderColor: '#f7df1e'
                    }
                }
            },
            iconStyle: {
                // borderColor: '#f7df1e'
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: [],
            axisLine: {
                lineStyle: {
                    // color: '#333'
                }
            },
            axisTick: {
                lineStyle: {
                    // color: '#333'
                }
            },
            axisLabel: {
                // color: '#666',
                fontSize: 10,
                interval: 'auto', // 自动间隔显示标签
                rotate: 0
            },
            splitLine: {
                show: true,
                lineStyle: {
                    // color: '#222',
                    type: 'dashed'
                }
            }
        },
        yAxis: {
            type: 'value',
            axisLine: {
                lineStyle: {
                    // color: '#333'
                }
            },
            axisTick: {
                lineStyle: {
                    // color: '#333'
                }
            },
            axisLabel: {
                // color: '#666',
                fontSize: 10,
                formatter: function (value) {
                    return value.toFixed(1);
                }
            },
            splitLine: {
                lineStyle: {
                    // color: '#222',
                    type: 'dashed'
                }
            },
            // 设置初始范围
            min: -100,
            max: 100
        },
        series: [
            {
                name: '示波器数据',
                type: 'line',
                smooth: false,
                symbol: 'none',
                lineStyle: {
                    width: 2,
                    // color: '#f7df1e'
                },
                data: [],
                // 优化性能的配置
                large: true, // 开启大数据量优化
                largeThreshold: 50, // 大数据量阈值
                sampling: 'lttb' // 降采样策略
            }
        ],
        // 全局性能优化配置
        useUTC: false,
        progressive: 0, // 关闭渐进式渲染
        progressiveThreshold: 0
    };

    return (
        <div className="mx-auto px-4 sm:container mt-[10px] pb-6" style={{
            backgroundColor: "#f6f6f6",
            borderRadius: "10px"
        }}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold mt-3">示波器</h2>
                <div className="flex items-center gap-4">
                    {/* <button 
                        onClick={clearData}
                        className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                        disabled={isRunning}
                    >
                        清除数据
                    </button> */}
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isRunning}
                            onChange={handleOscilloscopeControl}
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            {isRunning ? '运行中' : '已停止'}
                        </span>
                    </label>
                </div>
            </div>

            <div className="mb-2 text-sm text-gray-600">
                {/* 数据点数: {dataPoints.current.length}/{maxDataPoints} */}
                {dataBuffer.current.length > 0 && (
                    <span className="ml-4 text-blue-600">
                        缓冲: {dataBuffer.current.length}
                    </span>
                )}
            </div>

            <ReactECharts
                className='bg-white'
                ref={chartRef}
                option={options}
                style={{ height: '400px', borderRadius: "10px", paddingBottom: "10px" }}
                notMerge={false} // 改为false，允许合并更新
                lazyUpdate={true} // 开启延迟更新
            />
        </div>
    );
}

export default Oscilloscope;