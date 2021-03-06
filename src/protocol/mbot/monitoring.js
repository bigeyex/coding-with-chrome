/**
 * @fileoverview Define monitors used in mbot protocol.
 *
 * monitor real time values in makeblock sensors
 *
 * @license Copyright 2016 Shenzhen Maker Works Co, Ltd. All Rights Reserved.
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
 * @author wangyu@makeblock.cc (Yu Wang)
 */

goog.provide('cwc.protocol.mbot.Monitoring');
goog.require('cwc.protocol.mbot.Command');

/**
 * @constructor
 * @param {!cwc.protocol.mbot.Api} api
 * @struct
 * @final
 */
cwc.protocol.mbot.Monitoring = function(api) {
  /** @type {!cwc.protocol.mbot.Api} */
  this.api = api;

  /** @type {!cwc.protocol.mbot.Command} */
  this.command = cwc.protocol.mbot.Command;

  /** @type {boolean} */
  this.monitor = false;

  /** @type {timer} */
  this.monitorTimer = null;

  /** @type {int} */
  this.readInterval = 50;

  /** @type {[int]} */
  this.availableSensors = this.command.AVAILABLE_SENSORS;

  /** @type {int} */
  this.readIndex = 0;

  /** @type {float} */
  this.ultrasonicSensorValue_ = 0;

  /** @type {float} */
  this.lightSensorValue_ = 0;

  /** @type {boolean} */
  this.isLineFollowerLeftBlack_ = false;

  /** @type {boolean} */
  this.isLineFollowerRightBlack_ = false;
};

/**
 * get left line follower value
 * @return {boolean} left line follower value
 * @export
 */
cwc.protocol.mbot.Monitoring.prototype.isLineFollowerLeftBlack = function(){
  return this.isLineFollowerLeftBlack_;
}

/**
 * get right line follower value
 * @return {boolean} right line follower value
 * @export
 */
cwc.protocol.mbot.Monitoring.prototype.isLineFollowerRightBlack = function(){
  return this.isLineFollowerRightBlack_;
}

/**
 * get ultrasonic sensor value
 * @return {float} ultrasonic sensor value
 * @export
 */
cwc.protocol.mbot.Monitoring.prototype.ultrasonicValue = function(){
  return this.ultrasonicValue_;
}

/**
 * get lightness sensor value
 * @return {float} lightness sensor value
 * @export
 */
cwc.protocol.mbot.Monitoring.prototype.lightSensorValue = function(){
  return this.lightSensorValue_;
}

/**
 * start sending reading sensor signals.
 * @return {void}
 * @export
 */
cwc.protocol.mbot.Monitoring.prototype.start = function(){
  this.monitorTimer = setInterval(this.onReadSensorTimer, this.readInterval);
}

/**
 * stop sending reading sensor signals.
 * @return {void}
 * @export
 */
cwc.protocol.mbot.Monitoring.prototype.stop = function(){
  if (this.monitorTimer) {
    clearInterval(this.monitorTimer);
    this.monitorTimer = null;
  }
}

/**
 * every 50ms, ask robot about sensor status;
 * cycle through ultrasonic, lightness, and line follower
 * @return {void}
 * @private
 */
cwc.protocol.mbot.Monitoring.prototype.onReadSensorTimer = function(){
  var readIndex = this.readIndex % this.availableSensors.length;
  switch (this.availableSensors[readIndex]) {
    case this.command.DEVICE_ULTRASONIC:
      this.api.sendReadCommandToRobot(this.command.DEVICE_ULTRASONIC, readIndex, this.command.PORT_ULTRASONIC);
      break;
    case this.command.DEVICE_LIGHTSENSOR:
      this.api.sendReadCommandToRobot(this.command.DEVICE_LIGHTSENSOR, readIndex, this.command.PORT_LIGHTSENSOR);
      break;
    case this.command.DEVICE_LINEFOLLOWER:
      this.api.sendReadCommandToRobot(this.command.DEVICE_LINEFOLLOWER, readIndex, this.command.PORT_LINEFOLLOWER);
      break;
  }
  this.readIndex++;
}

/**
 * called by api, update realtime sensor value
 * @param  {int}   index        index field of reply message
 * @param  {[int]} contentBytes content bytes
 * @return {null}
 * @export
 */
cwc.protocol.mbot.Monitoring.prototype.onSensorReply = function(index, contentBytes){
  switch(this.availableSensors[index]){
    case this.command.DEVICE_ULTRASONIC:
      this.ultrasonicSensorValue_ = this.parseFloatBytes(contentBytes);
      break;
    case this.command.DEVICE_LIGHTSENSOR:
      this.lightSensorValue_ = this.parseFloatBytes(contentBytes);
      break;
    case this.command.DEVICE_LINEFOLLOWER:
      var linefollerSum = contentBytes[2] + contentBytes[3];
      if (linefollerSum == this.command.LINEFOLLOWER_SUM_WHITE_WHITE) {
        this.isLineFollowerLeftBlack_ = 0;
        this.isLineFollowerRightBlack_ = 0;
      }
      else if (linefollerSum == this.command.LINEFOLLOWER_SUM_WHITE_BLACK) {
        this.isLineFollowerLeftBlack_ = 0;
        this.isLineFollowerRightBlack_ = 1;
      }
      else if (linefollerSum == this.command.LINEFOLLOWER_SUM_BLACK_WHITE) {
        this.isLineFollowerLeftBlack_ = 1;
        this.isLineFollowerRightBlack_ = 0;
      }
      else if (linefollerSum == this.command.LINEFOLLOWER_SUM_BLACK_BLACK) {
        this.isLineFollowerLeftBlack_ = 1;
        this.isLineFollowerRightBlack_ = 1;
      }
      break;
  }
}

/**
 * convert float bytes to float value in robot response;
 * @param  {[int]} dataBytes bytes from the robot
 * @return {float}           float value
 * @private
 */
cwc.protocol.mbot.Monitoring.prototype.parseFloatBytes = function(dataBytes) {
    var intValue = this.fourBytesToInt(dataBytes[3],dataBytes[2],dataBytes[1],dataBytes[0]);
    var result = parseFloat(this.intBitsToFloat(intValue).toFixed(2));

    return result;
};

/**
 * convert four bytes (b4b3b2b1) to a single int.
 * @param  {int} b1
 * @param  {int} b2
 * @param  {int} b3
 * @param  {int} b4
 * @return {int}    the result int
 * @private
 */
cwc.protocol.mbot.Monitoring.prototype.fourBytesToInt = function(b1,b2,b3,b4 ) {
    return ( b1 << 24 ) + ( b2 << 16 ) + ( b3 << 8 ) + b4;
};

/**
 * convert from int (in byte form) to float
 * @param  {int} num   the input int value
 * @return {float}     the result as float
 * @private
 */
cwc.protocol.mbot.Monitoring.prototype.intBitsToFloat = function(num) {
    /* s 为符号（sign）；e 为指数（exponent）；m 为有效位数（mantissa）*/
    s = ( num >> 31 ) == 0 ? 1 : -1,
    e = ( num >> 23 ) & 0xff,
    m = ( e == 0 ) ?
    ( num & 0x7fffff ) << 1 :
    ( num & 0x7fffff ) | 0x800000;
    return s * m * Math.pow( 2, e - 150 );
};
