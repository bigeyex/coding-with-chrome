/**
 * @fileoverview Layouts for the Coding with Chrome editor.
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
goog.provide('cwc.ui.Layout');
goog.provide('cwc.ui.LayoutOverlayBackground');
goog.provide('cwc.ui.LayoutTemplate');
goog.provide('cwc.ui.LayoutType');

goog.require('cwc.soy.ui.Layout');
goog.require('cwc.soy.ui.Layout.leftSidebar');
goog.require('cwc.soy.ui.Layout.simpleSingleColumn');
goog.require('cwc.soy.ui.Layout.simpleTwoColumn');
goog.require('cwc.soy.ui.Layout.singleColumn');
goog.require('cwc.soy.ui.Layout.twoColumn');
goog.require('cwc.utils.Helper');

goog.require('goog.dom');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.math.Size');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.ui.SplitPane');
goog.require('goog.ui.SplitPane.Orientation');


/**
 * Supported overlay backgrounds.
 * @enum {!Object.<string>|string}
 */
cwc.ui.LayoutOverlayBackground = {
  TRANSPARENT: 'bg_transparent',
  TRANSPARENT_25: 'bg_transparent_25',
  TRANSPARENT_50: 'bg_transparent_50',
  TRANSPARENT_75: 'bg_transparent_75',
  GREY: 'bg_grey',
  WHITE: 'bg_white',
  NONE: 'none'
};


/**
 * Supported layout types.
 * @enum {!Object.<string>|string}
 */
cwc.ui.LayoutType = {
  DEFAULT: 'DEFAULT',
  SINGLE_COLUMN: 'SINGLE_COLUMN',
  TWO_COLUMN: 'TWO_COLUMN',
  SIMPLE_SINGLE_COLUMN: 'SIMPLE_SINGLE_COLUMN',
  SIMPLE_TWO_COLUMN: 'SIMPLE_TWO_COLUMN',
  LEFT_SIDEBAR: 'LEFT_SIDEBAR',
  NONE: 'NONE'
};


/**
 * Supported layout types.
 * @enum {!Object.<string>|string}
 */
cwc.ui.LayoutTypeTemplate = {
  DEFAULT: cwc.soy.ui.Layout.template,
  SINGLE_COLUMN: cwc.soy.ui.Layout.singleColumn.template,
  TWO_COLUMN: cwc.soy.ui.Layout.twoColumn.template,
  SIMPLE_SINGLE_COLUMN: cwc.soy.ui.Layout.simpleSingleColumn.template,
  SIMPLE_TWO_COLUMN: cwc.soy.ui.Layout.simpleTwoColumn.template,
  LEFT_SIDEBAR: cwc.soy.ui.Layout.leftSidebar.template,
  NONE: null
};



/**
 * @param {!cwc.utils.Helper} helper
 * @constructor
 * @struct
 * @final
 */
cwc.ui.Layout = function(helper) {
  /** @type {string} */
  this.name = 'Layout';

  /** @type {goog.dom.ViewportSizeMonitor} */
  this.viewport_monitor = null;

  /** @type {!cwc.utils.Helper} */
  this.helper = helper;

  /** @type {string} */
  this.generalPrefix = this.helper.getPrefix();

  /** @type {string} */
  this.prefix = this.generalPrefix + 'layout-';

  /** @type {Element} */
  this.node = null;

  /** @type {!Object.<Element>} */
  this.nodes = {};

  /** @type {Element|StyleSheet} */
  this.styleSheet = null;

  /** @type {!number} */
  this.defaultHandleSize = 12;

  /** @type {!number} */
  this.handleSize = this.defaultHandleSize;

  /** @type {cwc.ui.LayoutType} */
  this.layout = cwc.ui.LayoutType.NONE;

  /** @type {Array} */
  this.listener = [];

  /** @type {Array} */
  this.customListener = [];

  /** @type {goog.events.EventTarget} */
  this.eventHandler = new goog.events.EventTarget();

  /** @type {goog.math.Size} */
  this.headerSize = new goog.math.Size(0, 0);

  /** @type {!goog.math.Size} */
  this.chromeSize = new goog.math.Size(400, 400);

  /** @type {goog.math.Size} */
  this.viewportSize = new goog.math.Size(0, 0);

  /** @type {?number} */
  this.fixLeftComponentSize = null;

  /** @type {?number} */
  this.fixRightComponentSize = null;

  /** @type {?number} */
  this.fixTopComponentSize = null;

  /** @type {?number} */
  this.fixBottomComponentSize = null;

  /** @type {goog.ui.SplitPane} */
  this.firstSplitpane = null;

  /** @type {goog.ui.SplitPane} */
  this.secondSplitpane = null;

  /** @type {?number} */
  this.firstSplitpaneCachedSize = null;

  /** @type {?number} */
  this.secondSplitpaneCachedSize = null;

  /** @type {boolean} */
  this.fullscreen = false;
};


/**
 * @param {string} name
 * @return {Element}
 * @private
 */
cwc.ui.Layout.prototype.getNode_ = function(name) {
  return goog.dom.getElement(this.prefix + name);
};


/**
 * Prepares the layout.
 * @export
 */
cwc.ui.Layout.prototype.prepare = function() {
  var guiInstance = this.helper.getInstance('gui', true);
  this.node = guiInstance.getLayoutNode();

  if (!this.styleSheet) {
    this.styleSheet = goog.style.installStyles(
        cwc.soy.ui.Layout.style({'prefix': this.prefix}));
  }

  this.viewport_monitor = new goog.dom.ViewportSizeMonitor();
  goog.events.listen(this.viewport_monitor,
                     goog.events.EventType.RESIZE,
                     this.adjustSize, false, this);
  this.renderTemplate_(cwc.ui.LayoutType.DEFAULT);
};


/**
 * Decorates the given node and adds the single column layout.
 * @export
 */
cwc.ui.Layout.prototype.decorateSingleColumnLayout = function() {
  this.renderTemplate_(cwc.ui.LayoutType.SINGLE_COLUMN);
  var chromeMain = this.getNode_('chrome-main');
  var topComponent = new goog.ui.Component();
  var bottomComponent = new goog.ui.Component();
  this.firstSplitpane = new goog.ui.SplitPane(topComponent, bottomComponent,
      goog.ui.SplitPane.Orientation.VERTICAL);
  this.firstSplitpane.setInitialSize(175);
  this.firstSplitpane.setHandleSize(this.handleSize);
  this.firstSplitpane.decorate(chromeMain);
  this.monitorResize(this.firstSplitpane);
  this.closePreloader_();
  this.adjustSize();
};


/**
 * Decorates the given node and adds the two column layout.
 * @param {number=} opt_first_splitpane_size
 * @param {number=} opt_second_splitpane_size
 * @export
 */
cwc.ui.Layout.prototype.decorateTwoColumnLayout = function(
    opt_first_splitpane_size, opt_second_splitpane_size) {
  this.renderTemplate_(cwc.ui.LayoutType.TWO_COLUMN);
  var chromeMain = this.getNode_('chrome-main');
  var topComponent = new goog.ui.Component();
  var bottomComponent = new goog.ui.Component();
  this.firstSplitpane = new goog.ui.SplitPane(topComponent, bottomComponent,
      goog.ui.SplitPane.Orientation.VERTICAL);
  this.firstSplitpane.setHandleSize(this.handleSize);
  this.firstSplitpane.decorate(chromeMain);
  this.monitorResize(this.firstSplitpane);
  this.adjustSizeOnChange(this.firstSplitpane);

  var contentTop = this.getNode_('content-top-chrome');
  var leftComponent = new goog.ui.Component();
  var rightComponent = new goog.ui.Component();
  this.secondSplitpane = new goog.ui.SplitPane(leftComponent, rightComponent,
      goog.ui.SplitPane.Orientation.HORIZONTAL);
  this.secondSplitpane.setHandleSize(this.handleSize);
  this.secondSplitpane.decorate(contentTop);
  this.monitorResize(this.secondSplitpane);
  this.closePreloader_();
  this.adjustSize();
  this.firstSplitpane.setFirstComponentSize(opt_first_splitpane_size || 400);
  this.secondSplitpane.setFirstComponentSize(opt_second_splitpane_size || 600);
};


/**
 * Decorates the given node and adds the simple single column layout.
 * @export
 */
cwc.ui.Layout.prototype.decorateSimpleSingleColumnLayout = function() {
  this.renderTemplate_(cwc.ui.LayoutType.SIMPLE_SINGLE_COLUMN);
  this.closePreloader_();
  this.adjustSize();
};


/**
 * Decorates the given node and adds the simple two column layout.
 * @param {number=} opt_first_splitpane_size
 * @export
 */
cwc.ui.Layout.prototype.decorateSimpleTwoColumnLayout = function(
    opt_first_splitpane_size) {
  this.renderTemplate_(cwc.ui.LayoutType.SIMPLE_TWO_COLUMN);
  var chromeMain = this.getNode_('chrome-main');
  var leftComponent = new goog.ui.Component();
  var rightComponent = new goog.ui.Component();
  this.firstSplitpane = new goog.ui.SplitPane(leftComponent, rightComponent,
      goog.ui.SplitPane.Orientation.HORIZONTAL);
  this.firstSplitpane.setInitialSize(opt_first_splitpane_size || 400);
  this.firstSplitpane.setHandleSize(this.handleSize);
  this.firstSplitpane.decorate(chromeMain);
  this.monitorResize(this.firstSplitpane);
  this.adjustSizeOnChange(this.firstSplitpane);
  this.closePreloader_();
  this.adjustSize();
  this.firstSplitpane.setFirstComponentSize(opt_first_splitpane_size || 400);
};


/**
 * Decorates the given node and adds the left sidebar layout.
 * @export
 */
cwc.ui.Layout.prototype.decorateLeftSidebarLayout = function() {
  this.renderTemplate_(cwc.ui.LayoutType.LEFT_SIDEBAR);
  var chromeMain = this.getNode_('chrome-main');
  var leftComponent = new goog.ui.Component();
  var rightComponent = new goog.ui.Component();
  this.firstSplitpane = new goog.ui.SplitPane(leftComponent, rightComponent,
      goog.ui.SplitPane.Orientation.HORIZONTAL);
  this.firstSplitpane.setInitialSize(175);
  this.firstSplitpane.setHandleSize(this.handleSize);
  this.firstSplitpane.decorate(chromeMain);
  this.monitorResize(this.firstSplitpane);
  this.adjustSizeOnChange(this.firstSplitpane);

  var contentRight = this.getNode_('content-right-chrome');
  var topComponent = new goog.ui.Component();
  var bottomComponent = new goog.ui.Component();
  this.secondSplitpane = new goog.ui.SplitPane(topComponent, bottomComponent,
      goog.ui.SplitPane.Orientation.VERTICAL);
  this.secondSplitpane.setInitialSize(175);
  this.secondSplitpane.setHandleSize(this.handleSize);
  this.secondSplitpane.decorate(contentRight);
  this.monitorResize(this.secondSplitpane);
  this.closePreloader_();
  this.adjustSize();
};


/**
 * Returns the available nodes of the current layout.
 * @return {Object}
 * @export
 */
cwc.ui.Layout.prototype.getNodes = function() {
  return this.nodes;
};


/**
 * @return {Element}
 * @export
 */
cwc.ui.Layout.prototype.getOverlay = function() {
  return this.nodes['overlay'];
};


/**
 * @param {boolean} visible
 * @export
 */
cwc.ui.Layout.prototype.showOverlay = function(visible) {
  this.setOverlayBackground();
  goog.style.setElementShown(this.getOverlay(), visible);
  if (visible) {
    this.refresh();
  }
};


/**
 * @param {!cwc.ui.LayoutOverlayBackground} background
 * @export
 */
cwc.ui.Layout.prototype.setOverlayBackground = function(background) {
  var overlayNode = this.getOverlay();
  if (overlayNode) {
    for (var type in cwc.ui.LayoutOverlayBackground) {
      goog.dom.classes.enable(overlayNode,
          this.prefix + cwc.ui.LayoutOverlayBackground[type],
          background == cwc.ui.LayoutOverlayBackground[type]);
    }
  }
};


/**
 * Return the available splitpanes for the current layout.
 * @return {Object}
 * @export
 */
cwc.ui.Layout.prototype.getSplitpane = function() {
  return {
    'first': this.firstSplitpane,
    'second': this.secondSplitpane
  };
};


/**
 * Update sizes.
 */
cwc.ui.Layout.prototype.updateSizeInformation = function() {
  this.viewportSize = this.viewport_monitor.getSize();
  var guiInstance = this.helper.getInstance('gui');
  if (guiInstance) {
    this.headerSize = guiInstance.getHeaderSize();
    this.chromeSize = new goog.math.Size(this.viewportSize.width,
        this.viewportSize.height - this.headerSize.height);
  } else {
    this.headerSize = null;
    this.chromeSize = new goog.math.Size(this.viewportSize.width,
        this.viewportSize.height);
  }
};


/**
 * Refresh dom structure and trigger external frameworks.
 */
cwc.ui.Layout.prototype.refresh = function() {
  if (typeof window.componentHandler !== 'undefined') {
    window.componentHandler.upgradeDom();
  }
};


/**
 * Adjusts size of the layout chrome.
 */
cwc.ui.Layout.prototype.adjustLayoutChrome = function() {
  if (this.node) {
    goog.style.setSize(this.node, this.chromeSize);
  }
  if (this.nodes['overlay']) {
    goog.style.setSize(this.nodes['overlay'], this.chromeSize);
  }
};


/**
 * Adds event listener to adjust size of the split plane on drag and snap.
 * @param {goog.ui.SplitPane} splitpane
 */
cwc.ui.Layout.prototype.adjustSizeOnChange = function(splitpane) {
  this.addEventListener_(splitpane, goog.ui.SplitPane.EventType.HANDLE_DRAG,
      this.adjustSize, false, this);

  this.addEventListener_(splitpane, goog.ui.SplitPane.EventType.HANDLE_SNAP,
      this.adjustSize, false, this);
};


/**
 * Adjusts the UI to the correct size after an resize.
 */
cwc.ui.Layout.prototype.adjustSize = function() {
  var firstSplitpaneComponentSize = null;
  var secondSplitpaneComponentSize = null;
  this.updateSizeInformation();
  this.adjustLayoutChrome();

  switch (this.layout) {
    case cwc.ui.LayoutType.SIMPLE_SINGLE_COLUMN:
      goog.style.setSize(this.nodes['content'], this.chromeSize);
      break;

    case cwc.ui.LayoutType.SIMPLE_TWO_COLUMN:
      if (!this.fullscreen) {
        if (this.fixRightComponentSize) {
          firstSplitpaneComponentSize = this.chromeSize.width -
           this.handleSize - this.fixRightComponentSize;
        }
      }
      this.firstSplitpane.setSize(this.chromeSize, firstSplitpaneComponentSize);
      break;
    case cwc.ui.LayoutType.SINGLE_COLUMN:
      this.firstSplitpane.setSize(this.chromeSize);
      break;

    case cwc.ui.LayoutType.TWO_COLUMN:
      if (!this.fullscreen) {
        if (this.fixTopComponentSize) {
          firstSplitpaneComponentSize = this.fixTopComponentSize;
        } else if (this.fixBottomComponentSize) {
          firstSplitpaneComponentSize = this.chromeSize.height -
              this.handleSize - this.fixBottomComponentSize;
        }
        if (this.fixLeftComponentSize) {
          secondSplitpaneComponentSize = this.fixLeftComponentSize;
        } else if (this.fixRightComponentSize) {
          secondSplitpaneComponentSize = this.chromeSize.width -
              this.handleSize - this.fixRightComponentSize;
        }
      }
      this.firstSplitpane.setSize(this.chromeSize, firstSplitpaneComponentSize);
      this.secondSplitpane.setSize(
          new goog.math.Size(
              this.chromeSize.width,
              this.firstSplitpane.getFirstComponentSize() || 0),
          secondSplitpaneComponentSize);
      break;

    case cwc.ui.LayoutType.LEFT_SIDEBAR:
      this.firstSplitpane.setSize(this.chromeSize);
      var secondSplitpaneSize = new goog.math.Size(
          this.chromeSize.width - this.firstSplitpane.getFirstComponentSize() -
          this.handleSize,
          this.chromeSize.height);
      this.secondSplitpane.setSize(secondSplitpaneSize);
      break;

    case cwc.ui.LayoutType.DEFAULT:
    case cwc.ui.LayoutType.NONE:
      break;

    default:
      console.error('Unknown layout:', this.layout);
      break;
  }
};


/**
 * @param {!number} size
 * @export
 */
cwc.ui.Layout.prototype.setHandleSize = function(size) {
  this.handleSize = size;
  if (this.firstSplitpane) {
    this.firstSplitpane.setHandleSize(this.handleSize);
  }
  if (this.secondSplitpane) {
    this.secondSplitpane.setHandleSize(this.handleSize);
  }
  this.adjustSize();
};


/**
 * Clears the custom component sizes.
 */
cwc.ui.Layout.prototype.cleanFixComponentSizes = function() {
  this.fixLeftComponentSize = null;
  this.fixRightComponentSize = null;
  this.fixTopComponentSize = null;
  this.fixBottomComponentSize = null;
};


/**
 * @param {!number} size Fix left component size.
 * @export
 */
cwc.ui.Layout.prototype.setFixLeftComponentSize = function(size) {
  this.fixLeftComponentSize = size;
  this.fixRightComponentSize = null;
  this.adjustSize();
};


/**
 * @param {!number} size Fix right component size.
 * @export
 */
cwc.ui.Layout.prototype.setFixRightComponentSize = function(size) {
  this.fixLeftComponentSize = null;
  this.fixRightComponentSize = size;
  this.adjustSize();
};


/**
 * @param {!number} size Fix top component size.
 * @export
 */
cwc.ui.Layout.prototype.setFixTopComponentSize = function(size) {
  this.fixTopComponentSize = size;
  this.fixBottomComponentSize = null;
  this.adjustSize();
};


/**
 * @param {!number} size Fix bottom component size.
 * @export
 */
cwc.ui.Layout.prototype.setFixBottomComponentSize = function(size) {
  this.fixTopComponentSize = null;
  this.fixBottomComponentSize = size;
  this.adjustSize();
};


/**
 * Adjusts the main UI element to fullscreen.
 * @param {!boolean} fullscreen
 * @export
 */
cwc.ui.Layout.prototype.setFullscreen = function(fullscreen) {
  this.fullscreen = fullscreen;
  if (fullscreen) {
    this.firstSplitpaneCachedSize = (this.firstSplitpane) ?
        this.firstSplitpane.getFirstComponentSize() : 200;
    this.secondSplitpaneCachedSize = (this.secondSplitpane) ?
        this.secondSplitpane.getFirstComponentSize() : 200;
  }
  switch (this.layout) {
    case cwc.ui.LayoutType.TWO_COLUMN:
      this.firstSplitpane.setFirstComponentSize((fullscreen) ?
          this.chromeSize.height - this.handleSize :
          this.firstSplitpaneCachedSize);
      this.secondSplitpane.setFirstComponentSize((fullscreen) ?
          this.chromeSize.width - this.handleSize :
          this.secondSplitpaneCachedSize);
      break;
    case cwc.ui.LayoutType.SIMPLE_TWO_COLUMN:
      this.firstSplitpane.setFirstComponentSize((fullscreen) ?
          this.chromeSize.width - this.handleSize :
          this.firstSplitpaneCachedSize);
      break;
  }

  var blocklyInstance = this.helper.getInstance('blockly');
  if (blocklyInstance) {
    blocklyInstance.adjustSize();
  }

  var editorInstance = this.helper.getInstance('editor');
  if (editorInstance) {
    editorInstance.adjustSize();
  }
};


/**
 * Adds an event listener to monitor the size of the split spane.
 * @param {!goog.ui.SplitPane} splitpane
 */
cwc.ui.Layout.prototype.monitorResize = function(splitpane) {
  this.addCustomEventListener(splitpane,
      goog.ui.SplitPane.EventType.HANDLE_DRAG,
      this.handleResizeEvent, false, this);

  this.addCustomEventListener(splitpane,
      goog.ui.SplitPane.EventType.HANDLE_SNAP,
      this.handleResizeEvent, false, this);
};


/**
 * Dispatches a resize event for any layout change to the event handler.
 */
cwc.ui.Layout.prototype.handleResizeEvent = function() {
  this.eventHandler.dispatchEvent(goog.events.EventType.RESIZE);
};


/**
 * @param {!cwc.ui.LayoutType} type
 * @private
 */
cwc.ui.Layout.prototype.renderTemplate_ = function(type) {
  var template = cwc.ui.LayoutTypeTemplate[type];
  if (!template) {
    console.error('Template', type, 'is not implemented!');
    return;
  }

  this.resetLayout();
  goog.soy.renderElement(this.node, template, {'prefix': this.prefix});
  this.nodes = {
    'content': this.getNode_('content-chrome'),
    'content-left': this.getNode_('content-left-chrome'),
    'content-right': this.getNode_('content-right-chrome'),
    'content-top': this.getNode_('content-top-chrome'),
    'content-bottom': this.getNode_('content-bottom-chrome'),
    'overlay': this.getNode_('content-overlay')
  };
  this.showPreloader_();
  this.layout = type;
};


/**
 * Shows preloader screen.
 * @private
 */
cwc.ui.Layout.prototype.showPreloader_ = function() {
  this.showOverlay(true);
  this.setOverlayBackground(
      cwc.ui.LayoutOverlayBackground.TRANSPARENT_25);
  goog.soy.renderElement(
      this.getOverlay(),
      cwc.soy.ui.Layout.preloader,
      {'prefix': this.prefix});
};


/**
 * Hides preloader screen.
 * @private
 */
cwc.ui.Layout.prototype.closePreloader_ = function() {
  this.showOverlay(false);
  this.setOverlayBackground(cwc.ui.LayoutOverlayBackground.NONE);
};


/**
 * Resets event handler and cached values.
 */
cwc.ui.Layout.prototype.resetLayout = function() {
  this.eventHandler.dispatchEvent(goog.events.EventType.UNLOAD);
  this.setFullscreen(false);
  this.setHandleSize(this.defaultHandleSize);
  this.customListener = this.helper.removeEventListeners(this.customListener,
      this.name);
  this.cleanFixComponentSizes();
  this.cleanSplitpaneCachedSize();
  this.firstSplitpane = null;
  this.secondSplitpane = null;
};


/**
 * Adds an event listener for a specific event on a native event
 * target (such as a DOM element) or an object that has implemented
 * {@link goog.events.Listenable}.
 *
 * @param {EventTarget|goog.events.Listenable} src
 * @param {string} type
 * @param {function()} listener
 * @param {boolean=} opt_useCapture
 * @param {Object=} opt_listenerScope
 * @private
 */
cwc.ui.Layout.prototype.addEventListener_ = function(src, type,
    listener, opt_useCapture, opt_listenerScope) {
  var eventListener = goog.events.listen(src, type, listener, opt_useCapture,
      opt_listenerScope);
  goog.array.insert(this.listener, eventListener);
};


/**
 * Adds an event listener for a specific event on a native event
 * target (such as a DOM element) or an object that has implemented
 * {@link goog.events.Listenable}.
 *
 * @param {EventTarget|goog.events.Listenable} src
 * @param {string} type
 * @param {function()} listener
 * @param {boolean=} opt_useCapture
 * @param {Object=} opt_listenerScope
 */
cwc.ui.Layout.prototype.addCustomEventListener = function(src, type,
    listener, opt_useCapture, opt_listenerScope) {
  var eventListener = goog.events.listen(src, type, listener, opt_useCapture,
      opt_listenerScope);
  goog.array.insert(this.customListener, eventListener);
};


/**
 * Clears all object based events.
 */
cwc.ui.Layout.prototype.cleanUp = function() {
  this.listener = this.helper.removeEventListeners(this.listener, this.name);
  this.styleSheet = this.helper.uninstallStyles(this.styleSheet);
  this.resetLayout();
};


/**
 * Clears the cached splitpane sizes.
 */
cwc.ui.Layout.prototype.cleanSplitpaneCachedSize = function() {
  this.firstSplitpaneCachedSize = null;
  this.secondSplitpaneCachedSize = null;
};


/**
 * @return {goog.events.EventTarget}
 */
cwc.ui.Layout.prototype.getEventHandler = function() {
  return this.eventHandler;
};
