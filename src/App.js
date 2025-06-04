import Temperature from "./components/temperature"
import Title from "./components/title"
import Led from "./components/led"
import Oscilloscope from "./components/oscilloscope"
import Multimeter from "./components/multimeter"
import Copyright from "./components/copyright"
import Gesture from "./components/gesture"
import "./io"
import PowerSupply from "./components/powersupply"
import SignalGenerator from "./components/signalgenerator"


function App() {
  return (
    <div className="App">
      {/* 大标题 */}
      <Title />

      {/* 温湿度 */}
      <Temperature />

      {/* 手势与红外 */}
      <Gesture />

      {/* Led灯控制 */}
      <Led />

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
