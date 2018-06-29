const URL="/api";
const signupUrl=`${URL}/users`;
const loginUrl=`${URL}/auth/login`;
const entriesUrl=`${URL}/entries`;
let user = null; 

function addNewUser(newUser, callback) { 
  const settings = {
    url: signupUrl,
    data: JSON.stringify({
      username: newUser.username, 
      password: newUser.password
    }),
    dataType: 'json',
    contentType: 'application/json',
    type: 'POST',
    success: callback,
    error: function(error) {
      alert(`${error.responseJSON.location}: ${error.responseJSON.message}`); 
      console.dir(error); 
    }
  };
  $.ajax(settings);
}

function getMoodsFromApi(success, id = null) { 
  const settings = {
    url: `${entriesUrl}${id? `/${id}` : ''}`,
    dataType: 'json',
    type: 'GET',
    headers: {Authorization: `Bearer ${user}`},
    success: success,
    error: function(error) {
      alert(`Something went wrong: ${error.responseText}`); 
      console.dir(error); 
    }
  };
  $.ajax(settings);
}


function deleteItem(itemId, callback) {
  const settings = {
    url: `${entriesUrl}/${itemId}`,
    dataType: 'json',
    type: 'DELETE',
    success: callback,
    error: function(error) {
      alert(`Something went wrong: ${error.responseText}`); 
      console.dir(error); 
    }
  };
  $.ajax(settings); 
}

function createMoodEntry(item, callback) { 
  const settings = {
    headers: {'Authorization': `Bearer ${user}`},
    url: `${entriesUrl}`,
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify({
      rating: item.rating,
      description: item.description
    }), 
    type: 'POST',
    success: callback,
    error: function(error) {
      alert(`Something went wrong: ${error.responseText}`); 
      console.dir(error); 
    }
  };
  console.dir(item);
  $.ajax(settings); 
}

function updateItem(itemId, callback) {
  const settings = {
    url: `${entriesUrl}/${itemId}`,
    dataType: 'json',
    type: 'PUT',
    success: callback,
    error: function(error) {
      alert(`Something went wrong: ${error.responseText}`); 
      console.dir(error); 
    }
  };
  $.ajax(settings); 
}

function validateLogin(credentials) { 
  const settings = {
    url: loginUrl,
    data: JSON.stringify({
      username: credentials.username, 
      password: credentials.password
    }),
    dataType: 'json',
    contentType: 'application/json',
    type: 'POST',
    success: function(data) {
      user=data.authToken; 
      displayLandingPage(); 
    },
    error: function(error) {
      alert(`Something went wrong: ${error.responseText}`); 
      console.dir(error); 
    }
  };
  $.ajax(settings);
}; 

function logout() { 
  user = null; 
  displayLandingPage(); 
}

function handleShowLoginButton() {
  $('main').on('click', '#showLoginButton', function(event) { 

    displayLoginPage();
  });  
} 

function handleEdit() {
  $('main').on('click', '#edit-entry', function(event) {
    const thisId = $(event.currentTarget).data('id');

    updateItem(thisId, displayProfilePage); 
  });
}

function handleDelete() {
    $('body').on('click', '#delete-entry', function(event) { 
    const thisId = $(event.currentTarget).data('id'); 
    
    deleteItem(thisId, displayProfilePage); 
  });
}

function handleSignupSubmit() { 
  $('main').on('submit', '.signup-form', function(event) { 
    event.preventDefault(); 
    const username = $('#newusername').val(); 
    const password = $('#newpassword').val(); 
    const newUser = {username, password}; 
    addNewUser(newUser, displayLandingPage); 
  });
}

function handleMoodSubmit() { 
  $('main').on('submit', '#new-mood-form', function(event) {
    event.preventDefault(); 
    const description = $('#mood-describe').val(); 
    const rating = $('input[name=mood]:checked').val(); 
    const mood = {rating, description};
    const thisId = $(event.currentTarget).data('id') || null; 
    const thisCreated = $(event.currentTarget).data('created') || null; 
    if (thisId && thisCreated) {
      mood.id = thisId; 
      mood.created = thisCreated; 
      updateItem(mood, displayProfilePage); 
    } else {createMoodEntry(mood, displaySuccessPage);} 
  });
}

function handleGotoProfileSubmit() {
  $('main').on('click', '#go-to-profile', function(event) {
    getMoodsFromApi(displayProfilePage);
  }); 
}

function handleShowNewMoodButton() {
  $('main').on('click', '#create-new-mood', function(event) {
    displayMoodField(); 
  });
}

function handleLoginSubmit() {
  $('main').on('submit', '.login-form', function(event) {
    event.preventDefault(); 
    const username = $('#login-username').val(); 
    const password = $('#login-password').val(); 
    const credentials = {username, password};
    validateLogin(credentials); 
    
  }); 
}

function handleLogoutSubmit() {
  $('main').on('click', '#log-out', function(event) { 
    logout(); 
  });
}

function displaySuccessPage(mood) { 
  $('main').html(generateSuccessPage(mood));
} 

//mood input field
function displayMoodField(mood = null) { 
  $('main').html(generateMoodInput(mood)); 
}

function displayLoginPage() {
  $('main').html(generateLoginPage()); 
} 



function displayProfilePage(moods) { 
  $('main').html(generateProfilePage(moods)); 
  if (moods.length > 0) {
  generateGraph(moods); 
  } 
}

function displaySignupPage() {
  $('main').html(generateSignupPage());
} 

//decides which page to start with
function displayLandingPage() {
  if (user) { 
    getMoodsFromApi(displayProfilePage); 
  } else {
    displaySignupPage(); 
  }
}

function sortByCreated(firstDate, secondDate) {
  return firstDate > secondDate ? -1: firstDate < secondDate ? 1: 0
}

function getMostRecent(moods, count=7) { 
  return moods.sort(sortByCreated).slice(0, count); 
}

function generateGraph(moods) {
  const ctx = $('#graph-chart')[0].getContext('2d');
  const options = {year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'};
  const chartData = {
    type: 'line', 
    data: {
      
      labels: moods.map(function(mood) {
        const created = new Date(mood.created); 
        return created.toLocaleDateString('en-US', options)
      }),

      datasets: [{
        label: 'Rating', 
        data: moods.map(function(mood) {
          return mood.rating
        })
      }],
    },

    backgroundColor: [
      
    ],

    options: {
      layout: {
        padding: {
          left: 50,
          right: 50,
          top: 50, 
          bottom: 50
        }
      },

      events: ['click'], 

      scales: {
          yAxes: [{
              ticks: {
                  beginAtZero:true
              }
          }]
        }
      }
    }

  return new Chart (ctx, chartData); 
}


function generateProfilePage(moods) {
  const mostRecent = getMostRecent(moods); 

  const buttonHtml = `
    <div id="buttonhtml">
      <button id="create-new-mood">click to log a new mood</button>
      <button id="log-out">log out</button> 
    </div>
  ` 
  const emptyHtml = `
    <div id="emptyhtml">
      <p class="empty-message">Sorry, there are no entries</p> 
    </div> 
  `

  const graphHtml = `
  <section id="graph">
  <div class="graph-container"> 
    <canvas id="graph-chart"> </canvas> 
  </div>
</section>
  `
  const options = {weekday:'long', year:'numeric', month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit'};

  const profileHtml = `
    <section id="profile"> 
      <h2>Your most recent entries</h2> 
        <ol class="history-container">
          ${mostRecent.map(function(recentItem) {
            const created = new Date(recentItem.created); 
            return `
              <li>
                <ul class="mood-entry">
                  <li>Date: ${created.toLocaleDateString('en-US', options)}</li>
                  <li>Your mood was: ${recentItem.rating}</li>
                  <li>Entry: ${recentItem.description}</li>
                  <button data-id="${recentItem.id}" id="delete-entry">Delete</button>
                  <button data-id="${recentItem.id}" id="edit-entry">Edit</button>
                </ul>
              </li>
            `
          }).join('')
          }
        </ol>
    </section> 
  `

  return `
    ${moods.length<1 ? emptyHtml: `${graphHtml} 
      ${profileHtml}`
    }
  
    ${buttonHtml}
  `
}

function generateMoodInput(mood = null) {
  return `
    <form id="new-mood-form" ${mood ? `data-id="${mood.id}" data-created="${mood.created}"` : ''}>
        <fieldset> 
          <legend>Mood Entry Form</legend> 
            <label for="mood-description">Tell me what's up?</label>
            </br> 
            <input type="text" name="mood-description" ${mood ? `value="${mood.description}"` : ''} id="mood-describe" placeholder="e.g., Just had bad coffee" required>

            <div class="rating-container">
              <div class="mood-choices">
                <input type="radio" name="mood" id="choice-1" class="choices" value="1" required ${mood ? mood.rating == 1? 'checked' :'' : ''}> 
                <label for="choice-1">I feel horrible pain/sickness</label>
                </br> 
                <input type="radio" name="mood" id="choice-2" class="choices" value="2" ${mood ? mood.rating == 2? 'checked' :'' : ''}> 
                <label for="choice-2">I feel down and out</label>
                </br>
                <input type="radio" name="mood" id="choice-3" class="choices" value="3" ${mood ? mood.rating == 3? 'checked' :'' : ''}> 
                <label for="choice-3">I feel lethargic</label>
                </br>       
                <input type="radio" name="mood" id="choice-4" class="choices" value="4" ${mood ? mood.rating == 4? 'checked' :'' : ''}> 
                <label for="choice-4">I feel ok</label>
                </br> 
                <input type="radio" name="mood" id="choice-5" class="choices" value="5" ${mood ? mood.rating == 5? 'checked' :'' : ''}> 
                <label for="choice-5">I feel good</label>
                </br>
                <input type="radio" name="mood" id="choice-6" class="choices" value="6" ${mood ? mood.rating == 6? 'checked' :'' : ''}> 
                <label for="choice-6">I feel like going out</label>
                </br>
                <input type="radio" name="mood" id="choice-7" class="choices" value="7" ${mood ? mood.rating == 7? 'checked' :'' : ''}> 
                <label for="choice-7">I feel like I can leap for joy</label>
              </div>  
            </div> 
        </fieldset> 
      <button type="submit" id="submit-new-mood">${mood ? 'Edit' : 'Add'} mood</button>  
    </form>
  `
}

//landing page - has link to signin page 
function generateSignupPage() {
  return `
      <h1 class="welcome-message">Welcome Back to the Original Mood-Caller</h1>
      <button type="button" id="showLoginButton" class="button">Login</button> 
      <form class="signup-form"> 
        <fieldset class="signup-fieldset"> 
          <legend>Sign Up</legend> 
            <label for="usrname">Username</label> 
            <input type="text" placeholder="Enter email" name="usrname" id="newusername" required> 
            </br>
            <label for="passwrd">Password</label> 
            <input type="text" placeholder="Enter password" name="passwrd" id="newpassword" required>
            </br> 
            <button type="submit" id="register-user" class="button">REGISTER</button> 
        </fieldset>       
      </form> 
  `
} 

//login page linked from LANDING page 
function generateLoginPage() {
  return ` 
    <form class="login-form"> 
      <label for="username">Username</label> 
      <input type="text" id="login-username" name="username" placeholder="Username" required> 
      <label for="password">Password</label> 
      <input type="password" id="login-password" name="password" placeholder="Password" required> 
    <button type="submit" id="submit-login">SIGN IN</button> 
    </form> 
  `
} 

function generateSuccessPage(mood) { 
  const options = {weekday:'long', year:'numeric', month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit'}; 
  const created = new Date(mood.created); 
  return `
    <section id="success">
      <div class="succes-msg-container">
        <h2>New mood added</h2>
        <p>You've just added entry with rating: ${mood.rating} at time: ${created.toLocaleDateString('en-US', options)}</p> 
      </div>
      <button id="go-to-profile" type="button">Go to profile</button> 
    </section>
  `
}





function setupEventHandlers() { 
  handleLoginSubmit(); 
  handleLogoutSubmit();
  handleSignupSubmit(); 
  handleGotoProfileSubmit(); 
  handleShowNewMoodButton(); 
  handleMoodSubmit(); 
  handleShowLoginButton(); 
  handleDelete(); 
  handleEdit(); 
}

function setupUi() { 
  setupEventHandlers();
  displayLandingPage(); 
}

$(setupUi);  
