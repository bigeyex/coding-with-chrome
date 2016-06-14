/**
 * @fileoverview General-purpose Byte Tools.
 *
 * @license Copyright 2016 Google Inc. All Rights Reserved.
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
goog.provide('cwc.utils.ByteTools');


/**
 * @param {Object} data
 * @return {number}
 */
cwc.utils.ByteTools.bytesToInt = function(data) {
  return data[0] << 8 | data[1];
};


/**
 * @param {Object} data
 * @return {number}
 */
cwc.utils.ByteTools.signedBytesToInt = function(data) {
  return (cwc.utils.ByteTools.bytesToInt(data) << 16) >> 16;
};


/**
 * @param {!Array} data
 * @return {!Uint8Array}
 */
cwc.utils.ByteTools.toUint8Array = function(data) {
  var dataLength = data.length;
  var dataBuffer = new Uint8Array(dataLength);
  for (var i=0; i < dataLength; i++) {
    dataBuffer[i] = data[i];
  }
  return dataBuffer;
};


/**
 * @param {!Uint8Array} data1
 * @param {!Uint8Array} data2
 * @return {!Uint8Array}
 */
cwc.utils.ByteTools.joinUint8Array = function(data1, data2) {
  var data = new Uint8Array(data1.length + data2.length);
  data.set(data1, 0);
  data.set(data2, data1.length);
  return data;
};


/**
 * @param {ArrayBuffer|Uint8Array} data
 * @param {Array=} opt_headers
 * @param {number=} opt_size
 * @param {ArrayBuffer|Uint8Array} opt_buffer
 * @return {Uint8Array} result
 */
cwc.utils.ByteTools.getUint8Data = function(data,
    opt_headers, opt_size, opt_buffer) {
  if (!data) {
    return null;
  }

  var dataView = data;
  if (dataView instanceof ArrayBuffer) {
    dataView = new Uint8Array(data);
  }

  // Data processing for data without headers.
  if (!opt_headers && !opt_size) {
    return dataView;
  }

  // Additional length checks if needed.
  if (opt_size) {

    // Perpend buffer if needed.
    if (opt_buffer && dataView.length < opt_size) {
      var buffer = opt_buffer;
      if (opt_buffer instanceof ArrayBuffer) {
        buffer =  new Uint8Array(opt_buffer);
      }
      dataView = cwc.utils.ByteTools.joinUint8Array(buffer, dataView);
    }

    if (dataView.length < opt_size) {
      return null;
    }
  }

  // Data processing for data with headers.
  if (opt_headers) {
    var headerPosition = cwc.utils.ByteTools.getHeaderPosition(dataView,
        opt_headers);
    if (headerPosition === null) {
      return null;
    }

    if (headerPosition !== 0) {
      dataView = dataView.slice(headerPosition);
    }
  }

  // Double check packet size to ignore chunks.
  if (opt_size && dataView.length < opt_size) {
    return null;
  }

  return dataView;
};


/**
 * Returns the header position in the given data stream.
 * @param {Uint8Array|Array} data
 * @param {Array} headers
 * @return {number}
 */
cwc.utils.ByteTools.getHeaderPosition = function(data, headers) {
  var headerPos = null;
  if (!data || !headers || data.length <= headers.length) {
    return headerPos;
  }
  var dataLen = data.length - 1;
  var headerLen = headers.length;
  var searchPos = data.indexOf(headers[0]);

  if (headerLen >= 2) {
    for (;searchPos !== -1; searchPos = data.indexOf(headers[0], searchPos)) {
      var foundHeaders = true;
      for (var i = 0; i < headerLen; i++) {
        if (data[searchPos + i] !== headers[i]) {
          foundHeaders = false;
        }
      }
      if (foundHeaders && searchPos + headerLen <= dataLen) {
        headerPos = searchPos;
        break;
      } else {
        searchPos++;
      }
    }
  } else if (headerLen == 1 && searchPos !== -1 && searchPos !== dataLen) {
    headerPos = searchPos;
  }
  return headerPos;
};
