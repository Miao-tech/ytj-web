import { useEffect, useState } from "react";
import { useSelector } from 'react-redux'
import {
    APIGetDistance,
    APIGetLight
} from "../request/api";

function Sensor() {
    const gestureSensor = useSelector((state) => state.integratedMachine.gestureSensor)
    const infraredSensor = useSelector((state) => state.integratedMachine.infraredSensor)
    const lightIntensitySensor = useSelector((state) => state.integratedMachine.lightIntensitySensor)

    const [loading1, setLoading1] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const [loading3, setLoading3] = useState(false)

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

    return (
        <div>
            <div className='mb-2'>
                <h2 className="text-xl font-semibold text-gray-900">传感器</h2>
            </div>

            <div className='grid grid-cols-3 sm:container bg-white p-6 rounded-lg shadow-sm border' style={{ height: "160px" }}>
                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <span className="iconfont icon-a-shoushoushi" style={{ fontSize: '40px' }}></span>
                    <div style={{ fontSize: '16px' }}>手势传感器: {gestureSensorText}</div>
                    <button
                        className={"bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"}
                        disabled={loading1}
                        onClick={async () => {
                            setLoading1(true)
                            // await APIGetDistance()
                            setLoading1(false)
                        }}>
                        {loading1 ? '加载中...' : '刷新'}
                    </button>
                </div>
                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <span className="iconfont icon-act006" style={{ fontSize: '40px' }}></span>
                    <div style={{ fontSize: '16px' }}>红外传感器: {infraredSensor} cm</div>

                    <button
                        className={"bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"}
                        disabled={loading2}
                        onClick={async () => {
                            setLoading2(true)
                            await APIGetDistance()
                            setLoading2(false)
                        }}>
                        {loading2 ? '加载中...' : '刷新'}
                    </button>
                </div>
                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <span className="iconfont icon-a-cellimage_huaban1fuben94" style={{ fontSize: '40px' }}></span>
                    <div style={{ fontSize: '16px' }}>光强度传感器: {lightIntensitySensor} Lux</div>
                    <button
                        className={"bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"}
                        disabled={loading3}
                        onClick={async () => {
                            setLoading3(true)
                            await APIGetLight()
                            setLoading3(false)
                        }}>
                        {loading3 ? '加载中...' : '刷新'}
                    </button>
                </div>

            </div>
        </div>
    );
}

export default Sensor;
