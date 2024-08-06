import { _converse, api } from "@converse/headless";
import { CustomElement } from 'shared/components/element.js';
import tplMUCSidebarOccupant from "./templates/muc-sidebar-occupant.js";

export default class MUCSidebarOccupant extends CustomElement {
  static get properties () {
    return {
      model: { type: Object }
    }
  }

  initialize () {
    this.listenTo(this.model, 'change', () => this.requestUpdate());
    this.listenTo(this.model, 'vcard:change', () => this.requestUpdate());
    this.listenTo(this.model, 'vcard:add', () => this.requestUpdate());
  }

  render () {
    return tplMUCSidebarOccupant(this, this.model)
  }

  /** @param {MouseEvent} ev */
  onOccupantClicked (ev) {
    ev?.preventDefault?.();
    const { chatboxviews } = _converse.state;
    const view = chatboxviews.get(this.model.collection.chatroom.getAttribute('jid'));
    view?.getMessageForm().insertIntoTextArea(`@${this.model.getDisplayName()}`);
  }
}

api.elements.define('converse-muc-sidebar-occupant', MUCSidebarOccupant);
