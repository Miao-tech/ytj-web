import { useEffect, useState } from "react"
import { useSelector } from 'react-redux'
import { APIGetTemperature } from '../request/api'


function Temperature() {
    const temperature = useSelector((state) => state.integratedMachine.temperature)
    const humidity = useSelector((state) => state.integratedMachine.humidity)

    const [loading1, setLoading1] = useState(false)
    const [loading2, setLoading2] = useState(false)

    const [isAuto, setIsAuto] = useState(true)
    const [count, setCount] = useState(0)
    const [compare, setCompare] = useState(5)

    let t1 = null;
    let t2 = null;


    useEffect(() => {
        if (!isAuto) {
            clearTimeout(t1)
            return
        }

        if (count >= compare) {
            // 到5秒后 则自动开始获取温湿度
            APIGetTemperature().then(() => {
                setCount(0)
            })
        } else {
            t1 = setTimeout(() => {
                setCount(count + 1)
            }, 1000)
        }
    }, [count, isAuto, compare])


    return (
        <div>
            {/* 标题和副标题 */}
            <div className='mb-2'>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }}>
                    <h2 className="text-xl font-semibold text-gray-900">温湿度</h2>

                    <div style={{
                        display: 'flex', alignItems: "center"
                    }}>

                        <span style={{ marginRight: "20px" }}>
                            间隔
                            <input type="text" style={{ width: '50px', textAlign: "center", border: "1px solid #333", margin: "0 5px", outline: "none" }} defaultValue={compare} onChange={(e) => {
                                if (isNaN(e.target.value)) {
                                    return;
                                } else {
                                    clearTimeout(t2);

                                    t2 = setTimeout(() => {
                                        console.log("更新间隔为: " + e.target.value)
                                        setCompare(e.target.value)
                                    }, 500)
                                }
                            }} />
                            秒获取
                        </span>

                        {
                            (compare - count) == 0 ?
                                <span style={{ marginRight: "10px" }}>获取中...</span>
                                :
                                <span style={{ marginRight: "10px" }}>剩余: {(compare - count) <= 0 ? 0 : (compare - count)}s</span>
                        }
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isAuto}
                                onChange={() => {
                                    setIsAuto(!isAuto)
                                }}
                            />
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                            <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                自动获取
                            </span>
                        </label>
                    </div>
                </div>
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
