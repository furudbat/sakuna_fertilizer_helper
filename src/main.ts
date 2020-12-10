import './site'
import { Application } from "./application";
import { LoggerManager } from 'typescript-logger';

$(function () {
    if (process.env.NODE_ENV !== "development") {
        LoggerManager.setProductionMode();
    }
    var app = new Application();
    app.init();
});