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
        <div className="mx-auto px-4 sm:container py-10 mt-[10px]" style={{
            backgroundColor: "#f6f6f6",
            borderRadius: "10px"
        }}>
            <div className="mx-auto max-w-7xl px-6 lg:px-8" >
                <dl className="grid grid-cols-1 gap-x-8 gap-y-24 text-center lg:grid-cols-3">
                    <div className="mx-auto flex max-w-xs flex-col">
                        <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-2xl">手势传感器: {gestureSensorText}</dd>
                    </div>
                    <div className="mx-auto flex max-w-xs flex-col">
                        <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-2xl">红外传感器: {infraredSensor} cm</dd>
                    </div>
                    <div className="mx-auto flex max-w-xs flex-col">
                        <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-2xl">光强度传感器: {lightIntensitySensor} Lux</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}

export default Gesture;
