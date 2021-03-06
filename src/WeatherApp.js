import React, {useState , useEffect ,useCallback , useMemo} from 'react';
import styled from '@emotion/styled';
import sunriseAndSunsetData from './sunrise-sunset.json';
import { ReactComponent as AirFlowIcon } from './images/airFlow.svg';
import { ReactComponent as RainIcon } from './images/rain.svg';
import { ReactComponent as RedoIcon } from './images/redo.svg';
import { ReactComponent as LoadingIcon } from './images/loading.svg';
import WeatherIcon from './WeatherIcon';

const Container = styled.div`
  background-color: #ededed;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing:Border-box;
`;

const WeatherCard = styled.div`
  position: relative;
  min-width: 360px;
  box-shadow: 0 1px 3px 0 #999999;
  background-color: #f9f9f9;
  box-sizing: border-box;
  padding: 30px 15px;
`;

const Location = styled.div`
  font-size: 28px;
  color: #212121;
  margin-bottom: 20px;
`;

const Description = styled.div`
  font-size: 16px;
  color: #828282;
  margin-bottom: 30px;
`;

const CurrentWeather = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Temperature = styled.div`
  color: #757575;
  font-size: 96px;
  font-weight: 300;
  display: flex;
`;

const Celsius = styled.div`
  font-weight: normal;
  font-size: 42px;
`;

const AirFlow = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: #828282;
  margin-bottom: 20px;

  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
`;

const Rain = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: #828282;

  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
`;


const Redo = styled.div`
    position: absolute;
    right: 15px;
    bottom: 15px;   
    font-size : 12px;
    display: inline-flex;
    align-itmes : flex-end;
    color : #828282;

    svg{
        marign-left: 10px;
        width: 15px;
        height: 15px;
        cursor: pointer;
    }
`;  

const getMoment = (locationName) => {
    const location = sunriseAndSunsetData.find(
        (data) => data.locationName === locationName
    );
    console.log('地名', locationName);
    if (!location) return null;
    const now = new Date();

    const nowDate = Intl.DateTimeFormat('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })
        .format(now)
        .replace(/\//g, '-');

    const locationDate =
        location.time && location.time.find((time) => time.dataTime === nowDate);

    const sunriseTimestamp = new Date(
        `${locationDate.dataTime} ${locationDate.sunrise}`
    ).getTime();
    const sunsetTimestamp = new Date(
        `${locationDate.dataTime} ${locationDate.sunset}`
    ).getTime();
    const nowTimeStamp = now.getTime();

    return sunriseTimestamp <= nowTimeStamp && nowTimeStamp <= sunsetTimestamp
        ? 'day'
        : 'night';
};



const fetchCurrentWeather = () => {
    return fetch(
        'https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-06D73B14-72A5-4363-B448-78EB292C33F5&locationName=%E8%87%BA%E4%B8%AD'
    )
        .then((response) => response.json())
        .then((data) => {
            const locationData = data.records.location[0];

            const weatherElements = locationData.weatherElement.reduce(
                (neededElements, item) => {
                    if (['WDSD', 'TEMP', 'HUMD'].includes(item.elementName)) {
                        neededElements[item.elementName] = item.elementValue;
                    }
                    return neededElements;
                },
                {}
            );

            return {
                observationTime: locationData.time.obsTime,
                locationName: locationData.locationName,
                temperature: weatherElements.TEMP,
                windSpeed: weatherElements.WDSD,
                humid: weatherElements.HUMD,
            };
        });
};

const fetchWeatherForecast = () => {
    return fetch(
        'https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-06D73B14-72A5-4363-B448-78EB292C33F5&locationName=%E8%87%BA%E4%B8%AD%E5%B8%82'
    )
        .then((response) => response.json())
        .then((data) => {
            const locationData = data.records.location[0];
            const weatherElements = locationData.weatherElement.reduce(
                (neededElements, item) => {
                    if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
                        neededElements[item.elementName] = item.time[0].parameter;
                    }
                    return neededElements;
                },
                {}
            );
            return {
                description: weatherElements.Wx.parameterName,
                weatherCode: weatherElements.Wx.parameterValue,
                rainPossibility: weatherElements.PoP.parameterName,
                comfortability: weatherElements.CI.parameterName,
            };
        });
}

const WeatherApp = () => {
    console.log('--- invoke function compont ---');
    const [weatherElement, setWeatherElement] = useState({
        observationTime: new Date(),
        locationName: '',
        humid: 0,
        temperature: 0,
        windSpeed: 0,
        description: '',
        weatherCode: 0,
        rainPossibility: 0,
        comfortability: '',
        isLoading: true,
    });




    const fetchData = useCallback(() => {
        const fetchingData = async () => { 
            const [currentWeather, weatherForecast] = await Promise.all([
                fetchCurrentWeather(),
                fetchWeatherForecast(),
            ]);                
            setWeatherElement({
                ...currentWeather,        
                ...weatherForecast,
                isLoading: false,
            });
        };
        setWeatherElement((prevState) => ({
            ...prevState,
            isLoading: true,
        }));
        fetchingData();
    },[])

    useEffect(() => {
        fetchData();

    }, [fetchData]);

    const moment = useMemo(() => getMoment(weatherElement.locationName), [
        weatherElement.locationName,
    ]);

    return (
        <Container>
            {console.log(weatherElement.isLoading)}
            <WeatherCard>
                <Location>{weatherElement.locationName}</Location>
                <Description>
                    {weatherElement.description} {weatherElement.comfortability}
                </Description>
                <CurrentWeather>
                    <Temperature>
                        {Math.round(weatherElement.temperature)} < Celsius >°C</Celsius>
                    </Temperature>
                    <WeatherIcon
                        currentWeatherCode={weatherElement.weatherCode}
                        moment={moment || 'day'}
                    />
                </CurrentWeather>
                <AirFlow>
                    <AirFlowIcon />
                    {weatherElement.windSpeed} m/h
                </AirFlow>
                <Rain>
                    <RainIcon />
                    {Math.round(weatherElement.rainPossibility)} %
                </Rain>
                <Redo onClick={fetchData}>
                    最後觀測時間:
                    {new Intl.DateTimeFormat('zh-TW', {
                        hour: 'numeric',
                        minute: 'numeric',
                    }).format(new Date(weatherElement.observationTime))}{' '}
                    {weatherElement.isLoading ? <LoadingIcon /> : <RedoIcon />}
                </Redo>
            </WeatherCard>
        </Container>
    );
};

export default WeatherApp;  