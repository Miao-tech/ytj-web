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

    const handleLedChange = (ledNumber, currentState) => {
        const newState = !currentState;
        controlLed(ledNumber, newState);
    }

    const lightEle = (enable) => {
        return enable ?
            <span class="iconfont icon-led-on" style={{ fontSize: '40px', color: "#ffb300" }}></span> :
            <span class="iconfont icon-led-off" style={{ fontSize: '40px' }}></span>
    }

    return (
        <div>
            <div className='mb-2'>
                <h2 className="text-xl font-semibold text-gray-900">LED灯控制台</h2>
                {/* <p className="text-sm text-gray-600">LED灯控制台</p> */}
            </div>

            <div className='grid grid-cols-3 gap-4 sm:container bg-white p-6 rounded-lg shadow-sm border'>
                <div className="flex flex-col items-center">
                    {lightEle(led1)}

                    <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" onChange={() => handleLedChange(1, led1)} />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="flex flex-col items-center">
                    {lightEle(led2)}

                    <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" onChange={() => handleLedChange(2, led2)} />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="flex flex-col items-center">
                    {lightEle(led3)}

                    <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" onChange={() => handleLedChange(3, led3)} />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="flex flex-col items-center">
                    {lightEle(led4)}

                    <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" onChange={() => handleLedChange(4, led4)} />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="flex flex-col items-center">
                    {lightEle(led5)}

                    <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" onChange={() => handleLedChange(5, led5)} />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="flex flex-col items-center">
                    {lightEle(led6)}

                    <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" onChange={() => handleLedChange(6, led6)} />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="flex flex-col items-center">
                    {lightEle(led7)}

                    <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" onChange={() => handleLedChange(7, led7)} />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="flex flex-col items-center">
                    {lightEle(led8)}

                    <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" onChange={() => handleLedChange(8, led8)} />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="flex flex-col items-center">
                    {lightEle(led9)}

                    <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" onChange={() => handleLedChange(9, led9)} />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>
        </div>
    )
}

export default Led