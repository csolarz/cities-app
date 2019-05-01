import React, { Component } from "react";
import io from "socket.io-client";
const socket = io("localhost:5000");

class App extends Component {
  constructor() {
    super();
    this.state = {
      cities: []
    };
  }

  send = () => {
    
    socket.emit('getCities', 0) 
  }

  

  componentDidMount = () => {

    socket.on('setCities', (data) => {
      console.log(data);
        this.setState({cities: data});
    })
  }

  render() {

    const cities = this.state.cities;
/*
TODO: REQ-1:
Se desea mostrar en pantalla completa la hora y la temperatura y hora de las siguientes ciudades:
Santiago (CL), Zurich (CH), Auckland (NZ), Sydney (AU), Londres (UK), Georgia (USA)
*/
    return (
      <div>
         {cities.map((item)=> {

          let timeZone = new Date(new Date().toLocaleString("en-US", {timeZone: item.timezone}));

           return (
          <div>
          <div>Ciudad: {item.name}</div>
          <ul>
          <li>Time: {timeZone.toLocaleString()}</li>
          <li>Temperature F: {item.temperature}</li>  
          <li>Temperature C: {(item.temperature - 32) * 5/9}</li>  
          
          </ul>
          </div>)
        })}
        </div>

    )
  }
}
export default App;
