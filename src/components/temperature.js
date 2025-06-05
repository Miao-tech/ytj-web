import { useState } from "react"
import { useSelector } from 'react-redux'
import { APIGetTemperature } from '../request/api'

function Temperature() {
    const temperature = useSelector((state) => state.integratedMachine.temperature)
    const humidity = useSelector((state) => state.integratedMachine.humidity)

    const [loading1, setLoading1] = useState(false)
    const [loading2, setLoading2] = useState(false)

    return (
        <div>
            {/* 标题和副标题 */}
            <div className='mb-2'>
                <h2 className="text-xl font-semibold text-gray-900">温湿度</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:container bg-white p-6 rounded-lg shadow-sm border" style={{ height: "155px" }}>
                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <span className="iconfont icon-wenduji" style={{ fontSize: '40px' }}></span>
                    <div style={{ fontSize: '16px' }}>温度: {temperature}℃</div>

                    <button
                        className={"bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"}
                        disabled={loading1}
                        onClick={async () => {
                            setLoading1(true)
                            await APIGetTemperature()
                            setLoading1(false)
                        }}>
                        {loading1 ? '加载中...' : '刷新'}
                    </button>
                </div>

                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <span className="iconfont icon-shidu" style={{ fontSize: '40px' }}></span>
                    <div style={{ fontSize: '16px' }}>湿度: {humidity}%</div>

                    <button
                        className={"bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"}
                        disabled={loading2}
                        onClick={async () => {
                            setLoading2(true)
                            await APIGetTemperature()
                            setLoading2(false)
                        }}>
                        {loading2 ? '加载中...' : '刷新'}
                    </button>
                </div>

            </div>
        </div>
    );
}

export default Temperature;
