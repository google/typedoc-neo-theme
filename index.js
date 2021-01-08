/**
 * Copyright 2019 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let { ParameterType } = require('typedoc/dist/lib/utils/options/declaration');
let plugin = require('./bin/default/plugin')
module.exports = (PluginHost) => {
  const app = PluginHost.owner
  /*
   * Expected array:
   *  interface Link {
   *    label: string
   *    url: string
   *  }
   */
  app.options.addDeclaration({ name: 'links', type: ParameterType.Mixed })
  /*
   * Expected array:
   *  interface Outline {
   *    [key: string]: string | Outline
   *  }
   */
  app.options.addDeclaration({ name: 'outline', type: ParameterType.Mixed })
  /*
   * Expected array:
   *  interface Search {
   *    name: string
   *    subtitle: string
   *  }
   */
  app.options.addDeclaration({ name: 'search', type: ParameterType.Mixed })
  /*
   * Expected array:
      interface Source {
        path: string, eg: https://github.com/actions-on-google/actions-on-google-nodejs/blob/master/src/
        line: string, eg: L
        // Becomes https://github.com/actions-on-google/actions-on-google-nodejs/blob/master/src/assistant.ts#L1
      }
   */
  app.options.addDeclaration({ name: 'source', type: ParameterType.Mixed })
  /**
   * Expected array of source files to be loaded in <head>:
   * interface CustomScript {
   *   path: string
   * }
   */
  app.options.addDeclaration({ name: 'customScripts', type: ParameterType.Mixed })
  /**
   * Expected array of style files to be loaded in <head>:
   * interface CustomStyle {
   *   path: string
   * }
   */
  app.options.addDeclaration({ name: 'customStyles', type: ParameterType.Mixed })

  app.converter.addComponent('neo-theme', plugin.ExternalModuleMapPlugin)
}
