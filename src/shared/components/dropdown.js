/**
 * @typedef {module:dom-navigator.DOMNavigatorOptions} DOMNavigatorOptions
 */
import { html } from 'lit';
import { until } from 'lit/directives/until.js';
import { api, constants } from "@converse/headless";
import 'shared/components/icons.js';
import DOMNavigator from "shared/dom-navigator.js";
import DropdownBase from 'shared/components/dropdownbase.js';

import './styles/dropdown.scss';

const { KEYCODES } = constants;


export default class Dropdown extends DropdownBase {

    static get properties () {
        return {
            icon_classes: { type: String },
            items: { type: Array }
        }
    }

    constructor () {
        super();
        this.icon_classes = 'fa fa-bars';
        this.items = [];
    }

    render () {
        return html`
            <button type="button" class="btn btn--transparent btn--standalone" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <converse-icon size="1em" class="${ this.icon_classes }">
            </button>
            <div class="dropdown-menu">
                ${ this.items.map(b => until(b, '')) }
            </div>
        `;
    }

    firstUpdated () {
        super.firstUpdated();
        this.initArrowNavigation();
    }

    connectedCallback () {
        super.connectedCallback();
        this.hideOnEscape = ev => (ev.keyCode === KEYCODES.ESCAPE && this.hideMenu());
        document.addEventListener('keydown', this.hideOnEscape);
    }

    disconnectedCallback() {
        document.removeEventListener('keydown', this.hideOnEscape);
        super.disconnectedCallback();
    }

    hideMenu () {
        super.hideMenu();
        this.navigator?.disable();
    }

    initArrowNavigation () {
        if (!this.navigator) {
            const options = /** @type DOMNavigatorOptions */({
                'selector': '.dropdown-item',
                'onSelected': el => el.focus()
            });
            this.navigator = new DOMNavigator(/** @type HTMLElement */(this.menu), options);
        }
    }

    enableArrowNavigation (ev) {
        if (ev) {
            ev.preventDefault();
            ev.stopPropagation();
        }
        this.navigator.enable();
        this.navigator.select(/** @type HTMLElement */(this.menu.firstElementChild));
    }

    handleKeyUp (ev) {
        super.handleKeyUp(ev);
        if (ev.keyCode === KEYCODES.DOWN_ARROW && !this.navigator.enabled) {
            this.enableArrowNavigation(ev);
        }
    }
}

api.elements.define('converse-dropdown', Dropdown);
