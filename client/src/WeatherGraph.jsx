import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function WeatherGraph({ data, timezone }) {

    function formatHours(t, tz) {
    // t = dt / time
    // tz = timezone
    const localUnix = t + tz; // sekundy od UTC + offset v sekundách
    const day = new Date(localUnix * 1000); // premena na milisekundy
    const hours = day.getUTCHours().toString().padStart(2, '0'); 
    const minutes = day.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}


  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        
        <XAxis
          dataKey="hour"
          //label={{ value: 'Hodiny', position: 'insideBottomRight', offset: -5 }}
          tickFormatter={hour => formatHours(hour, timezone)} // ak chceš, formátuj hodiny na reťazce
        />
        
        <YAxis
          // label={{ value: 'Teplota (°C)', angle: -90, position: 'insideLeft' }}
          domain={['auto', 'auto']}  // automatické nastavenie rozsahu
        />
        
        <Tooltip 
            formatter={(value) => [`${value} °C`, 'Teplota']}
            labelFormatter={(label) => formatHours(label)} 
        />
        
        <Line
          type="monotone"
          dataKey="temp"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}