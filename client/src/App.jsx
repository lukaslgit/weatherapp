import { useState, useEffect } from "react";
import WeatherGraph from "./WeatherGraph";
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faArrowUp, faWind, faLocationDot, faDroplet, faEye, faTemperatureFull, faGauge, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import {  clear, rain1, rain2, drizzle1, drizzle2, clouds1, clouds2, clouds3, thunderstorm, snow1, snow2} from './assets/weatherIcons/exportImgs';
import bg from './assets/img/bg.jpg';
import TextType from './components/TextType';

// Components

import ForecastToday from "./components/ForecastToday";

export default function App(){

    const API_ROUTE = import.meta.env.VITE_API_URL;

    const [inputCity, setInputCity] = useState('')
    const [weatherNow, setWeatherNow] = useState({name: null, country: null, temp: null, tempFeels: null, windSpeed: null, windDegree: null, weatherId: null, time: null, timezone: null, imgUrl: null, humidity: null, visibility: null, pressure: null})
    const [weatherForecast, setWeatherForecast] = useState([{temp: null, hour: null, timezone: null, windSpeed: null, desc: null, humidity: null, weatherId: null}])
    const [weatherFiveDays, setWeatherFiveDays] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [showTodayForecast, setShowTodayForecast] = useState(true)

    const [toFahrenheit, setToFahrenheit] = useState(false)

    const [darkmode, setDarkmode] = useState(false)

    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        
        if (darkmode){
            document.body.classList.add('darkmode')
        } else {
            document.body.classList.remove('darkmode')
        }
        
        console.log(darkmode)

    },[darkmode])

    async function changeInputCity(e) {
    const newInput = e.target.value;
    setInputCity(newInput);


    if (newInput.trim().length < 2) {
        setSuggestions([]);
        return;
    }

    try {
        const res = await axios(`${API_ROUTE}/cityname?city=${newInput}`);
        if (res.data && res.data.length > 0) {
            setSuggestions(res.data);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
        }
    } catch (err) {
        console.log("Error fetching suggestions:", err);
    }
}


function handleSuggestionClick(city) {
    setInputCity(city);
    setSuggestions([]);
    setShowSuggestions(false);
    fetchWeather();
}

    async function fetchWeather() {
        try {

            setIsLoading(true)

            setInputCity(inputCity.replace(/\s+/g, " ").trim())
            
            const response = await axios(`${API_ROUTE}/cityname?city=${inputCity}`)

            if (!response){
                console.log('Unable to fetch data!')
                return
            }

            const data = response.data

            if (data.length <= 0){
                console.log('Mesto neexistuje!')
                return
            }
           console.log(data)
           // console.log(data[0].lat)
           // console.log(data[0].lon)
        

            const lat = data[0].lat
            const lon = data[0].lon

            const weatherResponse = await axios(`${API_ROUTE}/weather?lat=${lat}&lon=${lon}`)
            const weatherForecastResponse = await axios(`${API_ROUTE}/weatherforecast?lat=${lat}&lon=${lon}`)

            if (!weatherResponse || !weatherForecastResponse) {
                console.log('Unable to fetch weather!')
                return
            }

            const weatherData = await weatherResponse.data
            const weatherForecastData = await weatherForecastResponse.data
            console.log(weatherData)
            console.log(weatherForecastData)

            
            // Ziskanie obrazku (pozadia)
            const imgDataResponse = await axios(`${API_ROUTE}/bgimg?city=${data[0].local_names?.en ? data[0].local_names.en : data[0].name}`)

            if (!imgDataResponse){
                console.log('Could not fetch any images!')
                return
            }

            const imgData = await imgDataResponse.data;

            if (imgData.hits >= 0){
                console.log(`Could not found any images of ${data[0].local_names?.en ? data[0].local_names.en : data[0].name}!`)
            }

            
           // console.log(imgData)
           // console.log(imgData.hits[0])

            function round2(num) {
            return Math.round(num * 100) / 100;
}

const imgBackground = (imgData.hits && imgData.hits.length > 0) ? imgData.hits[0].largeImageURL : bg

                setWeatherNow(prev => 
                    ({...prev,
                        name: data[0].local_names?.en ? data[0].local_names.en : data[0].state ? data[0].name + ' - ' + data[0].state : data[0].name, 
                        country: weatherData.sys.country,
                        temp: weatherData.main.temp.toFixed(0),
                        tempFeels: weatherData.main.feels_like.toFixed(0), 
                        windSpeed: weatherData.wind.speed, 
                        windDegree: weatherData.wind.deg,
                        weatherId: weatherData.weather[0].id,
                        time: weatherData.dt,
                        timezone: weatherData.timezone,
                        imgUrl: imgBackground,
                        humidity: weatherData.main.humidity,
                        visibility: weatherData.visibility,
                        pressure: weatherData.main.pressure
                    }))

                setWeatherForecast(weatherForecastData.list.slice(0, 8).map(item => ({
                   
                    temp: item.main.temp.toFixed(0),
                    hour: item.dt,
                    timezone: weatherForecastData.city.timezone,
                    windSpeed: item.wind.speed,
                    desc: item.weather[0].main,
                    humidity: item.main.humidity,
                    weatherId: item.weather[0].id,
                    minTemp: item.temp_min
                })))


                const dailyData = {};
                const now = new Date();

                weatherForecastData.list.forEach(item => {
                    const localUnix = (item.dt + weatherForecastData.city.timezone) * 1000;
                    const localDate = new Date(localUnix);
                    
                    const today = new Date(now.getTime() + weatherForecastData.city.timezone * 1000);
                    
                    
                    if (localDate.toISOString().split('T')[0] === today.toISOString().split('T')[0]) return;

                    const dateStr = localDate.toISOString().split('T')[0];
                    if (!dailyData[dateStr]) dailyData[dateStr] = [];
                    dailyData[dateStr].push(item);
                });

                const nextFiveDays = Object.entries(dailyData)
                    .slice(0, 5)
                    .map(([date, items]) => {
                        let maxTemp = Math.max(...items.map(i => i.main.temp_max));
                        let minTemp = Math.min(...items.map(i => i.main.temp_min));
                        const firstItem = items[0];

                        return {
                            temp: maxTemp.toFixed(0),
                            minTemp: minTemp.toFixed(0),
                            windSpeed: firstItem.wind.speed,
                            desc: firstItem.weather[0].main,
                            humidity: firstItem.main.humidity,
                            weatherId: firstItem.weather[0].id,
                            hour: firstItem.dt,
                            timezone: weatherForecastData.city.timezone
                        };
                    });

                setWeatherFiveDays(nextFiveDays);





                console.log(nextFiveDays)




        } catch (error) {
            console.log(`Error: ${error}`);
        } finally {
            setIsLoading(false)
        }
    }

    function getWeatherIcon(id) {
    switch (true) {
        case (id === 804):
            return clouds3;
        case (id >= 802 && id < 804):
            return clouds2;
        case (id === 801):
            return clouds1;
        case (id === 800):
            return clear;
        case (id >= 701 && id < 800):
            return clear;
        case (id === 600):
            return snow1;
        case (id >= 601 && id < 700):
            return snow2;
        case (id >= 500 && id < 502):
            return rain1;
        case (id >= 502 && id < 600):
            return rain2;
        case (id >= 300 && id < 302):
            return drizzle1;
        case (id >= 302 && id < 400):
            return drizzle2;
        case (id >= 200 && id < 300):
            return thunderstorm;
        default:
            return clear;
    }
}

function getPressureResult(pressure) {
    switch (true) {
        case (pressure < 1000):
            return 'Low';
        case (pressure >= 1000 && pressure <= 1020):
            return 'Normal';
        case (pressure > 1020):
            return 'High';
        default:
            return 'Error';
    }
}

function getLocalTimeFromTimezone(tz) {
    const utcMs = Date.now();
    const localMs = utcMs + tz * 1000;
    const local = new Date(localMs);
    const hours = local.getUTCHours().toString().padStart(2, '0');
    const minutes = local.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function showTemp(celsius){

    //console.log(celsius)

    if (!toFahrenheit){
        return celsius+'°C'
    } else {
        return (9/5*celsius+32).toFixed(0)+'°F'
}


//                <div id='graph'>
//                    <WeatherGraph data={weatherForecast} timezone={weatherNow.timezone} />
//                </div>

}



    return(
    <>
        
        <nav id="nav">
            
            <div>
                <div className="navLeft">
                    <div className="currentCity">
                        <FontAwesomeIcon icon={faLocationDot} /> 
                        {weatherNow.country ? <p>{weatherNow.name} (<a>{weatherNow.country}</a>)</p> : <div><p>Search for</p><a><TextType 
                                                                                                            text={[
                                                                                                                " New York",
                                                                                                                " London",
                                                                                                                " Paris",
                                                                                                                " Tokyo",
                                                                                                                " Los Angeles",
                                                                                                                " Dubai",
                                                                                                                " Rome",
                                                                                                                " Barcelona",
                                                                                                                " Berlin",
                                                                                                                " Sydney",
                                                                                                                " Moscow",
                                                                                                                " Beijing",
                                                                                                                " Singapore",
                                                                                                                " Hong Kong",
                                                                                                                " Istanbul",
                                                                                                                " Vienna",
                                                                                                                " Prague",
                                                                                                                " Budapest",
                                                                                                                " Amsterdam",
                                                                                                                " Madrid",
                                                                                                                " Athens",
                                                                                                                " Bratislava",
                                                                                                                " Brno"
                                                                                                            ]}
                                                                                                            typingSpeed={75}
                                                                                                            pauseDuration={1500}
                                                                                                            showCursor={true}
                                                                                                            cursorCharacter="|"
                                                                                                        /></a></div>}
                    </div>
                    <div style={{ position: "relative" }}>
                        <input
                            placeholder="Vienna..."
                            onChange={changeInputCity}
                            value={inputCity}
                            id='inputCityEl'
                            onFocus={() => setShowSuggestions(false)}
                            onBlur={() => {
                                setTimeout(() => setShowSuggestions(false), 100);
                            }}
                            onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                setSuggestions([]);
                                setShowSuggestions(false);
                                fetchWeather();
                            }
                        }}
                        />
                        <button
                            id="searchBtn"
                            onClick={() => {
                                setSuggestions([]);
                                setShowSuggestions(false);
                                fetchWeather();
                            }}
                        >
                            <FontAwesomeIcon icon={faMagnifyingGlass}/>
                        </button>

                        {showSuggestions && suggestions.length > 0 && (
                            <ul style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                right: 0,
                                background: "white",
                                border: "1px solid #ccc",
                                listStyle: "none",
                                margin: 0,
                                padding: 0,
                                zIndex: 10,
                                borderRadius: "8px"
                            }}>
                                {suggestions.map((s, index) => (
                                    <li
                                        key={index}
                                        style={{ padding: "8px", cursor: "pointer" }}
                                        onMouseDown={() => handleSuggestionClick(s.name)} // mouseDown aby nevyvolal blur pred kliknutím
                                    >
                                        {s.name} ({s.country})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="navRight">
                    <button id="switchBtn" onClick={() => setToFahrenheit(!toFahrenheit)}>{!toFahrenheit ? '°C' : '°F'}</button>
                    <button className="darkmodBtn" onClick={() => setDarkmode(!darkmode)}>{darkmode ? <FontAwesomeIcon icon={faMoon} /> : <FontAwesomeIcon icon={faSun} />}</button>
                </div>
            </div>
        </nav>

        {isLoading && 
            <div className="loader"></div>
        }
        
        <main>
        
        {weatherNow.name && !isLoading &&
            <section id='mainSection'>
                
                <div id="leftSide">
                
                    <div style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${weatherNow.imgUrl}')`}} id="weatherInfoNow">
                        <div id="weatherLeft">
                            <img src={getWeatherIcon(weatherNow.weatherId)}></img>
                            <div>
                                <p>{showTemp(weatherNow.temp)}</p>
                                <p className='time'>{getLocalTimeFromTimezone(weatherNow.timezone)}</p>
                            </div>
                        </div>

                        <div id="weatherRight">
                            <FontAwesomeIcon icon={faWind}/>
                            <p>{weatherNow.windSpeed} km/h</p>
                            <i><FontAwesomeIcon style={{rotate: `${weatherNow.windDegree}deg`}} icon={faArrowUp}/></i>
                        </div>
                    </div>

                    <div className="weatherInfoExtra">
                        <section className="weatherInfoExtraUp">
                            <div>
                                <div className="weatherInfoExtraIcon">
                                    <FontAwesomeIcon icon={faLocationDot}/>
                                </div>
                                <div className="weatherInfoExtraDesc">
                                    <p>Location</p>
                                    <h1>{weatherNow.name}</h1>
                                </div>
                            </div>
                            <div>
                                <div className="weatherInfoExtraIcon">
                                    <FontAwesomeIcon icon={faDroplet} />
                                </div>
                                <div className="weatherInfoExtraDesc">
                                    <p>Humidity</p>
                                    <h1>{weatherNow.humidity}%</h1>
                                </div>
                            </div>
                            <div>
                                <div className="weatherInfoExtraIcon">
                                    <FontAwesomeIcon icon={faEye} />
                                </div>
                                <div className="weatherInfoExtraDesc">
                                    <p>Visibility</p>
                                    <h1>{weatherNow.visibility >= 10000 ? '+ ' : null}{weatherNow.visibility / 1000}km</h1>
                                </div>
                            </div>
                        </section>

                        <section className="weatherInfoExtraDown">
                            <div>
                                <div className="weatherInfoExtraIcon">
                                    <FontAwesomeIcon icon={faWind}/>
                                </div>
                                <div className="weatherInfoExtraDesc">
                                    <p>Wind (<i><FontAwesomeIcon style={{rotate: `${weatherNow.windDegree}deg`}} icon={faArrowUp}/></i>)</p>
                                    <h1>{weatherNow.windSpeed} km/h</h1>
                                </div>
                            </div>
                            <div>
                                <div className="weatherInfoExtraIcon">
                                    <FontAwesomeIcon icon={faGauge} />
                                </div>
                                <div className="weatherInfoExtraDesc">
                                    <p>Pressure <a>({getPressureResult(weatherNow.pressure)})</a></p>
                                    <h1>{weatherNow.pressure} hPa</h1>
                                </div>
                            </div>
                            <div>
                                <div className="weatherInfoExtraIcon">
                                    <FontAwesomeIcon icon={faTemperatureFull} />
                                </div>
                                <div className="weatherInfoExtraDesc">
                                    <p>Feels like</p>
                                    <h1>{showTemp(weatherNow.tempFeels)}</h1>
                                </div>
                            </div>
                        </section>
                    </div>

                </div>


                <div id="rightSide">
                    <nav>
                        <button className={showTodayForecast ? 'active' : null} onClick={() => setShowTodayForecast(true)}>24H</button>
                        <button className={showTodayForecast ? null : 'active'} onClick={() => setShowTodayForecast(false)} name="5days">5-DAYS</button>
                    </nav>

                    <section>
                        {showTodayForecast && <ForecastToday weatherForecast={weatherForecast} getWeatherIcon={getWeatherIcon} showTemp={showTemp} />}
                        {!showTodayForecast && <ForecastToday weatherForecast={weatherFiveDays} date={true} getWeatherIcon={getWeatherIcon} showTemp={showTemp} />}
                    </section>
                </div>



            </section>
            
        }

        </main>


        <footer>
            <div>
                <p><a>Weather App</a></p>
                <p>Lukas Lutonsky</p>
                <p>lukas@lutonsky.eu</p>
                <p><a target="_blank" rel="noopener noreferrer" href="https://github.com/lukaslgit/weatherapp">GitHub Link</a></p>
            </div>
        </footer>

    </>)
}