/*
 * File: assets\controllers\pswsetup_controller.js
 * Author: Peter Nagy <peter@antronin.consulting>
 * -----
 */
/* stimulusFetch: 'lazy' */
import { Controller } from "@hotwired/stimulus"
import { trans } from "@symfony/translation";

export default class extends Controller {
    static values = { setup: String }
    static targets = ['psw_setup_display'];

    connect() {
        this.choose = this._trans('choose');
        this.setup = JSON.parse(atob(this.setupValue));
        if (this.setup.content.lowercase.enabled) {
            this.minLowercase = parseInt(this.setup.content.lowercase.min);
            this.lowercasePattern = new RegExp('[' + this.setup.content.lowercase.pattern + ']{' + this.minLowercase + ',}', 'u');
        }
        if (this.setup.content.uppercase.enabled) {
            this.minUppercase = parseInt(this.setup.content.uppercase.min);
            this.uppercasePattern = new RegExp('[' + this.setup.content.uppercase.pattern + ']{' + this.minUppercase + ',}', 'u');
        }
        if (this.setup.content.number.enabled) {
            this.minNumber = parseInt(this.setup.content.number.min);
            this.numberPattern = new RegExp('[' + this.setup.content.number.pattern + ']{' + this.minNumber + ',}', 'u');
        }
        if (this.setup.content.special.enabled) {
            this.minSpecial = parseInt(this.setup.content.special.min);
            this.specialPattern = new RegExp('[' + this.setup.content.special.pattern + ']{' + this.minSpecial + ',}', 'u');
        }
        this.input = this.element.getElementsByTagName('input')[0];

    }

    calc() {
        this.targets.psw_setup_display.innerHTML = '';
        this.msgs = [];
        this._checkLength(this.setup.length.min, this.setup.length.max).forEach(el => this.msgs.push(el));
        this._checkPattern('lowercase');
        this._checkPattern('uppercase');
        this._checkPattern('number');
        this._checkPattern('special');
        if (this.msgs.length > 0) {
            let chooseMsg = document.createElement('p');
            chooseMsg.appendChild(document.createTextNode(this._trans('choose')));
            this.targets.psw_setup_display.appendChild(chooseMsg);
            let list = document.createElement('ul');
            this.msgs.forEach(el => list.appendChild(el));
            this.targets.psw_setup_display.appendChild(list);
        }
    }

    _successMsg(msg) {
        let el = document.createElement('li');
        el.classList.add('text-success');
        el.appendChild(document.createTextNode(msg));
        return el;
    }

    _errorMsg(msg) {
        let el = document.createElement('li');
        el.classList.add('text-danger');
        el.appendChild(document.createTextNode(msg));
        return el;
    }
    /**
     * Checks the length of the password against the given min and max values. If both are 0 or less, it returns null.
     * If the length is valid, it returns an array of translated success messages, otherwise it returns an array of translated error messages.
     *
     * @param integer min
     * @param integer max
     * @return null|array
     */
    _checkLength(min, max) {
        if (min <= 0 && max <= 0) {
            return;
        }

        let minMsg = 'min_length';
        let maxMsg = 'max_length';
        let res = [];

        if (min > 0) {
            msg = this._trans(minMsg, { min: min });
            if (this.input.value.length >= min) {
                res.push(this._successMsg(msg));
            } else {
                res.push(this._errorMsg(msg));
            }
        }
        if (max > 0) {
            msg = this._trans(maxMsg, { max: max });
            if (this.input.value.length <= max) {
                res.push(this._successMsg(msg));
            } else {
                res.push(this._errorMsg(msg));
            }
        }
        return res;
    }

    /**
     * Checks if the password meets the requirements for the specified pattern type.
     * The type parameter can be 'lowercase', 'uppercase', 'number' or 'special'.
     * If the pattern is not enabled in the setup, it returns null.
     * If the pattern is valid, it returns a translated success message, otherwise it returns a translated error message.
     *
     * @param string type
     * @return string
     */
    _checkPattern(type) {
        if (!this.setup.content[type].enabled) {
            return;
        }
        msg = this._trans('min_' + type, { min: this.setup.content[type].min });
        if (this[type + 'Pattern'].test(this.input.value)) {
            return this._successMsg(msg);
        } else {
            return this._errorMsg(msg);
        }
    }

    _trans(msg, params = {}, domain = 'messages', locale = null) {
        try {
            return trans(msg, params, domain, locale);
        }
        catch (e) {
            return msg;
        }
    }
}
