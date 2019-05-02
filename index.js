const path = require("path");
const express = require("express");
const app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
const request = require("request");
const redis = require("redis");
require('dotenv').config()
const citiesInfo = require("./cities.json");

const REDIS_KEY_CITY = "api:cities";
const REDIS_HASH_KEY_ERROR = "api:erros";
const REDIS_HOST = process.env.REDISCLOUD_URL;
const ERROR_MSG = "How unfortunate! The API Request Failed";
const MAX_RETRY = 5;
const TIME_UPDATE_CLIENT = 10000;
const TIME_RETRY = 500;

//static files react app
app.use(express.static(path.join(__dirname, "client/build")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

//api routes
app.get("/cities", async (req, res) => {
  let data = await getRequestData();
  res.send(data);
});

app.get("/cities-redis", async (req, res) => {
  const data = await getCitiesFromRedis();
  res.send(data);
});

app.get("/errors", (req, res) => {
  redisclient.HGETALL(REDIS_HASH_KEY_ERROR, function(err, data) {
    if (err) res.send(err);
    else res.send(data);
  });
});


//socket io
/*
TODO: REQ-6:
El frontend deberá actualizarse cada 10 segundos a través de web sockets. 
Comment: Se actualiza para todas las conexiones cada 10 segundos, asi se mantien solo una actualizacion de datos en el backend.
Tambien al tener 0 conexiones se detiene el setInterval
*/
var intId;
var online = 0;
io.on("connection", async socket => {

  online++;

  let _tempData = await getCitiesFromRedis();
  socket.emit("setCities",_tempData);

  if (online === 1) {
    console.log("clientes onine " + online);
    intId = setInterval(async () => {
      let _data = await getRequestData();
      io.emit("setCities", _data);
    }, TIME_UPDATE_CLIENT);
  }

  socket.on("disconnect", function() {
    online--;
    console.log("clientes onine " + online);
    if (online === 0) clearInterval(intId);

  });
});

//redis
const redisclient = redis.createClient(REDIS_HOST);

redisclient.on("connect", function() {
  console.log("Redis client connected");
});

redisclient.on("error", function(err) {
  console.log("Redis client error " + err);
});

//server startup
const port = process.env.PORT || 5000;

server.listen(port, () => {
  /*
TODO: REQ-2:
Las latitudes y longitudes de cada ciudad deben ser guardadas en Redis al momento de iniciar la aplicación.
*/
  redisclient.set(REDIS_KEY_CITY, JSON.stringify(citiesInfo), redis.print);

  console.log("Server listening on port: ", port);
});


/////********
//Funciones internas
/////********

/*
TODO: REQ-3:
Cada request de la API debera ir a Redis, sacar las latitudes y longitudes correspondientes, y hacer las consultas necesarias al servicio de Forecast.io.
*/
const getRequestData = async () => {
  
  console.log("Obteniendo ciudades desde redis");

  const cities = await getCitiesFromRedis();

  //Get all city data from api
  const result = await Promise.all(
    cities.map(async city => {

      const url = `${process.env.API_URL}${process.env.API_KEY}/${city.latitude},${city.longitude}`;

      let cityInfo = { ...city };

      try {

        const response = await retry(requestAsync, url);
        const { timezone } = response;
        const { temperature } = response.currently;

        cityInfo.timezone = timezone;
        cityInfo.temperature = temperature;
        cityInfo.time = +new Date(); //last update

/*
TODO: REQ-6.1:
El proceso deberá actualizar redis y luego enviar el update al frontend.
*/
        redisclient.set(cityInfo.id, JSON.stringify(cityInfo));
      } catch (error) {
        //obtener ultimo valor desde redis si supero todos los intentos de llamada a la api**plus
        let _cityInfo = await getCityFromRedis(city.id);

        if (_cityInfo) return _cityInfo;

        
      }

      return cityInfo;
    })
  );

  return result;
};

/*
TODO: REQ-5:
Esto nos simulara un fallo del 10%~, la aplicacion debera rehacer el request las veces que sea necesario para tener una respuesta correcta
cada fallo deberá guardarse en Redis dentro de un hash llamado "api.errors", la llave debera ser el timestamp y el contenido debe ser relevante al error. El handler de error deberá capturar solamente este error y no otro con diferente clase o mensaje.
Comment: Se deja una cantidad limitada de reintentos en MAX_RETRY cada x tiempo definido en TIME_RETRY
*/
const retry = (fn, url, ms = TIME_RETRY, retriesLeft = MAX_RETRY) =>
  new Promise((resolve, reject) => {
    var retries = 0;
    fn(url)
      .then(resolve)
      .catch(e => {
        setTimeout(() => {
          /*
TODO: REQ-5.1:
cada fallo deberá guardarse en Redis dentro de un hash llamado "api.errors", la llave debera ser el timestamp y el contenido debe ser relevante al error. 
El handler de error deberá capturar solamente este error y no otro con diferente clase o mensaje.
*/ if (
            e instanceof Error &&
            e.message === ERROR_MSG
          ) {
            redisclient.hset(
              REDIS_HASH_KEY_ERROR,
              +new Date(),
              `ERROR: ${e.message} - REQUEST: ${url}`
            );
          }
          retries++;
          if (retriesLeft === 1) {
            return reject("maximum retries exceeded");
          }
          retry(fn, url, ms, retriesLeft - 1).then(resolve, reject);
        }, ms);
      });
  });

const requestAsync = url =>
  new Promise((resolve, reject) => {
    /*
TODO: REQ-4:
Cada request a la API tiene un 10% de chances de fallar, al momento de hacer el request deberá suceder lo siguiente:
if (Math.rand(0, 1) < 0.1) throw new Error('How unfortunate! The API Request Failed')
*/
    if (Math.random(0, 1) < 0.1) throw new Error(ERROR_MSG);

    console.log("invocando api");
    request(url, (error, response, result) => {
      {
        let responseData;
        try {
          responseData = JSON.parse(result)
        } catch (error) {
          console.log(`error en resultado de respuesta de la api. result:${result}  url: ${url}`);
          reject(result);
          return;
        }

        if(error){
          console.log("error al consultar api " + error);
        }

        error ? reject(error) : resolve(responseData);
      }
    });
  });

const getCitiesFromRedis = () =>
  new Promise((resolve, reject) => {
    redisclient.get(REDIS_KEY_CITY, (error, result) => {
      error ? reject(error) : resolve(JSON.parse(result));
    });
  });

const getCityFromRedis = cityId =>
  new Promise((resolve, reject) => {
    redisclient.get(cityId, (error, result) => {
      error ? reject(error) : resolve(JSON.parse(result));
    });
  });
