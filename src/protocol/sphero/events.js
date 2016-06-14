/**
 * @fileoverview Sphero Event definitions.
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
goog.provide('cwc.protocol.sphero.Events');



/**
 * Custom events.
 * @enum {Event}
 */
cwc.protocol.sphero.Events.Type = {
  CHANGED_LOCATION: 'changed_devices',
  CHANGED_VELOCITY: 'changed_values',
  CHANGED_SPEED: 'changed_speed',
  COLLISION: 'collision'
};


/**
 * @param {object} data
 * @final
 */
cwc.protocol.sphero.Events.LocationData = function(data) {
  return new cwc.protocol.sphero.Events.Data_(
      cwc.protocol.sphero.Events.Type.CHANGED_LOCATION, data);
};


/**
 * @param {object} data
 * @final
 */
cwc.protocol.sphero.Events.VelocityData = function(data) {
  return new cwc.protocol.sphero.Events.Data_(
      cwc.protocol.sphero.Events.Type.CHANGED_VELOCITY, data);
};


/**
 * @param {object} data
 * @final
 */
cwc.protocol.sphero.Events.SpeedValue = function(data) {
  return new cwc.protocol.sphero.Events.Data_(
      cwc.protocol.sphero.Events.Type.CHANGED_SPEED, data);
};


/**
 * @param {object} data
 * @final
 */
cwc.protocol.sphero.Events.Collision = function(data) {
  return new cwc.protocol.sphero.Events.Data_(
      cwc.protocol.sphero.Events.Type.COLLISION, data);
};


/**
 * @param {!cwc.protocol.sphero.Events.Type} type
 * @param {!object} data
 * @constructor
 * @final
 * @private
 */
cwc.protocol.sphero.Events.Data_ = function(type, data, opt_port) {
  /** @type {!cwc.protocol.sphero.Events.Type} */
  this.type = type;

  /** @type {!object} */
  this.data = data;
};
