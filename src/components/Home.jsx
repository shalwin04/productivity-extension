import React,{useState} from "react";

const Home = () => {

    const [mode, setmode] = useState('Productivity');

    const handleToggle = (e) =>{
        setmode(e.target.checked ? "Relax" : "Productivity");
    }

  return (
    <div className="h-screen flex flex-col items-center">
      <p className="text-3xl mt-4 text-center align-text-top font-lora">
        Productivity
      </p>
      <p className="mt-2">your personalized productivity & wellness bot</p>
      <div className="flex flex-none items-center mt-5 space-x-4">
        <div className="grid w-32"><span className="text-xl font-poppins">{mode}</span></div>
        <div className="grid"><input
          type="checkbox"
          className="toggle"
          onChange={handleToggle}
          defaultChecked={false}
        /></div>
      </div>
    </div>
  );
};

export default Home;
