import React, { useState} from "react";
import io from "socket.io-client";
import City from "./Components/City";
import { Grid, Row, Col } from 'react-flexbox-grid';  
import logo from './logo.svg';
import './App.css';

var port;

if (process.env.NODE_ENV !== 'production') {
  port = "localhost:5000";
}
const socket = io(port);

const App = () => {

  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  //TODO: evaluar si debe ir en hook useeffect y si solo debe actualizarse al cambiar la data de ciudades
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
    <div >
      
      <Grid fluid>
      <Row >
      <Col xs={6}  mdOffset={5}><h1>Cities info App <img src={logo} className="App-logo" alt="logo" /></h1></Col>
      </Row>
      <Row >
      {loading && <div>Cargando datos...</div>}
      {cities.map((item, i) => {        
        return (
          
            
              <Col key={i} xs={6} md={3}>
              <City {...item}/>
          </Col>
        );
      })}
      </Row>
      <Row>
        <Row xs={6}  mdOffset={5}>
      
      </Row>
      </Row>
      </Grid>
      <div className="App">
      <header className="App-header">
        
        <p>
        Desarrollado por Nicolás Hermosilla.
        </p>
        <a
          className="App-link"
          href="http://wa.me/56986650412"
          target="_blank"
          rel="noopener noreferrer"
        >
          wsp: +56986650412
        </a>
      </header>
      </div>
    </div>
  );
};
export default App;
