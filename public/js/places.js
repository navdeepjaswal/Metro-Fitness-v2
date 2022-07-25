const radius = 5000;
let longitude = '';
let latitude = '';

// Pulls Longitude and Latitude
function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(setCoordinates);
    } else { 
      alert("Not supported")
    }
}

function setCoordinates(position) {
    longitude = position.coords.longitude;
    latitude = position.coords.latitude;
    getPlaces().then(function (data) { renderPlaces(data) });
}

function renderPlaces(data) {
    $('#places').html('')

    $.each(data.features, (key, place) => {
        const { name, address_line2, postcode } = place.properties;
        const extraZipCode = postcode.split(':')[1]; // the extra zip code that's coming up
        const updatedAddress = address_line2.replace(`:${extraZipCode}`, '');

        if (name) {
            $('#places').append(`
            <div class="row">
                <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                    <h4 class="card-title">${name}</h4>
                    </div>
                    <div class="card-body">
                    <p class="lead">${updatedAddress}</p>
                    </div>
                </div>
                </div>
            </div>
        `)
        }
    })
}

function getPlaces() {
    return new Promise((resolve, reject) => {
        fetch('api/places/getPlaces', {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token'),
            },
            body: JSON.stringify({
                place: $('#place').val(),
                longitude,
                latitude,
                radius
            })
        })
            .then(function (res) {
              return res.json()
            })
            .then(function (data) {
              resolve(data)
            })
            .catch(function (err) {
                reject(err)
            })
    })
}

getLocation();

$('#place').change(function(e) { getPlaces().then(function (data) { renderPlaces(data) }); })
