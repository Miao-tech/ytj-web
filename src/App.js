import Title from "./components/title"
import Led from "./components/led"
import Oscilloscope from "./components/oscilloscope"
import Multimeter from "./components/multimeter"
import Copyright from "./components/copyright"
// import Temperature from "./components/temperature"
// import Sensor from "./components/sensor"
import "./request/io"
import PowerSupply from "./components/powersupply"
import SignalGenerator from "./components/signalgenerator"
import SensorNew from "./components/sensornew"


function App() {
  return (
    <div className="App" style={{ backgroundColor: "#1a1d2e", minHeight: "100vh" }}>
      {/* 大标题 */}
      <Title />

      {/* 传感器 */}
      <SensorNew />

      {/* Led灯控制 */}
      <Led />


      {/* <div className="py-[10px] mx-auto px-4 sm:container mt-[10px] pb-6" style={{
        backgroundColor: "#f6f6f6",
        borderRadius: "10px"
      }}>
        <div className='grid md:grid-cols-2 gap-6 grid-cols-1'>
          <div className='grid gap-6 grid-cols-1'>
            <Sensor />
            <Temperature />
          </div>
        </div>
      </div> */}

      {/* 示波器 */}
      <Oscilloscope />

      {/* 万用表控制 */}
      <Multimeter />

      {/* 控制电源 */}
      <PowerSupply />

      {/* 信号发生器 */}
      <SignalGenerator />

      {/* 版权 */}
      <Copyright />
    </div>
  );
}

export default App;
