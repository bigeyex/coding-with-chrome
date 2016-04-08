/**
 * @fileoverview BUILD configuration for internal framework files.
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
var closureBuilder = require('closure-builder');
var glob = closureBuilder.globSupport();


closureBuilder.build({
  name: 'cwc.framework.Arduino',
  compress: true,
  srcs: glob([
    'src/frameworks/arduino/*.js'
  ]),
  deps: glob([
    'src/frameworks/runner/runner.js',
    'src/utils/*.js'
  ]),
  out: 'genfiles/frameworks/internal/arduino_framework.js'
});


closureBuilder.build({
  name: 'cwc.framework.Ev3',
  compress: true,
  srcs: glob([
    'src/frameworks/ev3/*.js'
  ]),
  deps: glob([
    'src/frameworks/runner/runner.js',
    'src/protocol/ev3/*.js',
    'src/utils/*.js'
  ]),
  out: 'genfiles/frameworks/internal/ev3_framework.js'
});


closureBuilder.build({
  name: 'cwc.framework.Sphero',
  compress: true,
  srcs: glob([
    'src/frameworks/sphero/*.js'
  ]),
  deps: glob([
    'src/frameworks/runner/runner.js',
    'src/utils/*.js'
  ]),
  out: 'genfiles/frameworks/internal/sphero_framework.js'
});

closureBuilder.build({
  name: 'cwc.framework.mbot',
  compress: true,
  srcs: glob([
    'src/frameworks/mbot/*.js'
  ]),
  deps: glob([
    'src/frameworks/runner/runner.js',
    'src/utils/*.js'
  ]),
  out: 'genfiles/frameworks/internal/mbot_framework.js'
});


closureBuilder.build({
  name: 'cwc.framework.Turtle',
  compress: true,
  srcs: glob([
    'src/frameworks/turtle/*.js'
  ]),
  deps: glob([
    'src/frameworks/runner/runner.js',
    'src/utils/*.js'
  ]),
  externs: [
    'build/externs/jquery.js'
  ],
  out: 'genfiles/frameworks/internal/turtle_framework.js'
});


closureBuilder.build({
  name: 'cwc.framework.TTS',
  compress: true,
  srcs: glob([
    'src/frameworks/tts/*.js'
  ]),
  deps: glob([
    'src/frameworks/runner/runner.js',
    'src/utils/*.js'
  ]),
  out: 'genfiles/frameworks/internal/tts_framework.js'
});


closureBuilder.build({
  name: 'cwc.framework.Runner',
  compress: true,
  srcs: glob([
    'src/frameworks/runner/*.js'
  ]),
  deps: glob([
    'src/utils/*.js'
  ]),
  out: 'genfiles/frameworks/internal/runner_framework.js'
});


closureBuilder.build({
  name: 'cwc.framework.simple.Loader',
  compress: true,
  srcs: glob([
    'src/frameworks/simple/*.js'
  ]),
  deps: glob([
    'src/config/config.js',
    'src/frameworks/runner/runner.js',
    'src/utils/*.js'
  ]),
  out: 'genfiles/frameworks/internal/simple_framework.js'
});
