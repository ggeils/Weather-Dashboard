const apiKey = '8a12db2e111f4e6f3e0d6278298daa8c';
let inputForm = $('#city');

let createSearchHistory = function() {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory'));
    if (searchHistory == null) {
        searchHistory = ["Austin, Chicago, New York, Orlando, San Francisco, Seattle, Denveer, Atlanta"]
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
}