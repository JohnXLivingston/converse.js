import log from '@converse/headless/log';
import { ElementView } from '@converse/skeletor/src/element.js';
import { _converse, api, converse } from '@converse/headless/core';
import { onScrolledDown } from './utils.js';

const u = converse.env.utils;

export default class BaseChatView extends ElementView {

    disconnectedCallback () {
        super.disconnectedCallback();
        const jid = this.getAttribute('jid');
        _converse.chatboxviews.remove(jid, this);
    }

    maybeFocus () {
        api.settings.get('auto_focus') && this.focus();
    }

    focus () {
        const textarea_el = this.getElementsByClassName('chat-textarea')[0];
        if (textarea_el && document.activeElement !== textarea_el) {
            textarea_el.focus();
        }
        return this;
    }

    show () {
        if (this.model.get('hidden')) {
            log.debug(`Not showing chat ${this.model.get('jid')} because it's set as hidden`);
            return;
        }
        if (u.isVisible(this)) {
            this.maybeFocus();
            return;
        }
        this.afterShown();
    }

    emitBlurred (ev) {
        if (this.contains(document.activeElement) || this.contains(ev.relatedTarget)) {
            // Something else in this chatbox is still focused
            return;
        }
        /**
         * Triggered when the focus has been removed from a particular chat.
         * @event _converse#chatBoxBlurred
         * @type { _converse.ChatBoxView | _converse.ChatRoomView }
         * @example _converse.api.listen.on('chatBoxBlurred', (view, event) => { ... });
         */
        api.trigger('chatBoxBlurred', this, ev);
    }

    emitFocused (ev) {
        if (this.contains(ev.relatedTarget)) {
            // Something else in this chatbox was already focused
            return;
        }
        /**
         * Triggered when the focus has been moved to a particular chat.
         * @event _converse#chatBoxFocused
         * @type { _converse.ChatBoxView | _converse.ChatRoomView }
         * @example _converse.api.listen.on('chatBoxFocused', (view, event) => { ... });
         */
        api.trigger('chatBoxFocused', this, ev);
    }

    onStatusMessageChanged (item) {
        this.renderHeading();
        /**
         * When a contact's custom status message has changed.
         * @event _converse#contactStatusMessageChanged
         * @type {object}
         * @property { object } contact - The chat buddy
         * @property { string } message - The message text
         * @example _converse.api.listen.on('contactStatusMessageChanged', obj => { ... });
         */
        api.trigger('contactStatusMessageChanged', {
            'contact': item.attributes,
            'message': item.get('status')
        });
    }

    getBottomPanel () {
        if (this.model.get('type') === _converse.CHATROOMS_TYPE) {
            return this.querySelector('converse-muc-bottom-panel');
        } else {
            return this.querySelector('converse-chat-bottom-panel');
        }
    }

    /**
     * Scrolls the chat down.
     *
     * This method will always scroll the chat down, regardless of
     * whether the user scrolled up manually or not.
     * @param { Event } [ev] - An optional event that is the cause for needing to scroll down.
     */
    scrollDown (ev) {
        ev?.preventDefault?.();
        ev?.stopPropagation?.();
        if (this.model.get('scrolled')) {
            u.safeSave(this.model, { 'scrolled': false });
        }
        onScrolledDown(this.model);
    }

    onWindowStateChanged (data) {
        if (data.state === 'visible') {
            if (!this.model.isHidden() && this.model.get('num_unread', 0)) {
                this.model.clearUnreadMsgCounter();
            }
        } else if (data.state === 'hidden') {
            this.model.setChatState(_converse.INACTIVE, { 'silent': true });
            this.model.sendChatState();
        }
    }
}
