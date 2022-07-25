var token = localStorage.getItem('token')
var completedMeasurements = localStorage.getItem('completedMeasurements')

if(token && completedMeasurements === 'true') {
    window.location.href = "dashboard.html"
} else if (token && completedMeasurements === 'false') {
    window.location.href = "onboarding.html"
}