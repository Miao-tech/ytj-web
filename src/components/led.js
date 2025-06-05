import { useSelector, useDispatch } from 'react-redux'
import { open_led, close_led } from '../store_integrated_machine_slice'
import { APICloseLED, APIOpenLED } from '../request/api'

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

                    <div style={{
                        color: '#333',
                        fontWeight: 'bold',
                        fontSize: '18px'
                    }}>LED1</div>
                </div>

                <div className="flex flex-col items-center">
                    {lightEle(led2, 2)}

                    <div style={{
                        color: '#333',
                        fontWeight: 'bold',
                        fontSize: '18px'
                    }}>LED2</div>
                </div>

                <div className="flex flex-col items-center">
                    {lightEle(led3, 3)}

                    <div style={{
                        color: '#333',
                        fontWeight: 'bold',
                        fontSize: '18px'
                    }}>LED3</div>
                </div>


                <div className="flex flex-col items-center">
                    {lightEle(led4, 4)}

                    <div style={{
                        color: '#333',
                        fontWeight: 'bold',
                        fontSize: '18px'
                    }}>LED4</div>
                </div>

                <div className="flex flex-col items-center">
                    {lightEle(led5, 5)}

                    <div style={{
                        color: '#333',
                        fontWeight: 'bold',
                        fontSize: '18px'
                    }}>LED5</div>
                </div>

                <div className="flex flex-col items-center">
                    {lightEle(led6, 6)}

                    <div style={{
                        color: '#333',
                        fontWeight: 'bold',
                        fontSize: '18px'
                    }}>LED6</div>
                </div>

                <div className="flex flex-col items-center">
                    {lightEle(led7, 7)}

                    <div style={{
                        color: '#333',
                        fontWeight: 'bold',
                        fontSize: '18px'
                    }}>LED7</div>
                </div>

                <div className="flex flex-col items-center">
                    {lightEle(led8, 8)}

                    <div style={{
                        color: '#333',
                        fontWeight: 'bold',
                        fontSize: '18px'
                    }}>LED8</div>
                </div>


                <div className="flex flex-col items-center">
                    {lightEle(led9, 9)}

                    <div style={{
                        color: '#333',
                        fontWeight: 'bold',
                        fontSize: '18px'
                    }}>LED9</div>
                </div>
            </div>
        </div>
    )
}

export default Led