/* globals Chart:false, feather:false */
var token = localStorage.getItem('token')
var userId = ''
var selectedFoodItem = {}

$('#exampleModal').modal('show')

if (token) {
  $.ajaxSetup({
    headers: {
      'Authorization': token
    }
  })
}

(function () {
  'use strict'

  var ctx = document.getElementById("myChart").getContext("2d");

  var gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);

  // styling DONT TOUCH!!!!
  var gradientChartOptionsConfiguration = {
    maintainAspectRatio: false,
    legend: {
      display: false
    },

    tooltips: {
      backgroundColor: '#f5f5f5',
      titleFontColor: '#333',
      bodyFontColor: '#666',
      bodySpacing: 4,
      xPadding: 12,
      mode: "nearest",
      intersect: 0,
      position: "nearest"
    },
    responsive: true,
    scales: {
      yAxes: [{
        barPercentage: 1.6,
        gridLines: {
          drawBorder: false,
          color: 'rgba(29,140,248,0.0)',
          zeroLineColor: "transparent",
        },
        ticks: {
          suggestedMin: 50,
          suggestedMax: 110,
          padding: 20,
          fontColor: "#9a9a9a"
        }
      }],

      xAxes: [{
        barPercentage: 1.6,
        gridLines: {
          drawBorder: false,
          color: 'rgba(220,53,69,0.1)',
          zeroLineColor: "transparent",
        },
        ticks: {
          padding: 20,
          fontColor: "#9a9a9a"
        }
      }]
    }
  };
  // styling stuff too DONT TOUCH!!!!
  gradientStroke.addColorStop(1, 'rgba(72,72,176,0.2)');
  gradientStroke.addColorStop(0.2, 'rgba(72,72,176,0.0)');
  gradientStroke.addColorStop(0, 'rgba(119,52,169,0)'); //purple colors

  // touch this <3
  var data = {
    labels: [],
    datasets: [{
      label: "Data",
      fill: true,
      backgroundColor: gradientStroke,
      borderColor: '#d048b6',
      borderWidth: 2,
      borderDash: [],
      borderDashOffset: 0.0,
      pointBackgroundColor: '#d048b6',
      pointBorderColor: 'rgba(255,255,255,0)',
      pointHoverBackgroundColor: '#d048b6',
      pointBorderWidth: 20,
      pointHoverRadius: 4,
      pointHoverBorderWidth: 15,
      pointRadius: 4,
      data: [],
    }]
  };

  var myChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: gradientChartOptionsConfiguration
  });

  var pieChartCtx = document.getElementById("PieChartGradient").getContext("2d");
  var pieChart = new Chart(pieChartCtx, {
    type: 'pie',
    data: {
      labels: [1, 2, 3],
      datasets: [{
        label: "Emails",
        pointRadius: 0,
        pointHoverRadius: 0,
        backgroundColor: ['#e14eca', '#ff8d72', '#00f2c3'],
        borderWidth: 0,
        data: []
      }]
    },
    options: {
      cutoutPercentage: 70,
      legend: {
        display: false
      },
      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest"
      },

      scales: {
        yAxes: [{
          display: 0,
          ticks: {
            display: false
          },
          gridLines: {
            drawBorder: false,
            zeroLineColor: "transparent",
            color: 'rgba(255,255,255,0.05)'
          }
        }],
        xAxes: [{
          display: 0,
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(255,255,255,0.1)',
            zeroLineColor: "transparent"
          },
          ticks: {
            display: false,
          }
        }]
      },
    }
  });

  var today = new Date()
  var userData = {}

  getExerciseHistory(today).then(() => {
    getMeals(today).then(() => {
      updateCaloriesRemaining()
    })
  })

  getWeights()

  $.get('/api/auth/current_user')
    .then(user => {
      $('#downloadReportBtn').attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(user)))
      $('#downloadReportBtn').attr('download', 'report')

      if (user.isAdmin) {
        $('#downloadReportBtn').removeClass('d-none')
      }

      $('#name').text(user.name)
      $('#calorieIntake').text(user.calorieIntake)
      userId = user.id
    })
    .catch(err => {
      console.log(err)
    })

  $('#submitExerciseBtn').click(() => {
    var caloriesBurnt = $('#caloriesBurntInput').val()

    // Logging exercise
    $.post('/api/activity/log', {
      userId: userId,
      burnt: caloriesBurnt
    })
      .then(data => {
        $('#exerciseModal').modal('hide')
        $('#caloriesBurntInput').val('')
        getExerciseHistory(today);
      })
      .catch(err => {
        console.log(err)
      })
  })

  $('#submitMealBtn').click(() => {
    if (selectedFoodItem) {
      const newMeal = {
        name: selectedFoodItem.fields.item_name || "",
        brandName: selectedFoodItem.fields.brand_name,
        calories: selectedFoodItem.fields.nf_calories,
        fats: selectedFoodItem.fields.nf_total_fat,
        protein: selectedFoodItem.fields.nf_protein,
        carbs: selectedFoodItem.fields.nf_total_carbohydrate,
        servingSizeUnit: selectedFoodItem.fields.nf_serving_size_unit,
        servingSizeQty: selectedFoodItem.fields.nf_serving_size_qty
      }

      // Ajax Call
      $.post('/api/foods/log', newMeal)
        .then(data => {
          $('#mealPlannerModal').modal('hide')
          $('#mealSelected').val('')
          getMeals(new Date())
        })
        .catch(err => {
          console.log(err)
        })
    } else {
      alert("Meal not found. Please select a preset meal.")
    }
  })

  $('#mealDate').change(function (val) {
    const date = new Date($(this).val())
    $('#datepicker').datepicker('hide')
    getMeals(date)
  })

  function getExerciseHistory(date) {
    return new Promise((resolve, reject) => {
      $.get('/api/activity/' + date.toISOString())
        .then(exercises => {
          renderExerciseHistory(exercises)
          setCaloriesBurnt(exercises)
          resolve(exercises)
        })
        .catch(err => {
          console.log(err)
          reject(err)
        })
    })
  }

  function getMeals(date) {
    return new Promise((resolve, reject) => {
      $.get('/api/foods/meals/' + date.toISOString())
        .then(meals => {
          renderMeals(meals)
          setCaloriesConsumed(meals)
          createMacrosPieChart(meals)
          resolve(meals)
        })
        .catch(err => {
          console.log(err)
          reject(err)
        })
    })
  }

  function createMacrosPieChart(meals) {
    let totalProteins = 0
    let totalCarbs = 0
    let totalFats = 0

    $.each(meals, (key, meal) => {
      totalProteins = Math.round(totalProteins + meal.protein)
      totalCarbs = Math.round(totalCarbs + meal.carbs)
      totalFats = Math.round(totalFats + meal.fats)
    })

    // Removes Protein, Fats, Carbs
    removeData(pieChart)
    removeData(pieChart)
    removeData(pieChart)

    addData(pieChart, 'Proteins', totalProteins)
    addData(pieChart, 'Carbs', totalCarbs)
    addData(pieChart, 'Fats', totalFats)
  }

  function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
      dataset.data.pop();
    });
    chart.update();
  }

  function setCaloriesConsumed(meals) {
    let total = 0;

    $.each(meals, (key, meal) => {
      total += meal.calories
    })

    $('#caloriesConsumed').text(Math.round(total))
    updateCaloriesRemaining()
  }

  function setCaloriesBurnt(exercises) {
    let total = 0;

    $.each(exercises, (key, exercise) => {
      total += exercise.burnt
    })

    $('#caloriesBurnt').text(Math.round(total))
    updateCaloriesRemaining()
  }

  function updateCaloriesRemaining() {
    const calorieIntake = parseInt($('#calorieIntake').text())
    const caloriesConsumed = parseInt($('#caloriesConsumed').text())
    const caloriesBurnt = parseInt($('#caloriesBurnt').text())

    $('#caloriesRemaining').text(calorieIntake - caloriesConsumed + caloriesBurnt)
  }

  function renderExerciseHistory(exercises) {
    $('#exerciseHistoryTable').html('')
    $('#noExercisesFound').addClass('d-none')

    if (exercises.length) {
      exercises.forEach(exercise => {
        $('#exerciseTableContainer').removeClass('d-none')

        $('#exerciseHistoryTable').append(
          '<tr>' +
          '<td>' + moment(exercise.created_at).format('MM-DD-YYYY') + '</td>' +
          '<td>' + moment(exercise.created_at).format("hh:mm a") + '</td>' +
          '<td>' + exercise.burnt + '</td>' +
          '</tr>'
        );
      })
    } else {
      $('#exerciseTableContainer').addClass('d-none')
      $('#noExercisesFound').removeClass('d-none')
    }

  }

  //unhides no meals found text once meals are populated
  function renderMeals(meals) {
    $('#mealPlannerTable').html('')
    $('.noMealsFound').addClass('d-none')

    if (meals.length) {
      $('#mealPlannerTableContainer').removeClass('d-none')
      $('#pieChart').removeClass('d-none')

      meals.forEach(meal => {
        $('#mealPlannerTable').append(
          '<tr>' +
          '<td>' + moment(meal.created_at).format('MM-DD-YYYY') + '</td>' +
          '<td>' + meal.name + '</td>' +
          '<td>' + meal.brandName + '</td>' +
          '<td>' + meal.protein + 'g </td>' +
          '<td>' + meal.carbs + 'g </td>' +
          '<td>' + meal.fats + 'g </td>' +
          '<td>' + Math.round(meal.calories) + '</td>' +
          '<td>' + meal.fats + '</td>' +
          '<td>' + meal.servingSizeQty + " " + meal.servingSizeUnit + '</td>' +
          '</tr>'
        );
      })
    } else {
      $('#mealPlannerTableContainer').addClass('d-none')
      $('.noMealsFound').removeClass('d-none')
      $('#pieChart').addClass('d-none')
    }
  }

  //renders food options in the drop-down
  function renderFoodOptions(foods) {
    $('#datalistOptions').html('')

    if (foods.hits.length) {
      $('#datalistOptions').removeClass('d-none')
      foods.hits.forEach(food => {
        $('#datalistOptions').append(
          `<option data-id="${food._id}">
            ${food.fields.item_name} ${food.fields.brand_name} | Calories: ${Math.round(food.fields.nf_calories)}
          </option>`
        );

        $('#datalistOptions').change(function () {
          var selectedFoodId = $(this).children("option:selected").data('id')
          if (selectedFoodId === food._id) {
            selectedFoodItem = food
          }
        })
      })

      $('#datalistOptions').focus()
    } else {
      $('#datalistOptions').addClass('d-none')
      alert("Food item not found. Please search for something else.")
    }
  }

  $('#mealSelected').keypress(debounce(function () {
    var $this = $(this);

    getFoodApi($this.val()).then(data => {
      renderFoodOptions(data)
    })
  }, 750));

  function debounce(func, wait, immediate) {
    var timeout;
    return function () {
      var context = this, args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  function getWeights() {
    myChart.reset()

    return new Promise((resolve, reject) => {
      $.get('/api/weight/')
        .then(weights => {
          console.log(weights)
          $.each(weights, (key, weight) => {
            addData(myChart, moment(weight.created_at).format('MM/DD'), weight.weight)
          })
          resolve(weights)
        })
        .catch(err => reject(err))
    })
  }

  function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
      dataset.data.push(data);
    });
    chart.update();
  }

  $("#mealPlannerModal").on("hidden.bs.modal", function () {
    $('#mealSelected').val('')
    $('#datalistOptions').html('')
    $('#datalistOptions').addClass('d-none')
  });

  function getFoodApi(query) {
    return new Promise((resolve, reject) => {
        fetch('api/nutritionix/getFood', {
          method: "POST",
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': localStorage.getItem('token'),
          },
          body: JSON.stringify({
            query: query,
            fields: [
              "item_name",
              "brand_name",
              "nf_calories",
              "nf_serving_size_qty",
              "nf_serving_size_unit",
              "nf_calories",
              "nf_total_fat",
              "nf_total_carbohydrate",
              "nf_protein",
            ],
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

  $('#addWeightBtn').on('click', function () {
    Swal.fire({
      title: 'Input your current weight',
      input: 'number',
      color: 'red',
      inputAttributes: {
        autocapitalize: 'off',
      },
      showCancelButton: true,
      confirmButtonText: 'Submit',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-default'
      },
      buttonsStyling: false,
      showLoaderOnConfirm: true,
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value === '') {
            resolve('Please enter your weight')
          } else {
            resolve()
          }
        })
      }
    }).then(function (data) {
      var weight = data.value

      $.post('/api/weight/log', {
        weight
      })
        .then(weight => {
          addData(myChart, moment(weight.created_at).format('MM/DD'), weight.weight)
        })
        .catch(err => {
          console.log(err)
        })
    })
  })
})()