const notifier = require('node-notifier')
const ngrok = require('ngrok')
const fs = require('fs')
var express = require('express')
var app = express()

const args = process.argv.slice(2)
const port = args[0] || "2019"

const configurations = JSON.parse(fs.readFileSync('webhookproviders.json', 'utf-8'))


app.use(express.static(__dirname))
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS")
  res.header("Access-Control-Allow-Headers", "X-Requested-With, content-type")
  res.header("Access-Control-Allow-Credentials", true)
  next()
})

app.post('/', (req, res) => {
  let webhookProvider = 'error', message = 'error'

  configurations.forEach(configuration => {
    let headerValue = req.header(configuration.event_type_name)
    if (headerValue != undefined && headerValue != null && headerValue) {
      //set the provider to the one we have assigend for it
      webhookProvider = configuration.provider_name

      // get original message, see if we override it
      originalMessage = req.header(configuration.event_type_name)
      let override = configuration.event_overrides[originalMessage + ""]
      message = override ? override : originalMessage
    }
  })

  console.log('--Incoming event: ', webhookProvider, message);

  notifier.notify({
    title: webhookProvider,
    message: message
  });

  res.send('Received the notification')
});

app.listen(port, () => {
  console.log(`--Notification server listening on port ${port}`)
  console.log(`--Attempting to expose server on port ${port} to the internet using ngrok`)

  // expose port to internet with ngrok
  ngrok.connect({ addr: port }).then((url) => {
    console.log(`--ngrok connection succeeded`)
    console.log(`--Webhook POST's sent to the below URL will result in a notification`)
    console.log(`--${url}`)
  })
});





