import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
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
                    for (let ledNum = 1; ledNum <= 9; ledNum++) {
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

        const handleWebSocketMessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'led_state_sync') {
                    console.log('收到LED状态同步消息:', data);
                    const ledStates = data.led_states;
                    if (ledStates) {
                        for (let ledNum = 1; ledNum <= 9; ledNum++) {
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

        // 组件挂载时恢复状态
        restoreLedStates();

        // 清理监听器
        return () => {
            if (wsManager.socket) {
                wsManager.socket.removeEventListener('message', handleWebSocketMessage);
            }
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
        return <div
            className='mb-1'
            style={{
                position: 'relative',
                background: 'rgb(249 249 249)',
                width: '60px',
                height: '60px',
                borderRadius: '60px',
                border: '2px solid rgb(205 205 205)'
            }}
            onClick={() => handleLedChange(number, !enable)}
        >
            <div style={{
                top: '-4px',
                left: '8px',
                position: 'absolute'
            }}>
                {
                    enable ?
                        <span className="iconfont icon-led-on" style={{ fontSize: '40px', color: "rgb(255 188 0)", cursor: "pointer" }}></span> :
                        <span className="iconfont icon-led-off" style={{ fontSize: '40px', color: "#d1d1d1", cursor: "pointer" }}></span>
                }
            </div>
        </div >
    }

    return (
        <div className="py-[10px] mx-auto px-4 sm:container mt-[10px] pb-6" style={{
            backgroundColor: "#f6f6f6",
            borderRadius: "10px"
        }}>
            <div className='mb-2'>
                <h2 className="text-xl font-semibold text-gray-900">LED灯控制台</h2>
                {/* <p className="text-sm text-gray-600">LED灯控制台</p> */}
            </div>

            <div className='grid grid-cols-9 gap-2 sm:container bg-white pb-6 rounded-lg shadow-sm border pt-4'>
                <div className="flex flex-col items-center">
                    {lightEle(led1, 1)}

                    <div className='text-s text-muted-foreground mt-1' >LED1</div>
                </div>

                <div className="flex flex-col items-center">
                    {lightEle(led2, 2)}

                    <div className='text-s text-muted-foreground mt-1' >LED2</div>
                </div>

                <div className="flex flex-col items-center">
                    {lightEle(led3, 3)}

                    <div className='text-s text-muted-foreground mt-1'  >LED3</div>
                </div>


                <div className="flex flex-col items-center">
                    {lightEle(led4, 4)}

                    <div className='text-s text-muted-foreground mt-1' >LED4</div>
                </div>

                <div className="flex flex-col items-center">
                    {lightEle(led5, 5)}

                    <div className='text-s text-muted-foreground mt-1' >LED5</div>
                </div>

                <div className="flex flex-col items-center">
                    {lightEle(led6, 6)}

                    <div className='text-s text-muted-foreground mt-1' >LED6</div>
                </div>

                <div className="flex flex-col items-center">
                    {lightEle(led7, 7)}

                    <div className='text-s text-muted-foreground mt-1' >LED7</div>
                </div>

                <div className="flex flex-col items-center">
                    {lightEle(led8, 8)}

                    <div className='text-s text-muted-foreground mt-1' >LED8</div>
                </div>


                <div className="flex flex-col items-center">
                    {lightEle(led9, 9)}

                    <div className='text-s text-muted-foreground mt-1' >LED9</div>
                </div>
            </div>
        </div>
    )
}

export default Led