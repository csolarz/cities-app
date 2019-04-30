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

    setInterval(this.send, 3000);
    

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
          <div>Ciudad: {item.name}{item.now}</div>
          <ul>
          <li>Time: {new Date(item.time).toTimeString()}</li>
          <li>Temperature: {item.temperature}</li>  
          </ul>
          </div>)
        })}
        </div>

    )
  }
}
export default App;
