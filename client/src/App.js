import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import City from "./Components/City"
const socket = io("localhost:5000");

const App = () => {

  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  //TODO: evaluar si debe ir en hook y si solo debe actualizarse al cambiar la data de ciudades
    socket.on("setCities", data => {
      setCities(data);
      setLoading(false)
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
        return (
          <div key={i}>
           <City {...item}/>
          </div>
        );
      })}
    </div>
  );
};
export default App;
