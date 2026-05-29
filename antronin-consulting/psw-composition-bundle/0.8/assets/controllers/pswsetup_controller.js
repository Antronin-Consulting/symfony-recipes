/*
 * File: assets\controllers\pswsetup_controller.js
 * Author: Peter Nagy <peter@antronin.consulting>
 * -----
 */
/* stimulusFetch: 'lazy' */
import { Controller } from "@hotwired/stimulus"
import { trans } from "assets/translator.js";

export default class extends Controller {
    static values = { setup: String }
    static targets = ['psw_setup_display'];

    connect() {
        this.choose = trans('profile.password.choose');
        this.setup = JSON.parse(atob(this.setupValue));
        if (this.setup.contents.lowercase.enabled) {
            this.minLowercase = parseInt(this.setup.contents.lowercase.min);
            this.lowercasePattern = new RegExp('[' + this.setup.contents.lowercase.pattern + ']{' + this.minLowercase + ',}', 'u');
        }
        if (this.setup.contents.uppercase.enabled) {
            this.minUppercase = parseInt(this.setup.contents.uppercase.min);
            this.uppercasePattern = new RegExp('[' + this.setup.contents.uppercase.pattern + ']{' + this.minUppercase + ',}', 'u');
        }
        if (this.setup.contents.number.enabled) {
            this.minNumber = parseInt(this.setup.contents.number.min);
            this.numberPattern = new RegExp('[' + this.setup.contents.number.pattern + ']{' + this.minNumber + ',}', 'u');
        }
        if (this.setup.contents.special.enabled) {
            this.minSpecial = parseInt(this.setup.contents.special.min);
            this.specialPattern = new RegExp('[' + RegExp.escape(this.setup.contents.special.pattern) + ']{' + this.minSpecial + ',}', 'u');
        }
        this.input = this.element.getElementsByTagName('input')[0];

    }

    calc() {
        this.psw_setup_displayTarget.innerHTML = '';
        this.msgs = [];
        this._checkLength(this.setup.length.min, this.setup.length.max).forEach(el => this.msgs.push(el));
        this.msgs.push(this._checkPattern('lowercase'));
        this.msgs.push(this._checkPattern('uppercase'));
        this.msgs.push(this._checkPattern('number'));
        this.msgs.push(this._checkPattern('special'));
        if (this.msgs.length > 0) {
            let chooseMsg = document.createElement('p');
            chooseMsg.classList.add('text--color-dark-grey', 'text--size-18', 'text--align-left');
            chooseMsg.style.paddingLeft = '60px';
            chooseMsg.appendChild(document.createTextNode(this.choose));
            this.psw_setup_displayTarget.appendChild(chooseMsg);
            let list = document.createElement('ul');
            list.classList.add('text--color-dark-grey', 'text--size-16', 'text--align-left');
            list.style.listStyle = 'circle';
            list.style.paddingLeft = '100px';
            this.msgs.forEach(el => list.appendChild(el));
            this.psw_setup_displayTarget.appendChild(list);
        }
    }

    _successMsg(msg) {
        let el = document.createElement('li');
        el.appendChild(document.createTextNode(msg));
        return el;
    }

    _errorMsg(msg) {
        let el = document.createElement('li');
        let b = document.createElement('b');
        b.appendChild(document.createTextNode(msg));
        el.appendChild(b);
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

        let minMsg = 'profile.password.min_length';
        let maxMsg = 'profile.password.max_length';
        let res = [];
        let msg = '';

        if (min > 0) {
            msg = trans(minMsg, { min: min });
            if (this.input.value.length >= min) {
                res.push(this._successMsg(msg));
            } else {
                res.push(this._errorMsg(msg));
            }
        }
        if (max > 0) {
            msg = trans(maxMsg, { max: max });
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
        if (!this.setup.contents[type].enabled) {
            return;
        }
        let msg = '';
        msg = trans('profile.password.min_' + type, { min: this.setup.contents[type].min });
        if (this[type + 'Pattern'].test(this.input.value)) {
            return this._successMsg(msg);
        } else {
            return this._errorMsg(msg);
        }
    }
}
