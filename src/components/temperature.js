import { useSelector } from 'react-redux'

function Temperature() {
    const temperature = useSelector((state) => state.integratedMachine.temperature)
    const humidity = useSelector((state) => state.integratedMachine.humidity)


    return (
        <div>
            {/* 标题和副标题 */}
            <div className='mb-2'>
                <h2 className="text-xl font-semibold text-gray-900">温湿度</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:container bg-white p-6 rounded-lg shadow-sm border" style={{ height: "155px" }}>
                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <span class="iconfont icon-wenduji" style={{ fontSize: '40px' }}></span>
                    <div style={{ fontSize: '16px' }}>温度: {temperature}℃</div>
                </div>

                <div className="mx-auto flex max-w-xs flex-col" style={{ textAlign: "center" }}>
                    <span class="iconfont icon-shidu" style={{ fontSize: '40px' }}></span>
                    <div style={{ fontSize: '16px' }}>湿度: {humidity}%</div>
                </div>

            </div>
        </div>
    );
}

export default Temperature;
