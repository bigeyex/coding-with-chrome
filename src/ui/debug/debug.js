/**
 * @fileoverview Show an debug screen for simple testing.
 *
 * @license Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author mbordihn@google.com (Markus Bordihn)
 */
goog.provide('cwc.ui.Debug');

goog.require('cwc.file.Type');
goog.require('cwc.mode.Type');
goog.require('cwc.soy.Debug');
goog.require('cwc.ui.DialogType');
goog.require('cwc.ui.MessageType');
goog.require('cwc.utils.Helper');



/**
 * @param {!cwc.utils.Helper} helper
 * @constructor
 * @struct
 */
cwc.ui.Debug = function(helper) {
  /** @type {string} */
  this.name = 'Debug';

  /** @type {!cwc.utils.Helper} */
  this.helper = helper;

  /** @type {string} */
  this.prefix = this.helper.getPrefix('debug');

  /** @type {Element} */
  this.node = null;

  /** @type {Element|StyleSheet} */
  this.styleSheet = null;
};


/**
 * Decorates the given node and adds the debug screen.
 * @param {Element} node
 * @param {string=} opt_prefix
 */
cwc.ui.Debug.prototype.decorate = function(node, opt_prefix) {
  this.node = node;
  this.prefix = (opt_prefix || '') + this.prefix;
  goog.soy.renderElement(
      this.node,
      cwc.soy.Debug.template, {
        'prefix': this.prefix,
        'file_types': cwc.file.Type,
        'mode_types': cwc.mode.Type,
        'dialog_types': cwc.ui.DialogType,
        'message_types': cwc.ui.MessageType
      }
  );

  if (!this.styleSheet) {
    this.styleSheet = goog.style.installStyles(
        cwc.soy.Debug.style({ 'prefix': this.prefix }));
  }

  this.addEvents();
};


/**
 * Adds click events.
 */
cwc.ui.Debug.prototype.addEvents = function() {
  goog.events.listen(goog.dom.getElement(this.prefix + 'close'),
    goog.events.EventType.CLICK, this.close, false, this);

  this.addChangeHandler(goog.dom.getElement(this.prefix + 'file_types'),
      this.handleFileType);
  this.addChangeHandler(goog.dom.getElement(this.prefix + 'mode_types'),
      this.handleModeType);
  this.addChangeHandler(goog.dom.getElement(this.prefix + 'message_types'),
      this.handleMessageType);
  this.addLinkHandler(goog.dom.getElement(this.prefix + 'dialog_show'),
      function() {
        this.helper.executeInstance('dialog', 'show');
      });
  this.addLinkHandler(goog.dom.getElement(this.prefix + 'dialog_showModal'),
      function() {
        this.helper.executeInstance('dialog', 'showModal');
      });
  this.addLinkHandler(goog.dom.getElement(this.prefix + 'dialog_close'),
      function() {
        this.helper.executeInstance('dialog', 'close');
      });
};


/**
 * @param {?} opt_event
 */
cwc.ui.Debug.prototype.close = function(opt_event) {
  var layoutInstance = this.helper.getInstance('layout', true);
  layoutInstance.showOverlay(false);
};


/**
 * @param {?} event
 */
cwc.ui.Debug.prototype.handleFileType = function(event) {
  var target = event.target;
  var fileType = target.options[target.selectedIndex].value;
  console.log('FileType:', fileType);
  if (fileType) {
    this.newFile(cwc.file.Type[fileType]);
  }
};


/**
 * @param {?} event
 */
cwc.ui.Debug.prototype.handleModeType = function(event) {
  var target = event.target;
  var editorMode = target.options[target.selectedIndex].value;
  console.log('ModeType:', editorMode);
  if (editorMode) {
    this.newMode(cwc.mode.Type[editorMode]);
  }
};


/**
 * @param {?} event
 */
cwc.ui.Debug.prototype.handleMessageType = function(event) {
  var target = event.target;
  var messageType = target.options[target.selectedIndex].value;
  console.log('MessageType:', messageType);
  if (messageType) {
    this.newMessage(cwc.ui.MessageType[messageType]);
  }
};


/**
 * @param {Element} element
 * @param {Function} func
 */
cwc.ui.Debug.prototype.addLinkHandler = function(element, func) {
  goog.events.listen(element, goog.events.EventType.CLICK, func, false, this);
};


/**
 * @param {Element} element
 * @param {Function} func
 */
cwc.ui.Debug.prototype.addChangeHandler = function(element, func) {
  goog.events.listen(element, goog.events.EventType.CHANGE, func, false, this);
};


/**
 * Creates a new file of the given type.
 * @param {cwc.file.Type} type
 */
cwc.ui.Debug.prototype.newFile = function(type) {
  var fileCreatorInstance = this.helper.getInstance('fileCreator');
  if (fileCreatorInstance) {
    fileCreatorInstance.create(type);
  }
};


/**
 * Creates a new mode of the given type.
 * @param {cwc.file.Type} type
 */
cwc.ui.Debug.prototype.newMode = function(type) {
  var modeInstance = this.helper.getInstance('mode');
  if (modeInstance) {
    modeInstance.setMode(type);
  }
};


/**
 * Creates a new mode of the given type.
 * @param {cwc.file.Type} type
 */
cwc.ui.Debug.prototype.newMessage = function(type) {
  var messageInstance = this.helper.getInstance('message');
  if (messageInstance) {
    messageInstance.showMessage('Test message: ' + type, type);
  }
};
