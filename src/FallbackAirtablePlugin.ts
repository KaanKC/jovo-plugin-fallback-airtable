import { PluginConfig, Plugin, BaseApp, HandleRequest } from 'jovo-core';
import request = require('request');

export interface Config extends PluginConfig {
    apiKey: string,
    baseId: string,
    tableName: string
}


export class FallbackAirtablePlugin implements Plugin {

    // default config
    config: Config = {
        apiKey: '',
        baseId: '',
        tableName: ''
    };

    speech?: string;
    reprompt?: string;

    constructor() {
        this.speech = '';
        this.reprompt = '';
    }

    /**
     * Hooks up plugin to the "platform.nlu" & "response" middleware
     * @param app 
     */
    install(app: BaseApp) {
        app.middleware('platform.nlu')!.use(this.log.bind(this));
        app.middleware('response')!.use(this.saveResponse.bind(this));
    }

    uninstall(app: BaseApp){

    }

    saveResponse(handleRequest: HandleRequest): void {
        this.speech = handleRequest.jovo!.$response!.getSpeech();
        this.reprompt = handleRequest.jovo!.$response!.getReprompt();
    }
    
    /**
     * Will be called every time an error occurs
     * @param handleRequest contains current app?, host?, jovo? and error? instance
     */
    log(handleRequest: HandleRequest): void {
        if (!handleRequest.jovo) {
            return;
        }
        if (handleRequest.jovo.$request!.getIntentName() === 'Default Fallback Intent') {
            const log = this.createLog(handleRequest);
            this.sendRequest(log);
        }
    }

    /**
     * Creates message for Slack
     * @param handleRequest 
     */
    createLog(handleRequest: HandleRequest): object {
        const log = {
            fields: {
                'UserId': handleRequest.jovo!.$user!.getId(),
                'Timestamp': handleRequest.jovo!.$request!.getTimestamp(),
                'Locale': handleRequest.jovo!.$request!.getLocale(),
                'State': handleRequest.jovo!.getState(),
                'Speech': this.speech!.replace(/<\/?speak\/?>/g, ''),
                'Reprompt': this.reprompt!.replace(/<\/?speak\/?>/g, ''),
                'Utterance': handleRequest.jovo!.getRawText(),
            }
        }
        return log;
    }

    /**
     * Sends out the request to the Slack API
     * @param log message, which will be sent to Slack
     */
    sendRequest(log: object): void {
        const logAsString = JSON.stringify(log);
        const options = {
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(logAsString),
                'Authorization': `Bearer ${this.config.apiKey}`
              },
            uri: `https://api.airtable.com/v0/${this.config.baseId}/Table%201`,
            body: logAsString,
            method: 'POST'
        }
        request(options, function (err, res, body) {
            if (err) {
                console.error('Error while logging Default Fallback Intent to Airtable', err);
            }
        })

    }    
}