import React, { useState, useEffect } from "react";
import Timer from "./Timer";

const City = props => {
  return (
    <div>
      <div>Ciudad: {props.name}</div>
      <ul>
        <li>
          Time: <Timer {...props} />
        </li>
        <li>Temperature F: {props.temperature}</li>
        <li>
          Temperature C:{" "}
          {props.temperature ? ((props.temperature - 32) * 5) / 9 : ""}
        </li>
      </ul>
    </div>
  );
};
export default City;
