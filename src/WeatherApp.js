import React, {useState} from 'react';
import styled from '@emotion/styled';
import { ReactComponent as CloudyIcon } from './images/cloudy.svg'
import { ReactComponent as AirFlowIcon } from './images/airFlow.svg';
import { ReactComponent as RainIcon } from './images/rain.svg';
import { ReactComponent as RedoIcon } from './images/redo.svg';

const Container = styled.div`
  background-color: #ededed;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
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

const Cloudy = styled(CloudyIcon)`
    flex-basis: 30%;
`

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

const WeatherApp = () => {

    const [currentWeather, setCurrentWeather] = useState({
        observationTime: '2022-01-24 12:12:12',
        locationName: '龍井',
        description: '雨天',
        temperature: 18,
        windSpeed: 0.3,
        humid: 0.88,
    }); 

    const handleClick = () =>{
        fetch(
            'https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0001-001?Authorization=CWB-06D73B14-72A5-4363-B448-78EB292C33F5&locationName=%E9%BE%8D%E4%BA%95'
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

                    setCurrentWeather ({
                        observationTime: locationData.time.obsTime,
                        locationName: locationData.locationName,
                        description: '雨天',
                        temperature: weatherElements.TEMP,
                        windSpeed: weatherElements.WDSD,
                        humid: weatherElements.HUMD,
                    });              
                });
        };


    return (
        <Container>
            <WeatherCard>
                <Location>{currentWeather.locationName}</Location>
                <Description>
                    {currentWeather.description}
                </Description>
                <CurrentWeather>
                    <Temperature>
                        {Math.round(currentWeather.temperature)} < Celsius >°C</Celsius>
                    </Temperature>
                    <Cloudy/>
                </CurrentWeather>
                <AirFlow>
                    <AirFlowIcon />
                    {currentWeather.windSpeed} m/h
                    </AirFlow>
                <Rain>
                    <RainIcon />
                    {Math.round( currentWeather.humid * 100)} %
                    </Rain>
                <Redo onClick={handleClick}>
                    最後觀測時間:
                    {new Intl.DateTimeFormat('zh-TW', {
                        hour: 'numeric',
                        minute: 'numeric',
                    }).format(new Date(currentWeather.observationTime))}{' '}
                    <RedoIcon />
                </Redo>
            </WeatherCard>
        </Container>
    );
};

export default WeatherApp;  