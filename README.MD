## App web que muestra temperatura y hora de distintas ciudades

Desarrollado por [Nicolas Hermosilla](https://github.com/nicolashermosilla).

## Tecnologias utilizadas:

- React js
- Node js
- websckets
- redis

## Dependencias obligatorias:

- Redis cache. se puede levantar una instancia local desde docker `docker pull redis`
- KEY de api https://api.darksky.net/forecast/

## Variables de entorno

- `REDISCLOUD_URL`: url redis cache
- `API_KEY`: Key para acceso a consultas a la api https://api.darksky.net/forecast/
- `API_URL`: URL api de api https://api.darksky.net/forecast/


## Script disponibles

```
 "scripts": {
    "start": "node index.js",
    "debug": "nodemon index.js",
    "test": "echo \"Error: no test specified\" && exit 1",
    "heroku-postbuild": "cd client && npm install && npm run build"
  }
```

## Levantar la app local

Prerequisitos: configurar las variables de entorno.

paso 1: compilar cliente

```
cd client
npm i
npm run build
```

Paso 2: levantar backend
```
cd..
npm i
npm start
```

Verificar que en la consola aparezca
```
Server listening on port:  5000
Redis client connected
Reply: OK
```
Abrir el navegador http://localhost:5000/


## Publicar en Heroku
```
heroku login
heroku create application-name
$ heroku git:remote -a application-name
$ git push heroku master
```



