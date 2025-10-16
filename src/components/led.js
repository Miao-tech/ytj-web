import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { Lightbulb } from 'lucide-react'
import { open_led, close_led } from '../store_integrated_machine_slice'
import { APICloseLED, APIOpenLED } from '../request/api'
import wsManager from '../request/io'

function Led() {
    const led1 = useSelector((state) => state.integratedMachine.led1)
    const led2 = useSelector((state) => state.integratedMachine.led2)
    const led3 = useSelector((state) => state.integratedMachine.led3)
    const led4 = useSelector((state) => state.integratedMachine.led4)
    const led5 = useSelector((state) => state.integratedMachine.led5)
    const led6 = useSelector((state) => state.integratedMachine.led6)
    const led7 = useSelector((state) => state.integratedMachine.led7)
    const led8 = useSelector((state) => state.integratedMachine.led8)
    const led9 = useSelector((state) => state.integratedMachine.led9)
    const led10 = useSelector((state) => state.integratedMachine.led10)
    const led11 = useSelector((state) => state.integratedMachine.led11)
    const dispatch = useDispatch()

    // 处理WebSocket消息中的LED状态同步
    useEffect(() => {
        // 状态恢复函数
        const restoreLedStates = async () => {
            try {
                const response = await fetch('/api/device_status');
                if (!response.ok) {
                    throw new Error(`HTTP错误: ${response.status}`);
                }
                const data = await response.json();
                console.log('获取到后端LED状态:', data);
                
                const backendLedStates = data.ui_state?.led_states;
                if (backendLedStates) {
                    // 根据后端状态更新Redux store
                    for (let ledNum = 1; ledNum <= 11; ledNum++) {
                        const isOn = backendLedStates[`led${ledNum}`];
                        if (isOn !== undefined) {
                            if (isOn) {
                                dispatch(open_led({ number: ledNum }));
                            } else {
                                dispatch(close_led({ number: ledNum }));
                            }
                        }
                    }
                    console.log('✅ LED状态已从后端同步');
                }
            } catch (error) {
                console.error('❌ 获取LED状态失败:', error);
            }
        };

        // 监听WebSocket状态更新事件
        const handleDeviceStateUpdate = (event) => {
            console.log('🔄 LED组件收到设备状态更新:', event.detail);
            // 状态已经通过Redux store更新，这里可以做一些额外的UI处理
        };

        // 监听Redux store更新成功事件
        const handleStoreUpdated = (event) => {
            console.log('✅ LED组件收到store更新成功通知:', event.detail);
            // 可以在这里显示成功提示或执行其他操作
        };

        // 监听Redux store更新错误事件
        const handleStoreUpdateError = (event) => {
            console.error('❌ LED组件收到store更新错误:', event.detail);
            // 可以在这里显示错误提示
        };

        const handleWebSocketMessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'led_state_sync') {
                    console.log('收到LED状态同步消息:', data);
                    const ledStates = data.led_states;
                    if (ledStates) {
                        for (let ledNum = 1; ledNum <= 11; ledNum++) {
                            const isOn = ledStates[ledNum.toString()];
                            if (isOn !== undefined) {
                                if (isOn) {
                                    dispatch(open_led({ number: ledNum }));
                                } else {
                                    dispatch(close_led({ number: ledNum }));
                                }
                            }
                        }
                        console.log('✅ LED状态已通过WebSocket同步');
                    }
                }
            } catch (error) {
                // 忽略非JSON消息
            }
        };

        // 监听WebSocket消息
        if (wsManager.socket) {
            wsManager.socket.addEventListener('message', handleWebSocketMessage);
        }

        // 添加自定义事件监听器
        window.addEventListener('deviceStateUpdate', handleDeviceStateUpdate);
        window.addEventListener('storeUpdated', handleStoreUpdated);
        window.addEventListener('storeUpdateError', handleStoreUpdateError);

        // 组件挂载时恢复状态
        restoreLedStates();

        // 清理监听器
        return () => {
            if (wsManager.socket) {
                wsManager.socket.removeEventListener('message', handleWebSocketMessage);
            }
            window.removeEventListener('deviceStateUpdate', handleDeviceStateUpdate);
            window.removeEventListener('storeUpdated', handleStoreUpdated);
            window.removeEventListener('storeUpdateError', handleStoreUpdateError);
        };
    }, [dispatch]);

    // 修改 LED 控制方法
    const controlLed = async (ledNumber, isOpen) => {
        if (isOpen) {
            await APIOpenLED(ledNumber).then(() => {
                dispatch(open_led({ number: ledNumber }));
            });
        } else {
            await APICloseLED(ledNumber).then(() => {
                dispatch(close_led({ number: ledNumber }));
            });
        }
    }

    const handleLedChange = (ledNumber, newState) => {
        controlLed(ledNumber, newState);
    }

    const lightEle = (enable, number) => {
        return <button
            className={`h-12 w-12 rounded-full border-2 transition-all ${
                enable
                    ? 'bg-yellow-400 border-yellow-500 shadow-lg'
                    : 'bg-gray-200 border-gray-300 hover:bg-gray-300'
            }`}
            style={{
                boxShadow: enable ? '0 10px 25px -5px rgba(234, 179, 8, 0.5)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
            }}
            onClick={() => handleLedChange(number, !enable)}
        >
            <Lightbulb
                size={20}
                color={enable ? 'rgb(133, 77, 14)' : 'rgb(107, 114, 128)'}
                fill={enable ? 'rgb(133, 77, 14)' : 'none'}
            />
        </button>
    }

    return (
        <div className="py-[10px] mx-auto px-4 sm:container mt-[10px] pb-6" style={{
            backgroundColor: "#1a1d2e",
            borderRadius: "10px"
        }}>
            <div className='mb-2'>
                <h2 className="text-xl font-semibold text-white">LED灯控制台</h2>
                {/* <p className="text-sm text-gray-600">LED灯控制台</p> */}
            </div>

            <div className='grid grid-cols-11 gap-4 sm:container pb-6 rounded-lg shadow-sm border pt-4' style={{ backgroundColor: "#252a3d" }}>
                <div className="flex flex-col items-center gap-2">
                    {lightEle(led1, 1)}
                    <span className="text-xs text-gray-400">LED1</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    {lightEle(led2, 2)}
                    <span className="text-xs text-gray-400">LED2</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    {lightEle(led3, 3)}
                    <span className="text-xs text-gray-400">LED3</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    {lightEle(led4, 4)}
                    <span className="text-xs text-gray-400">LED4</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    {lightEle(led5, 5)}
                    <span className="text-xs text-gray-400">LED5</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    {lightEle(led6, 6)}
                    <span className="text-xs text-gray-400">LED6</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    {lightEle(led7, 7)}
                    <span className="text-xs text-gray-400">LED7</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    {lightEle(led8, 8)}
                    <span className="text-xs text-gray-400">LED8</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    {lightEle(led9, 9)}
                    <span className="text-xs text-gray-400">LED9</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    {lightEle(led10, 10)}
                    <span className="text-xs text-gray-400">LED10</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    {lightEle(led11, 11)}
                    <span className="text-xs text-gray-400">LED11</span>
                </div>
            </div>
        </div>
    )
}

export default Led