# Webhook Notification
Use Node.js and Ngrok to create a system notification service.

# Installation
1. Clone this repo

2. Open windows CMD or Powershell to the cloned directory

3. `npm install`

# How to Use
1. Run the app.

    ```
    npm run build [port #]
    ```
    
    or
    
    ```
    npm install
    node app.js [port #]
    ```
    
    port #: the port for the local server to run on.

2. For any webhook providers not already configured, edit the `webhookproviders.json` with a new provider.

      To find the event_type_name:
    
      1. go to [http://127.0.0.1:4040](http://127.0.0.1:4040)
        
      2. click on a request, click on headers, and locate the header event unique to your webhook provider. 
        
      3. Create a new json object in the list of event overrides for the provider
        
```
{
    "event_type_name": "{EXAMPLE_PROVIDER}",
    "provider_name": "Notification Title",
    "event_overrides": {
        "{SAMPLE_EVENT}": "Notification Text"
    }
} 
```

3. When you run the program, it will give you a new url. Create your webhooks with this URL.
