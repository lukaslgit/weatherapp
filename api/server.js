const express = require('express');
const app = express();
const axios = require('axios');

require('dotenv').config()

const PORT = process.env.PORT;

const cors = require('cors');
const corsOptions = {
    origin: [`${process.env.DOMAIN}`]
}

app.use(cors(corsOptions))

const WeatherAPI = process.env.WEATHER_API;
const PixelAPI = process.env.PIXEL_API;

app.get('/api/cityname', async (req, res) => {

    const city = req.query.city
    
    try {
        const response = await axios(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${WeatherAPI}`)
        res.json(response.data)
    } catch (error) {
     console.log(`Error: ${error}`)
    }
})

app.get('/api/weather', async (req, res) => {

    const lat = req.query.lat
    const lon = req.query.lon

    try {

        const response = await axios(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WeatherAPI}&units=metric`)

        res.json(response.data)
    } catch (error) {
        console.log(`Error: ${error}`) 
    }

})


app.get('/api/weatherforecast', async (req, res) => {

    const lat = req.query.lat
    const lon = req.query.lon

    try {
        const response = await axios(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WeatherAPI}&units=metric`);
        res.json(response.data)
    } catch (error) {
        console.log(`Error: ${error}`)
    }
})



app.get('/api/bgimg', async (req, res) => {

    const city = req.query.city

    try {
        const response = await axios(`https://pixabay.com/api/?key=${PixelAPI}&q=${city}}&per_page=3&category=travel`)
        res.json(response.data)
    } catch (error) {
        console.log(`Error: ${error}`);
    }

});

app.listen(PORT, () => {
    console.log(`Server started on PORT ${PORT}`)
})
