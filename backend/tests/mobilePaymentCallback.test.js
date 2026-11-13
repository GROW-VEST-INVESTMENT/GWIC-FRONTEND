const assert = require('node:assert/strict');
const { test } = require('node:test');
const { isAllowedMobilePaymentCallback } = require('../services/mobilePaymentCallback');

test('mobile payment callback accepts the app return scheme and Expo development URLs', () => {
  for (const callbackUrl of [
    'gwic://deposit-return',
    'exp://192.168.1.20:8081/--/deposit-return',
    'exp://172.20.10.9:8083/--/deposit-return',
    'exp://10.0.2.2:8081/--/deposit-return',
    'exp://demo.exp.direct/--/deposit-return',
  ]) {
    assert.equal(isAllowedMobilePaymentCallback(callbackUrl), true, callbackUrl);
  }
});

test('mobile payment callback rejects arbitrary origins and malformed return paths', () => {
  for (const callbackUrl of [
    'https://attacker.example/return',
    'gwic://attacker.example/return',
    'exp://attacker.example/--/deposit-return',
    'exp://192.168.1.20:8081/--/other-route',
    'exp://172.50.10.9:8081/--/deposit-return',
    'gwic://deposit-return?redirect=https://attacker.example',
    'not a URL',
  ]) {
    assert.equal(isAllowedMobilePaymentCallback(callbackUrl), false, callbackUrl);
  }
});
