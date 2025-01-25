"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var dotenv_1 = require("dotenv");
// Initialize dotenv for environment variables
dotenv_1.default.config();
// Helper function to simulate random failure
var randomFail = function () {
    if (Math.random() < 0.5) {
        throw new Error("Random failure occurred");
    }
};
var bangladeshiPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
// Middleware to validate SMS request body
var validateSmsBody = function (req, res, next) {
    var _a = req.body, phone = _a.phone, text = _a.text;
    if (!phone || !bangladeshiPhoneRegex.test(phone)) {
        return res.status(400).json({ error: "Invalid or missing phone number" });
    }
    if (!text || typeof text !== "string" || text.trim().length === 0) {
        return res.status(400).json({ error: "Invalid or missing text" });
    }
    return next();
};
// Middleware to validate Email request body
var validateEmailBody = function (req, res, next) {
    var _a = req.body, subject = _a.subject, body = _a.body, recipients = _a.recipients;
    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
        return res.status(400).json({ error: "Invalid or missing subject" });
    }
    if (!body || typeof body !== "string" || body.trim().length === 0) {
        return res.status(400).json({ error: "Invalid or missing body" });
    }
    if (!Array.isArray(recipients) || recipients.length === 0) {
        return res
            .status(400)
            .json({ error: "Invalid or missing recipients list" });
    }
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (var _i = 0, recipients_1 = recipients; _i < recipients_1.length; _i++) {
        var email = recipients_1[_i];
        if (!emailRegex.test(email)) {
            return res
                .status(400)
                .json({ error: "Invalid email in recipients: ".concat(email) });
        }
    }
    return next();
};
function validateBody(type) {
    if (type === "sms") {
        return validateSmsBody;
    }
    if (type === "email") {
        return validateEmailBody;
    }
}
function registerApi(app, type, index) {
    // SMS APIs
    app.post("/api/".concat(type, "/provider").concat(index), validateBody(type), function (req, res) {
        try {
            randomFail();
            console.log(new Date().toISOString(), "Sending ".concat(type, " via Provider ").concat(index, ":"), req.body);
            res.status(200).json({
                message: "".concat(type.toUpperCase(), " sent via Provider ").concat(index),
            });
        }
        catch (error) {
            res.status(500).json({
                error: "Failed to send ".concat(type, " via Provider ").concat(index),
            });
        }
    });
}
var _loop_1 = function (index) {
    // Create an instance of an Express app
    var smsApp = (0, express_1.default)();
    var smsPort = process.env["PORT_SMS_".concat(index)] || 8070 + index;
    var emailApp = (0, express_1.default)();
    var emailPort = process.env["PORT_EMAIL_".concat(index)] || 8090 + index;
    registerApi(smsApp, "sms", index);
    registerApi(emailApp, "email", index);
    smsApp.listen(smsPort, function () {
        console.log("SMS Provider ".concat(index, " running on port ").concat(smsPort));
    });
    emailApp.listen(emailPort, function () {
        console.log("Email Provider ".concat(index, " running on port ").concat(emailPort));
    });
};
for (var index = 1; index < 4; index++) {
    _loop_1(index);
}
