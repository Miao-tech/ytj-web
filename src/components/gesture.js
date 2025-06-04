import { useEffect, useState } from "react";
import { useSelector } from 'react-redux'

function Gesture() {
    const gestureSensor = useSelector((state) => state.integratedMachine.gestureSensor)
    const infraredSensor = useSelector((state) => state.integratedMachine.infraredSensor)
    const lightIntensitySensor = useSelector((state) => state.integratedMachine.lightIntensitySensor)

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

            <div className='grid grid-cols-3 gap-4 sm:container bg-white p-6 rounded-lg shadow-sm border'>
                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <span class="iconfont icon-a-shoushoushi" style={{ fontSize: '40px' }}></span>
                    <div style={{ fontSize: '16px' }}>手势传感器: {gestureSensorText}</div>
                </div>
                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <span class="iconfont icon-act006" style={{ fontSize: '40px' }}></span>
                    <div style={{ fontSize: '16px' }}>红外传感器: {infraredSensor} cm</div>
                </div>
                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <span class="iconfont icon-a-cellimage_huaban1fuben94" style={{ fontSize: '40px' }}></span>
                    <div style={{ fontSize: '16px' }}>光强度传感器: {lightIntensitySensor} Lux</div>
                </div>

            </div>
        </div>
    );
}

export default Gesture;
