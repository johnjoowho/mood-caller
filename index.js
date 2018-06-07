function StorageException(message) {
  this.message = message;
  this.name = "StorageException";
}

function uuid() {
  var uuid = "", i, random;
  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;

    if (i == 8 || i == 12 || i == 16 || i == 20) {
      uuid += "-"
    }
    uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
  }
  return uuid;
}

const MoodEntries = { 
  create: function(mood, callback) { 
    console.log('Creating new mood'); 
    const item = {
      rating: mood.rating, 
      id: uuid(), 
      description: mood.description, 
      timestamp: Date.now(), 
    };
    this.items[item.id] = item; 
    callback(item); 
  },

  get: function(callback) { 
    console.log('Retrieving mood'); 
    callback(Object.keys(this.items).map(key => this.items[key])); 
  },

  delete: function(id) { 
    console.log('Deleting mood entry');
    delete this.items[id]; 
    callback(); 
  }, 

  update: function(updatedItem, callback) {
    console.log('Updating new mood'); 
    const {id} = updatedItem; 
    if (!(id in this.items)) { 
      throw StorageException(`Can't update item ${id} because it doesn't exist`)
    }
    this.items[updatedItem.id] = updateItem; 
    callback(updatedItem); 
  }
}

function createMoodEntries() { 
  const storage = Object.create(MoodEntries); 
  storage.items = {}; 
  return storage; 
}

const STORE = createMoodEntries(); 

function generateProfile(moods) {
  return `
    <section id="graph">
      <div class="graph-container"> 
        <p>placeholder</p>
      </div>
    </section>
    <section id="profile"> 
      <div class="info-container">
        <p>placeholder</p>
      </div>
      <div class="history container">
        <p>placeholder</p>
      </div>
    </section> 
    <button id="create-new-mood">click to log a new mood</button>
  `
}

function handleMoodSubmit(event) { 
  $('main').on('submit', '.new-mood-form', function(event) {
    event.preventDefault(); 
    const description = $('#mood-describe').val(); 
    const rating = $('input[name=mood]:checked').val(); 
    const mood = {rating, description}
    STORE.create(mood, generateSuccessPage); 
  })
}

function generateMoodInput() {
  return `
    <form class="new-mood-form">
      <label for="mood-description">Tell me what's up?</label>
      <input type="text" name="mood-description" id="mood-describe" placeholder="e.g., Just had bad coffee" required>

      <div class="rating-container">
        <div class="mood-choices">
          <input type="radio" name="mood" id="choice-1" value="1" required> 
          <label for="choice-1">I feel horrible pain/sickness</label>

          <input type="radio" name="mood" id="choice-2" value="2"> 
          <label for="choice-2">I feel down and out</label>

          <input type="radio" name="mood" id="choice-3" value="3"> 
          <label for="choice-3">I feel lethargic</label>

          <input type="radio" name="mood" id="choice-4" value="4"> 
          <label for="choice-4">I feel ok</label>

          <input type="radio" name="mood" id="choice-5" value="5"> 
          <label for="choice-5">I feel good</label>

          <input type="radio" name="mood" id="choice-6" value="6"> 
          <label for="choice-6">I feel like going out</label>

          <input type="radio" name="mood" id="choice-7" value="7"> 
          <label for="choice-7">I feel like I can leap for joy</label>
        </div>  
      </div> 
      <button type="submit" id="submit-new-mood">Add mood</button>  
    </form>
  `
}

function getMoodsFromApi(success, fail) { 
  STORE.get(success)
}

function generateSuccessPage(mood) { 
  return `
    <section id="success">
      <div class="succes-msg-container">
        <h2>New mood added</h2>
        <p>You've just added entry with rating: ${mood.rating} at time: ${mood.timestamp.toLocalDateString()}</p> 
      </div>
      <button id="go-to-profile" type="reset">Go to profile</button> 
    </section>
  `
}

function displaySuccess(moods) { 
  $('main').html(generateSuccessPage(moods));
} 

function handleShowNewMoodButton(event) {
  $('main').on('click', '#create-new-mood', function(event) {
    displayMoodField(); 
  });
}

//mood input field
function displayMoodField() { 
  $('main').html(generateMoodInput()); 
}

//login page or landing page -> has link to signup page  
function generateLoginPage() {
  return ` 
    <form class="login-form"> 
      <label for="username">Username</label> 
      <input type="text" id="login-username" name="username" placeholder="Username"> 
      <label for="password">Password</label> 
      <input type="password" id="login-password" name="password" placeholder="Password"> 
    <button type="submit" id="submit-login">SIGN IN</button> 
    </form> 
  `
} 

function displayLoginPage(); 

function handleLoginSubmit(event) {
  event.preventDefault(); 
  $('main').on('submit', '.login-form', function(event) {
    event.preventDefault(); 
    const username = $('#login-username').val(); 
    const password = $('#login-password').val(); 
    const user = {username, password};
    function validateLogin(username, password) { 
      console.log(); 
    }; 
  STORE.get(displayProfile); 
}); 

function displayProfile(moods) { 
  $('main').html(generateProfile(moods)); 
}
//
function handleShowLoginButton(event) {
  displayLoginPage(); 
} 

function handleLogoutSubmit(event);

function generateSignupPage() {
  return `
    singupform 
    login (needs even handler)
  `
} 

function displaySignupPage() {
  $('main').html(generateSignupPage());
} 

function handleSignupSubmit(event) { 

}

function setupEventHandlers() { 
  handleLoginSubmit(); 
  handleLogoutSubmit();
  handleSignupSubmit(); 
  handleShowNewMoodButton(); 
  handleMoodSubmit(); 
  handleShowLoginButton(); 
}

function setupUi() { 
  setupEventHandlers(); 
  displaySignupPage(); 
};

$(setupUi); 
