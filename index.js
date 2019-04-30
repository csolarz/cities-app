const path = require('path');
const express = require('express');
const app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var async = require("async");
const request = require('request');
const fetch = require('node-fetch');

var cities= [
    {
        id: "santiago-cl",
        name: "Santiago (CL)",
        latitude: -33.4569397,
        longitude: -70.6482697
    },
    {
        id: "zurich-ch",
        name: "Zurich (CH)",
        latitude: 47.3666687,
        longitude: 8.5500002
    },
    {
        id: "auckland-nz",
        name: "Auckland (NZ)",
        latitude: -36.8484597,
        longitude: 174.7633315
    },
    {
        id: "sydney-au",
        name: "Sydney (AU)",
        latitude: 46.1351013,
        longitude: -60.1831017
    },
    {
        id: "londres-uk",
        name: "Londres (UK)",
        latitude: 51.5127907,
        longitude: -0.09184
    },
    {
        id: "georgia-usa",
        name: "Georgia (USA)",
        latitude: 31.6371002,
        longitude: -86.7419205
    }
];

const API_KEY ="fe0c04d83b6b1db087328c76a8f43c60";

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/cities', async (req, res) => {
    
    let _data = await getRequestData();
    console.log(_data);
      res.send(_data);
    
  })
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

io.on('connection', socket => {
    console.log('a user connected');
 
    socket.on('getCities', data => {
      console.log('getCities');


      let _data = getRequestData();
      console.log(_data);
      io.emit('setCities',_data );
      

    });
  
  });
  

const port = process.env.PORT || 5000;
server.listen(port);

console.log('App is listening on port ' + port);

async function getRequestData()
{
    
    const cities =  getCitiesData();
    console.log(cities);

    var result = await Promise.all(cities.map(async(city) => {

        let url = `https://api.darksky.net/forecast/${API_KEY}/${city.latitude},${city.longitude}`;     
        let data = await fetch(url).then((response) => response.json());
        return {...data.currently,...city, now:new Date()};
    }));

    return result;
}

requestAsync = (url) => 
    new Promise((resolve, reject) => {
        request(url, (error, response, data) => {
            if(error) reject(error)
            else resolve(JSON.parse(data))
        })
    })

function getCitiesData(){

    return cities;
}