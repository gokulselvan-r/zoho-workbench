// 3rd party dependencies
const path = require('path'),
  express = require('express'),
  session = require('cookie-session'),
	https = require('https'),
	fs = require('fs'),
  FormData = require('form-data'),
	axios = require('axios'),
  qs = require('qs'),
	nJwt = require('njwt'),
  cors = require('cors');
// const { userData } = require('../sampleData');

// Load and check config
require('dotenv').config();
// if (!( process.env.consumerKey && process.env.consumerSecret && process.env.callbackUrl && process.env.sessionSecretKey)) {
//   console.error('Cannot start app: missing mandatory configuration. Check your .env file.');
//   process.exit(-1);
// }

// Setup HTTP server
const app = express();
const port = process.env.PORT || 8080;
app.set('port', port);
app.set('trust proxy', 1);

// Enable server-side sessions
app.use(
  session({
    secret: process.env.sessionSecretKey,
    cookie: { secure: process.env.isHttps === 'true' },
    resave: false,
    saveUninitialized: false
  })
);
app.use(cors());
// Serve HTML pages under root directory
app.use('/', express.static(path.join(__dirname, '../public/')));

/**
 *  Attemps to retrieves the server session.
 *  If there is no session, redirects with HTTP 401 and an error message
 */
function getSession(request, response) {
  const session = request.session;
  if (!session.zohoAuth) {
    response.status(401).send('No active session');
    return null;
  }
  return session;
}

/**
 * Login endpoint
 */
app.get('/auth/login', (request, response) => {
  // Redirect to Salesforce login/authorization page
  response.redirect(`https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.modules.ALL,ZohoCRM.settings.ALL,ZohoCRM.users.ALL,ZohoCRM.org.ALL,ZohoCRM.bulk.ALL,ZohoCRM.coql.READ&client_id=${process.env.consumerKey}&response_type=code&access_type=online&redirect_uri=${process.env.callbackUrl}`);
});

/**
 * Login callback endpoint (only called by Salesforce)
 */
app.get('/auth/callback', (request, response) => {
  var data = new FormData();

    data.append("grant_type", "authorization_code");
    data.append("client_id", process.env.consumerKey);
    data.append("client_secret", process.env.consumerSecret);
    data.append("redirect_uri", process.env.callbackUrl);
    data.append(
      "code",
      request.query.code
    );

    var config = {
      method: 'post',
      url: 'https://accounts.zoho.com/oauth/v2/token',
      headers: { 
        ...data.getHeaders()
      },
      data : data
    };
    
    axios(config)
    .then(function (zohoResponse) {
      request.session.zohoAuth = {
        access_token: zohoResponse.data.access_token,
      };
      return response.redirect('/index.html')

    })
    .catch(function (error) {
      console.log('Zoho authorization error: ' + JSON.stringify(error));
      response.status(500).json(error);
      return;
    });
});

/**
 * Logout endpoint
 */
app.get('/auth/logout', (request, response) => {
  var session = getSession(request, response);
  if (session == null) return;
  session = null
  // Redirect to app main page
  return response.redirect('/index.html');
});

/**
 * Endpoint for retrieving currently connected user
 */
app.get('/auth/whoami', (request, response) => {
  const session = getSession(request, response);
  if (session == null) {
    return;
  }
  else {
    return response.send(true)
  }
});

/**
 * Endpoint for performing a SOQL query on Salesforce
**/

app.get('/query', (request, response) => {
  const session = getSession(request, response);
  if (session == null) {
    return;
  }

  const query = request.query.q;
  if (!query) {
    response.status(400).send('Missing query parameter.');
    return;
  }
  axios.post('https://www.zohoapis.com/crm/v2/coql', {
    "select_query" : query
   },{
    headers:{
      'Authorization' : `Zoho-oauthtoken ${session.zohoAuth.access_token}`
    }
  }).then(objects => {
    response.json(objects.data)
  }).catch(err=>{
    response.status(500).json(err.response.data);
  })
});


app.post('/get', express.json(), async (request, response) => {
  const session = getSession(request, response);
  if (session == null) {
    return;
  }
  var { object, id } = request.body
  var url = `https://www.zohoapis.com/crm/v2/${id ? object+'/'+id : object}` 
  axios.get(url, {
    headers:{
      'Authorization' : `Bearer ${session.zohoAuth.access_token}`
    }
  }).then(objects => {
    response.json(objects.data)
  }).catch(err=>{
    response.json(err.response.data)
  })
})

app.post('/post', express.json(), async (request, response) => {
  const session = getSession(request, response);
  if (session == null) {
    return;
  }
  var { object, data } = request.body;
  var url = `https://www.zohoapis.com/crm/v2/${object}/upsert` 
  axios.post(url, data ,{
    headers:{
      'Authorization' : `Bearer ${session.zohoAuth.access_token}`
    }
  }).then(objects => {
    response.json(objects.data)
  }).catch(err=>{
    response.json(err.response.data)
  })

});

app.post('/put', express.json(), async (request, response) => {
  const session = getSession(request, response);
  if (session == null) {
    return;
  }
  var { object, data, id } = request.body
  if (id) {
    var url = `https://www.zohoapis.com/crm/v2/${object}/${id}` 
    axios.put(url, data, {
      headers:{
        'Authorization' : `Bearer ${session.zohoAuth.access_token}`
      }
    }).then(objects => {
      response.json(objects.data)
    }).catch(err=>{
      response.json(err.response.data)
    })
  
  } else {
    res.json({
      "type" : "Missing id",
      "error" : "Object ID is mandatory to Update."
    });
  }
  
})



app.listen(app.get('port'), () => {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
