var token = localStorage.getItem('token')
var selectedFoodItem = {}
var today = new Date()

if (token) {
  $.ajaxSetup({
    headers: {
      'Authorization': token
    }
  })
}

getMeals(today).then(() => {
  updateCaloriesRemaining()
})

var btn1 = document.getElementById("myBtn1");
var modal1 = document.getElementById("myModal1");
var modal = document.getElementById("myModal");
var btn = document.getElementById("myBtn");
var span = document.getElementsByClassName("mealExitBtn")[0];
var span1 = document.getElementsByClassName("exerciseExitBtn")[0];

//modal1
btn1.onclick = function () {
  modal1.classList.add("fade-in")
  modal1.style.display = "block";
}

span1.onclick = function () {
  modal1.style.display = "none";
}

window.onclick = function (event) {
  if (event.target == modal1) {
    modal1.style.display = "none";
  }
}


//modal
btn.onclick = function () {
  modal.classList.add("fade-in")
  modal.style.display = "block";
}

span.onclick = function () {
  modal.classList.add("fade-out")
  modal.style.display = "none";
}

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}


var cancelBtn = document.getElementById("cancelBtn")
cancelBtn.onclick = function () {
  modal.classList.add("fade-out")
  modal.style.display = "none";
}

var cancelBtn1 = document.getElementById("cancelBtn1")
cancelBtn1.onclick = function () {
  modal1.classList.add("fade-out")
  modal1.style.display = "none";
}


function getFoodApi(query) {
  return new Promise((resolve, reject) => {
    fetch('/api/nutritionix/getFood', {
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
      modal1.style.display = "none";
    })
    .catch(err => {
      console.log(err)
    })
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

getExerciseHistory(today).then(() => {
  getMeals(today).then(() => {
    updateCaloriesRemaining()
  })
})

function setCaloriesBurnt(exercises) {
  let total = 0;

  $.each(exercises, (key, exercise) => {
    total += exercise.burnt
  })

  $('#caloriesBurnt').text(Math.round(total))
  updateCaloriesRemaining()
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

function getMeals(date) {
  return new Promise((resolve, reject) => {
    $.get('/api/foods/meals/' + date.toISOString())
      .then(meals => {
        console.log(meals)
        renderMeals(meals)
        setCaloriesConsumed(meals)
        resolve(meals)
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
  })
}

function renderMeals(meals) {
  $('#mealPlannerTable').html('')
  // $('.noMealsFound').addClass('d-none')

  if (meals.length) {
    $('#mealPlannerTableContainer').removeClass('d-none')
    // $('#pieChart').removeClass('d-none')

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
        '<td>' + meal.servingSizeQty + " " + meal.servingSizeUnit + '</td>' +
        '</tr>'
      );
    })
  } else {
    // $('#mealPlannerTableContainer').addClass('d-none')
    // $('.noMealsFound').removeClass('d-none')
    // $('#pieChart').addClass('d-none')
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

$('#mealSelected').keypress(debounce(function () {
  var $this = $(this);

  getFoodApi($this.val()).then(data => {
    renderFoodOptions(data)
  })
}, 750));

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

$('#addMealBtn').on('click', function () {
  if (selectedFoodItem) {
    console.log(selectedFoodItem)
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
        modal.style.display = "none";
      })
      .catch(err => {
        console.log(err)
      })
  } else {
    alert("Meal not found. Please select a preset meal.")
  }
})

$('#mealDate').datetimepicker({
  format: 'MM/DD/YYYY'
});

$("#mealDate").val(moment(new Date()).format("MM/DD/YYYY"));

$("#mealDate").on("dp.change", function (e) {
  const date = new Date($(this).val())
  // $('#datepicker').data("DateTimePicker").datepicker('hide')
  getMeals(date)
});

$('.datetimepicker').datetimepicker({
  icons: {
    date: "tim-icons icon-calendar-60",
    up: "fa fa-chevron-up",
    down: "fa fa-chevron-down",
    previous: 'tim-icons icon-minimal-left',
    next: 'tim-icons icon-minimal-right',
    today: 'fa fa-screenshot',
    clear: 'fa fa-trash',
    close: 'fa fa-remove'
  }
});



