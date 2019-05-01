import React, { useState, useEffect } from "react";
import io from "socket.io-client";
const socket = io("localhost:5000");

const App = () => {

  

  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socket.on("setCities", data => {
      console.log(data);
      setCities(data);
      setLoading(false)
    });
  });

  /*
TODO: REQ-1:
Se desea mostrar en pantalla completa la hora y la temperatura y hora de las siguientes ciudades:
Santiago (CL), Zurich (CH), Auckland (NZ), Sydney (AU), Londres (UK), Georgia (USA)
*/
  return (
    <div>
      {loading && <div>Cargando datos...</div>}
      {cities.map((item, i) => {
        let timeZone = new Date(
          new Date().toLocaleString("en-US", { timeZone: item.timezone })
        );

        return (
          <div key={i}>
            <div>Ciudad: {item.name}</div>
            <ul>
              <li>Time: {timeZone.toLocaleString()}</li>
              <li>Temperature F: {item.temperature}</li>
              <li>Temperature C: {((item.temperature - 32) * 5) / 9}</li>
            </ul>
          </div>
        );
      })}
    </div>
  );
};
export default App;
