import React from "react";

const RadialBar = ({ data }) => {
  return (
    <div className="flex flex-wrap gap-4 justify-center items-center mt-10">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center">
          <div
            className="radial-progress"
            style={{ "--value": item.value }}
            role="progressbar"
          >
            {item.value}min
          </div>
          <span className="text-xs text-vintage-teal font-poppins mt-2">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default RadialBar;
