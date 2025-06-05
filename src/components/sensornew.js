import { useEffect, useState } from "react";
import { useSelector } from 'react-redux'
import {
    APIGetDistance,
    APIGetLight,
    APIGetTemperature,
    APIGetGesture
} from "../request/api";

function SensorNew() {
    const gestureSensor = useSelector((state) => state.integratedMachine.gestureSensor)
    const infraredSensor = useSelector((state) => state.integratedMachine.infraredSensor)
    const lightIntensitySensor = useSelector((state) => state.integratedMachine.lightIntensitySensor)
    const temperature = useSelector((state) => state.integratedMachine.temperature)
    const humidity = useSelector((state) => state.integratedMachine.humidity)


    const [loading1, setLoading1] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const [loading3, setLoading3] = useState(false)
    const [loading4, setLoading4] = useState(false)
    const [loading5, setLoading5] = useState(false)

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


    const iconEle = (iconName, iconColor = "black", bgColor = "white") => <div style={{
        height: "60px",
        width: "60px",
        borderRadius: "100px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginRight: "10px",
        background: bgColor,
        color: iconColor
    }}>
        <span className={["iconfont", iconName].join(' ')} style={{ fontSize: '30px' }}></span>
    </div>

    return (
        <div className="py-[10px] mx-auto px-4 sm:container mt-[10px] pb-6" style={{
            backgroundColor: "#f6f6f6",
            borderRadius: "5px"
        }}>
            {/* 标题和副标题 */}
            <div className='mb-2'>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }}>
                    <h2 className="text-xl font-semibold text-gray-900">传感器</h2>
                </div>
            </div>

            <div className='grid grid-cols-5 sm:container bg-white p-6 rounded-lg shadow-sm border'>
                {/* 温度传感器 */}
                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <div className="flex flex-row">
                        {iconEle('icon-wenduji', 'rgb(245, 94, 80)', 'rgb(244, 214, 212)')}

                        <div style={{ fontSize: '16px', marginRight: "20px", textAlign: "left" }}>
                            <div style={{ fontSize: "16px" }}>温度传感器: </div>
                            <div style={{ fontSize: "22px", fontWeight: "bold" }}>
                                {temperature}
                                <span style={{ fontSize: "20px", fontWeight: "normal" }}>℃</span>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {
                                loading4 ?
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer" }}></span>
                                    :
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer" }} onClick={
                                        async () => {
                                            setLoading4(true)
                                            await APIGetTemperature()
                                            setLoading4(false)
                                        }
                                    }></span>
                            }
                        </div>
                    </div>
                </div>

                {/* 湿度传感器 */}
                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <div className="flex flex-row">
                        {iconEle('icon-wenduji', 'rgb(78, 158, 240)', 'rgb(207, 225, 244)')}

                        <div style={{ fontSize: '16px', marginRight: "20px", textAlign: "left" }}>
                            <div style={{ fontSize: "16px" }}>湿度传感器: </div>
                            <div style={{ fontSize: "22px", fontWeight: "bold" }}>
                                {humidity}
                                <span style={{ fontSize: "20px", fontWeight: "normal" }}>%</span>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {
                                loading5 ?
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer" }}></span>
                                    :
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer" }} onClick={
                                        async () => {
                                            setLoading5(true)
                                            await APIGetTemperature()
                                            setLoading5(false)
                                        }
                                    }></span>
                            }
                        </div>
                    </div>
                </div>

                {/* 光强度传感器 */}
                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <div className="flex flex-row">
                        {iconEle('icon-a-cellimage_huaban1fuben94', 'rgb(248, 195, 60)', 'rgb(245, 234, 205)')}

                        <div style={{ fontSize: '16px', marginRight: "20px", textAlign: "left" }}>
                            <div style={{ fontSize: "16px" }}>光强度传感器: </div>
                            <div style={{ fontSize: "22px", fontWeight: "bold" }}>
                                {lightIntensitySensor}
                                <span style={{ fontSize: "20px", fontWeight: "normal" }}> Lux</span>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {
                                loading3 ?
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer" }}></span>
                                    :
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer" }} onClick={
                                        async () => {
                                            setLoading3(true)
                                            await APIGetLight()
                                            setLoading3(false)
                                        }
                                    }></span>
                            }
                        </div>
                    </div>
                </div>


                {/* 手势传感器 */}
                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <div className="flex flex-row">
                        {iconEle('icon-a-shoushoushi', 'rgb(97, 175, 91)', 'rgb(214, 230, 214)')}

                        <div style={{ fontSize: '16px', marginRight: "20px", textAlign: "left" }}>
                            <div style={{ fontSize: "16px" }}>手势传感器</div>
                            <div style={{ fontSize: "22px", fontWeight: "bold" }}>
                                {/* 25.2 */}
                                {gestureSensorText}

                                <span style={{ fontSize: "20px", fontWeight: "normal" }}>℃</span>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {
                                loading1 ?
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer" }}></span>
                                    :
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer" }} onClick={
                                        async () => {
                                            setLoading1(true)
                                            await APIGetGesture()
                                            setLoading1(false)
                                        }
                                    }></span>
                            }
                        </div>
                    </div>
                </div>

                {/* 红外传感器 */}
                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <div className="flex flex-row">
                        {iconEle('icon-act006', 'rgb(149, 48, 173)', 'rgb(225, 205, 231)')}

                        <div style={{ fontSize: '16px', marginRight: "20px", textAlign: "left" }}>
                            <div style={{ fontSize: "16px" }}>红外传感器: </div>
                            <div style={{ fontSize: "22px", fontWeight: "bold" }}>
                                {infraredSensor}
                                <span style={{ fontSize: "20px", fontWeight: "normal" }}>cm</span>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {
                                loading2 ?
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer" }}></span>
                                    :
                                    <span className={'iconfont icon-gengxin'} style={{ fontSize: '16px', cursor: "pointer" }} onClick={
                                        async () => {
                                            setLoading2(true)
                                            await APIGetDistance()
                                            setLoading2(false)
                                        }
                                    }></span>
                            }
                        </div>
                    </div>
                </div>




            </div>
        </div>
    );
}

export default SensorNew;
