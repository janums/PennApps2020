// Client ID and API key from the Developer Console
var CLIENT_ID =
  "207523860993-qv5bri01sch1u6obs6b139mnirqmm6ru.apps.googleusercontent.com";
var API_KEY = "AIzaSyBIGJEGK-AG-6D2GrwB4CA8UmytFSDhSb4";

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

var signoutButton = document.getElementById("signout_button");

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    })
    .then(
      function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        signoutButton.onclick = handleSignoutClick;
      },
      function (error) {
        appendPre(JSON.stringify(error, null, 2));
      }
    );
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    signoutButton.style.display = "block";
    listUpcomingEvents();
    listPlaylists();
  } else {
    signoutButton.style.display = "none";
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
  location.replace("index.html");
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendEvents(message, index) {
  // div is where content will go
  var div = document.getElementById("content");
  // inner div is card to contain event text
  var innerDiv = document.createElement("div");
  innerDiv.className = "event-card";
  // text of the event
  var text = document.createElement("h4");
  var textContent = document.createTextNode(message);
  text.appendChild(textContent);
  // have the even be identifiable
  text.setAttribute("id", `event${index}`);
  innerDiv.appendChild(text);
  div.appendChild(innerDiv);
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
function listUpcomingEvents() {
  gapi.client.calendar.events
    .list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 5,
      orderBy: "startTime",
    })
    .then(function (response) {
      var events = response.result.items;

      if (events.length > 0) {
        for (i = 0; i < events.length; i++) {
          var event = events[i];
          var when = event.start.dateTime;
          if (!when) {
            when = event.start.date;
          }
          // keep only the date
          when = when.substring(0, 10);
          appendEvents(event.summary + "\n" + when, i);
        }
      } else {
        appendEvents("No upcoming events found.", -1);
      }
    });
}

function listPlaylists() {
  if (document.getElementById("event0") !== null) {
    var playlistDiv = document.getElementById("playlists");
    for (i = 0; i < 5; i++) {
      var eventId = `event${i}`;
      var currEvent = document.getElementById(eventId).innerText;
      // inner div is card to contain event text
      var innerDiv = document.createElement("div");
      innerDiv.className = "event-card";
      // text of the event
      var text = document.createElement("h4");
      var textContent = document.createTextNode(currEvent);
      text.appendChild(textContent);
      innerDiv.appendChild(text);
      playlistDiv.appendChild(innerDiv);
    }
  } else {
    // check again for event0
    setTimeout(function () {
      listPlaylists();
    }, 300);
  }
}
