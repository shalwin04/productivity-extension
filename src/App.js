// import logo from "./logo.svg";
import "./App.css";
import Home from "./components/Home";

function App() {
  return (
    <div className="artboard phone-5 bg-gray-100">
      {/* <div className="h-screen flex flex-col items-center">
        <p className="text-3xl mt-4 text-center align-text-top font-lora">
          Productivity
        </p>
        <p className="mt-2">your personalized productivity & wellness bot</p>
      <div className="flex w-full mt-4 flex-row lg:flex-row">
        <div className="card rounded-box grid h-32 flex-grow place-items-center">
          Productivity<input type="checkbox" className="toggle" defaultChecked />
        </div> */}
        {/* <div className="divider lg:divider-horizontal">OR</div> */}
        {/* <div className="card rounded-box grid h-32 flex-grow place-items-center">
          Relax<input type="checkbox" className="toggle" defaultChecked />
        </div>
      </div>
      </div> */}
      <Home/>
    </div>
  );
}

export default App;