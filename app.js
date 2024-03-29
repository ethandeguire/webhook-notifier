const notifier = require('node-notifier')
const ngrok = require('ngrok')
const fs = require('fs')
const axios = require('axios');
var express = require('express')
const os = require('os')
var app = express()

const args = process.argv.slice(2)
args[0] = args[0] == 0 ? 2019 : args[0]
const port = args[0] || 2019
if (port == 'default') port == 2019
const NotifyUsername = args[1] || null
const NotifyPassword = args[2] || null


const configurations = JSON.parse(fs.readFileSync('webhookproviders.json', 'utf-8'))


app.use(express.static(__dirname))
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*")
  res.header("Access-Control-Allow-Headers", "*")
  res.header("Access-Control-Allow-Credentials", true)
  next()
})

app.post('/', (req, res) => {
  let webhookProvider = 'error', message = 'error'

  let sendNotification = true

  configurations.forEach(configuration => {
    let headerValue = req.header(configuration.event_type_name)
    if (headerValue != undefined && headerValue != null && headerValue) {

      //set the provider to the one we have assigend for it
      webhookProvider = configuration.provider_name

      // get original message, see if we override it
      originalMessage = req.header(configuration.event_type_name)
      let override = configuration.event_overrides[originalMessage + ""]

      // if the override is blank we dont want to send a notif
      if (override === '') sendNotification = false

      // 
      message = override ? override : originalMessage
    }
  })

  if (webhookProvider === 'error' && message === 'error') sendNotification = false

  console.log(`--Incoming event: '${webhookProvider}': '${message}' - ${sendNotification ? 'displaying' : 'not displaying'}`);

  if (sendNotification) {
    notifier.notify({
      title: webhookProvider,
      message: message
    })
  }

  res.send(JSON.stringify({
    data: {
      client_info: {
        computer_name: os.hostname(),
        os: os.platform()
      }
    }
  }))
})

app.listen(port, () => {
  console.log(`--Notification server listening on port ${port}`)
  console.log(`--Attempting to expose server on port ${port} to the internet using ngrok`)

  // expose port to internet with ngrok
  ngrok.connect({ addr: port }).then((url) => {
    console.log(`--ngrok connection succeeded`)
    console.log(`--Webhook POST's sent to the below URL will result in a notification`)
    console.log(`--${url}`)

    // send data to the users account
    axios.post('https://notifyme.netlify.com/.netlify/functions/update-url-in-db', {
      data: {
        username: NotifyUsername,
        password: NotifyPassword,
        url: url,
        computer_name: os.hostname()
      }
    })
      .then((response) => {
        console.log(`--Url updated in NotifyMe: ${NotifyUsername} - ${url}`);
      })
      .catch((error) => {
        console.log(`** Url failed to update in NotifyMe: ${error.message}: ${error.response.data}`);
        console.log(`** You can still use the url above to recieve webhooks, but your static url will not be active`);
      });

  })
});





