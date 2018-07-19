const Airtable = require('airtable');
const { Plugin } = require('jovo-framework');

class AirtableFallbackLog extends Plugin {
    constructor(options) {
        super(options);
        this.base = new Airtable({apiKey: options.apiKey}).base(options.baseId);
        this.tableName = options.tableName;
    }
    init() {
        // Collect data of request in options object
        const { app } = this;
        let options = {}
        options.output = '';
        options.reprompt = '';
        app.on('request', (jovo) => {
            if (jovo.getIntentName() === 'Default Fallback Intent') {
                options.userId = jovo.getUserId();
                options.locale = jovo.getLocale();
                options.state = jovo.getState();
                options.rawText = jovo.platform.getRawText();
                options.timestamp = jovo.getTimestamp();
                sendToAirtable.call(this, options);
            }
        });
        // Log speech & reprompt of every request to use, if Default Fallback Intent gets triggered
        app.on('ask', (jovo, speech, repromptSpeech) => {
            options.output = speech;
            options.reprompt = repromptSpeech;
        });
        app.on('tell', (jovo, speech) => {
            options.output = speech;
        })
    }
}
/**
 * POSTs Default Fallback Intent data to Airtable
 * @param {*} options request data, which will be sent to airtable
 */
function sendToAirtable(options) {
    this.base(this.tableName).create({
        UserId: options.userId,
        Timestamp: options.timestamp,
        Locale: options.locale,
        State: options.state,
        Speech: options.output,
        Reprompt: options.reprompt,
        Utterance: options.rawText
    });
}

module.exports = AirtableFallbackLog;
