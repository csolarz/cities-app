// Updated. Thanks to: Paul Luna
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

    setInterval(this.send, 10000);

    socket.on('setCities', (data) => {
      console.log(data);
        this.setState({cities: data});
    })
  }

  render() {

    const cities = this.state.cities;

    return (
      <div>
         {cities.map((item)=> {
           return (
          <div>
          <div>City: {item.city.id}</div>
          <ul>
          <li>{item.time}</li>
          <li>{item.temperature}</li>  
          <li>{item.city}</li>
          </ul>
          </div>)
        })}
        </div>

    )
  }
}
export default App;
