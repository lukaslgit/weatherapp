export default function ForecastToday(props){
    
    function formatHours(t, tz) {
    // t = dt / time
    // tz = timezone
    const localUnix = t + tz;
    const day = new Date(localUnix * 1000);

   // const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
   // const dayName = daysOfWeek[day.getUTCDay()];

    const hours = day.getUTCHours().toString().padStart(2, '0'); 
    const minutes = day.getUTCMinutes().toString().padStart(2, '0');
    const dayNum = day.getUTCDate().toString().padStart(2, '0');
    const monthNum = (day.getUTCMonth() + 1).toString().padStart(2, '0');
    
    if (props.date){
        return `${dayNum}.${monthNum}`
       // return `${dayName} ${dayNum}.${monthNum}`
    } else {
        return `${hours}:${minutes}`;
    }
}
    
    return(
        <ul>
            {props.weatherForecast.map((item, index) => {
                return (
                    <li key={index}>
                        <div className="forecastLi">
                            <section className="dayinfo">
                                <img src={props.getWeatherIcon(item.weatherId)}></img>
                                <div className="dayinfodesc">
                                    <p className="dayinfodesctime">{formatHours(item.hour, item.timezone)}</p>
                                    <p>{item.desc}</p>
                                </div>
                            </section>

                            <section className="dayinfotemp">
                                    {item.minTemp && <p id="noborder">{props.showTemp(item.minTemp)}</p>}
                                    <p>{props.showTemp(item.temp)}</p>
                            </section>

                            <section className="dayinfowind">
                                <div>
                                    <p>Wind: {item.windSpeed}km/h</p>
                                    <p>Humidity: {item.humidity}%</p>
                                </div>
                            </section>
                        </div>
                    </li>
                )
            })}
        </ul>
    )
    
   
}
