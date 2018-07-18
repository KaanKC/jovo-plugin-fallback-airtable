![Example](./_images/example.png)



This plugin logs data about incoming Default Fallback Intents to an Airtable spreadsheet. Tracked data is: **UserID, Locale, State, Speech, Reprompt, Utterance (raw text)**.

# Installation

First of all you have to sign up to [Airtable](https://airtable.com/) and create a **Base**. You can use the 
```sh
$ npm install jovo-plugin-email-error --save
```
In your Jovo project:
```javascript
const EmailError = require('jovo-plugin-email-error');

// Required:
let options = {
    apiKey: 'apiKey',
    baseId: 'baseId',
    tableName: 'tableName'
}

app.register('EmailError', new EmailError(options));
```

# License

MITs