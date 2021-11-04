// GIVEN a weather dashboard with form inputs
// WHEN I search for a city
// THEN I am presented with current and future conditions for that city and that city is added to the search history
// WHEN I view current weather conditions for that city
// THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index
// WHEN I view the UV index
// THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
// WHEN I view future weather conditions for that city
// THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, the wind speed, and the humidity
// WHEN I click on a city in the search history
// THEN I am again presented with current and future conditions for that city

var apiKey = 'bcb6db5884ed7a800c2c97ebc96a0221';
var search = document.getElementById("search");
var currentCity;
var dayInSeconds = 86400;
var cityName = document.getElementById("cityname");
var temp = document.getElementById("temp");
var wind = document.getElementById("wind");
var humidity = document.getElementById("humidity");
var uvi = document.getElementById("uvi");
var uviDisplayNumber = document.getElementById("uvi-display-number");
var cityNames = localStorage.getItem("city names");
var searchList = $("#search-list");
var clear = document.getElementById("clear");
//hide cards until search button is clicked
document.getElementById("current-weather").style.display = "none";
document.getElementById("future-weather").style.display = "none";
document.getElementById("forecast-label").style.display = "none";
//parse cityNames as an array or assign it an empty array
if (cityNames) {
    cityNames = JSON.parse(cityNames);
}
else {
    cityNames = [];
}
//search for a city
function searchCity(event) {
    //prevent default refresh
    event.preventDefault();
    //display weather cards
    document.getElementById("current-weather").style.display = "block";
    document.getElementById("future-weather").style.display = "flex";
    document.getElementById("forecast-label").style.display = "block";
    //store user input in variable
    currentCity = document.getElementById("city").value;
    document.getElementById("city").value = '';
    //URL for API call using city name
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + currentCity + "&units=imperial&appid=" + apiKey;
    //fetch request using user specified city name
    fetch(queryURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            //add a city name to the cityNames array
            if (data.name) {
                //only add unique entries to cityNames array
                if (cityNames.includes(data.name) == false) {
                    cityNames.push(data.name);
                    //store the array as a string in local storage
                    localStorage.setItem("city names", JSON.stringify(cityNames));
                }
                //display city name
                cityName.textContent = data.name;
                //display search history
                displaySearchHistory();
                //save latitude and longitude to be used as parameters in another fetch request           
                var lat = data.coord.lat;
                var lon = data.coord.lon;
                //query URL using lat and lon
                var queryURL2 = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + apiKey;
                //fetch request using latitude and longitude from user specified city name
                fetch(queryURL2)
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (data) {
                        //convert the date into a readable string
                        var currentDate = new Date(data.current.dt * 1000);
                        var formatCurrentDate = currentDate.toLocaleString("en-US", { year: 'numeric', month: 'numeric', day: 'numeric' });
                        //display current date
                        date.textContent = "(" + formatCurrentDate + ")";
                        //display current weather icon
                        img_home.innerHTML = '';
                        var img = new Image();
                        img.src = "https://openweathermap.org/img/wn/" + data.current.weather[0].icon + "@2x.png";
                        img_home.appendChild(img);
                        //display current weather data
                        temp.textContent = "Temp: " + data.current.temp + " °F";
                        humidity.textContent = "Humidity: " + data.current.humidity + "%";
                        wind.textContent = "Wind Speed: " + data.current.wind_speed + " mph";
                        uvi.textContent = "UV Index: ";
                        uviDisplayNumber.textContent = data.current.uvi;
                        //color code UV Index
                        uviNumber = data.current.uvi;
                        console.log(uviNumber);
                        if (uviNumber <= 2) {
                            uviDisplayNumber.style.backgroundColor = "green";
                            uviDisplayNumber.style.color = "white";
                        }
                        else if ((2 < uviNumber) && (uviNumber <= 5)) {
                            uviDisplayNumber.style.backgroundColor = "yellow";
                            uviDisplayNumber.style.color = "black";
                        }
                        else if ((5 < uviNumber) && (uviNumber <= 7)) {
                            uviDisplayNumber.style.backgroundColor = "orange";
                            uviDisplayNumber.style.color = "white";
                        }
                        else {
                            uviDisplayNumber.style.backgroundColor = "red";
                            uviDisplayNumber.style.color = "white";
                        }
                        //display weather data for previous days
                        for (var i = 1; i < 6; i++) {
                            currentDate = new Date(data.daily[i].dt * 1000);
                            formatCurrentDate = currentDate.toLocaleString("en-US", { year: 'numeric', month: 'numeric', day: 'numeric' });
                            //clear inner HTML
                            $("#" + i).empty();
                            //display weather info for 5 days in the future
                            $("#" + i).append("<p style=font-weight:bold;font-size:20px>" + formatCurrentDate + "</p>");
                            $("#" + i).append("<img src = https://openweathermap.org/img/wn/" + data.daily[i].weather[0].icon + "@2x.png ></img>");
                            $("#" + i).append("<p>Temp: " + data.daily[i].temp.day + " °F</p>");
                            $("#" + i).append("<p>Wind Speed: " + data.daily[i].wind_speed + " mph</p>");
                            $("#" + i).append("<p>Humidity: " + data.daily[i].humidity + "%</p>");
                            $("#" + i).append("<p>UV Index: " + data.daily[i].uvi + "</p>");
                        };

                    });
            }
            else {
                document.getElementById("current-weather").style.display = "none";
                document.getElementById("future-weather").style.display = "none";
                document.getElementById("forecast-label").style.display = "none";
                alert("That's not a valid city name. Please try again.");
            }
        });
};
//displays search history
function displaySearchHistory() {
    searchList.empty();
    //loops through local storage to display city names
    for (var i = 0; i < cityNames.length; i++) {
        searchList.append("<button class=cities list-group-item style=list-style:none;text-align:center;background-color:gray;color:white;margin-top:0px;font-weight:bold;border-radius:0.5em>" + cityNames[i] + "</button>");
    };
    $(".cities").each(function (city) {
        //when a city name is clicked...
        $(this).on("click", function () {
            document.getElementById("current-weather").style.display = "block";
            document.getElementById("future-weather").style.display = "flex";
            document.getElementById("forecast-label").style.display = "block";
            currentCity = $(this).text();
            console.log(currentCity);
            queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + currentCity + "&units=imperial&appid=" + apiKey;
            //fetch request using clicked city name
            fetch(queryURL)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    //display city name
                    cityName.textContent = data.name;
                    //save latitude and longitude to be used as parameters in another fetch request           
                    lat = data.coord.lat;
                    lon = data.coord.lon;
                    //query URL using lat and lon
                    queryURL2 = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + apiKey;
                    //fetch request using latitude and longitude from user specified city name
                    fetch(queryURL2)
                        .then(function (response) {
                            return response.json();
                        })
                        .then(function (data) {
                            //convert the date into a readable string
                            var currentDate = new Date(data.current.dt * 1000);
                            var formatCurrentDate = currentDate.toLocaleString("en-US", { year: 'numeric', month: 'numeric', day: 'numeric' });
                            //display current date
                            date.textContent = "(" + formatCurrentDate + ")";
                            //display current weather icon
                            img_home.innerHTML = '';
                            var img = new Image();
                            img.src = "https://openweathermap.org/img/wn/" + data.current.weather[0].icon + "@2x.png";
                            img_home.appendChild(img);
                            //display current weather data
                            temp.textContent = "Temp: " + data.current.temp + " °F";
                            wind.textContent = "Wind Speed: " + data.current.wind_speed + " mph"
                            humidity.textContent = "Humidity: " + data.current.humidity + "%";
                            uvi.textContent = "UV Index: ";
                            uviDisplayNumber.textContent = data.current.uvi;
                            //color code UV Index
                            uviNumber = data.current.uvi;
                            console.log(uviNumber);
                            if (uviNumber <= 2) {
                                uviDisplayNumber.style.backgroundColor = "green";
                                uviDisplayNumber.style.color = "white";
                            }
                            else if ((2 < uviNumber) && (uviNumber <= 5)) {
                                uviDisplayNumber.style.backgroundColor = "yellow";
                                uviDisplayNumber.style.color = "black";
                            }
                            else if ((5 < uviNumber) && (uviNumber <= 7)) {
                                uviDisplayNumber.style.backgroundColor = "orange";
                                uviDisplayNumber.style.color = "white";
                            }
                            else {
                                uviDisplayNumber.style.backgroundColor = "red";
                                uviDisplayNumber.style.color = "white";
                            }

                            //display weather data for previous days
                            for (var i = 1; i < 6; i++) {
                                currentDate = new Date(data.daily[i].dt * 1000);
                                formatCurrentDate = currentDate.toLocaleString("en-US", { year: 'numeric', month: 'numeric', day: 'numeric' });
                                //clear inner HTML
                                $("#" + i).empty();
                                //display weather info for 5 days in the future
                                $("#" + i).append("<p>" + formatCurrentDate + "</p>");
                                $("#" + i).append("<img src = https://openweathermap.org/img/wn/" + data.daily[i].weather[0].icon + "@2x.png ></img>");
                                $("#" + i).append("<p>Temp: " + data.daily[i].temp.day + "° Fahrenheit</p>");
                                $("#" + i).append("<p>Humidity: " + data.daily[i].humidity + "%</p>");
                                $("#" + i).append("<p>Wind Speed: " + data.daily[i].wind_speed + " MPH</p>");
                                $("#" + i).append("<p>UV Index: " + data.daily[i].uvi + "</p>");
                            };
                        });
                });

        });
    });
};

displaySearchHistory();

//when search button is clicked...
search.addEventListener("click", searchCity);
//when clear button is clicked...
clear.addEventListener("click", function (event) {
    event.preventDefault();
    localStorage.clear();
    cityNames = [];
    searchList.empty();
});