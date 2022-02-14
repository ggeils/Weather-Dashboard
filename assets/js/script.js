const apiKey = '8a12db2e111f4e6f3e0d6278298daa8c';
let inputForm = $('#searchCity');

let createSearchHistory = function() {
    // Gets search history from local story, if returns null, fills it with the searchHistory array
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory'));
    if (searchHistory == null) {
        searchHistory = ["Austin, Chicago, New York, Orlando, San Francisco, Seattle, Denveer, Atlanta"]
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
    var historyContainer = $(".list-group");
    historyContainer.html("");
    for (i in searchHistory) {
        let button = $("<button>")
            .addClass("list-group-item list-group-item-action")
            .attr("id", "cityList")
            .attr("type", "button")
            .text(searchHistory[i]);
        historyContainer.append(button);
    }
}

let searchHistoryUpdate = function(city) {
    // Grabs search history from local data and updates it with last entry
        let searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
        searchHistory.unshift(city);
        searchHistory.pop();
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
        let itemList = $(".list-group-item");

        for (l in itemList) {
            itemList[l].textContent = searchHistory[l];
    };
};


let currentWeatherUpdate = function(response) {
    // grabs elements from index.html
    let date = $("#date");
    let temp = $("#temperature");
    let windSpeed = $("#windSpeed");
    let humidity = $("#humidity");
    let icon = $("#weatherIcon");

    // fetches data from the API
    let currentTemp = response.main.temp;
    let currentHumidity = response.main.humidity;
    let currentWindSpeed = response.wind.speed;
    var currentTimeCodeUnix = response.dt;
    var currentDate = new Date(currentTimeCodeUnix*1000).toLocaleDateString("en-US");
    let weatherIcon = response.weather[0].icon;
    
    // uses fetched data to update the HTML elements
    date.text(currentDate);
    temp.text(currentTemp);
    windSpeed.text(currentWindSpeed);
    humidity.text(currentHumidity);
    icon.attr("src", "https://openweathermap.org/img/w/" + weatherIcon + ".png");

    let locationArray = {
        lat: response.coord.lat,
        long: response.coord.lon
    }
    
    return locationArray;
}; 

let getIndex = function(response) {
    // Takes json data and returns index value
    let ind = 0
    for (i=1; i<response.list.length; i++) {
        let currentTime = new Date(response.list[i].dt*1000);
        let pastTime = new Date(response.list[i-1].dt*1000);
        if (currentTime.getDay() != pastTime.getDay()) {
            if (i == 8) {
                ind = 0;
                return ind;
            } else {
                ind = i;
                return ind;
            };
        };
    };
};

let fiveDayForecast = function(cityName) {
    let forecastContainer = $("#dailyForecast");
    forecastContainer.html("");
    
    let apiUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&units=imperial&appid=" + apiKey;

    fetch(apiUrl).then(function(response) {
        response.json().then(function(response) {
            var ind = getIndex(response);
    
            for (i=0;i<5;i++) {
                // Finds the index value for the next 5 days
                let realInd = i * 8 + ind + 4;
                if (realInd>39) {realInd = 39};
                let timeCode = response.list[realInd].dt;
                let temp = response.list[realInd].main.temp;
                let time = new Date(timeCode*1000).toLocaleDateString("en-US");
                let icon = response.list[realInd].weather[0].icon;
                let humidity = response.list[realInd].main.humidity;
                let card = $("<div>").addClass("col-2 card bg-primary pt-2");
                let cardTitle= $("<h6>").addClass("card-title").text(time);
                let iconDiv = $("<div>").addClass("weather-icon");
                let cardIcon = $("<img>").addClass("p-2").attr("src","https://openweathermap.org/img/w/" + icon + ".png");
                let cardTemp = $("<p>").addClass("card-text").text("Temp: " + temp + " °F");
                let cardHumidity = $("<p>").addClass("card-text mb-2").text("Humidity: " + humidity + "%");
                
                // Appends data of the cards to match the newly pulled data
                iconDiv.append(cardIcon);
                card.append(cardTitle);
                card.append(iconDiv);
                card.append(cardTemp);
                card.append(cardHumidity);
                forecastContainer.append(card);
            }
        });
    }).catch(function(error) {
        alert("Unable to connect to the OpenWeather API.");
    });
};

var updateUV = function(val) {
    // pulls the UV value to then edit the uv element
    var uv = $("#uvIndex");
    uv.text(val);
    uv.removeClass();

    if (val < 3) {
        uv.addClass("bg-success text-light rounded p-2");
    } else if (val < 6) {
        uv.addClass("bg-warning text-light rounded p-2");
    } else {
        uv.addClass("bg-danger text-light rounded p-2");
    };
};

let getCurrentWeather = function(cityName) {
    
        let apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial&appid=" + apiKey;
    
        fetch(apiUrl).then(function(response) {
            if (response.ok) {
                response.json().then(function(response) {
                    let cityContainer = $("#searchCity");
                    cityContainer.text(cityName);
                    searchHistoryUpdate(cityName);

                    let location = currentWeatherUpdate(response);
                    fiveDayForecast(cityName);
                    
                    var uvAPI = "https://api.openweathermap.org/data/2.5/uvi?lat=" + location.lat  + "&lon=" + location.long + "&appid=" + apiKey;
                    return fetch(uvAPI);
                }).then(function(response) {
                    response.json().then(function(response) {
                        updateUV(response.value);
                    });
                });
            } else {
                alert("Not a valid city!");
            };
        }).catch(function(error) {
            alert("OpenWeather API connection failed.");
        })
    };

    let submitHandler = function(event) {
        target = $(event.target);
        targetId = target.attr("id");
        
        if (targetId === "cityList") {
            var city = target.text();
        } else if (targetId === "search-submit") {
            var city = $("#searchCity").val();
        };
    
        if (city) {
            getCurrentWeather(city);
        } else {
            alert("You haven't entered a city!");
        }
    };


    createSearchHistory();
    getCurrentWeather("Atlanta");


$("button").click(submitHandler);