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

// Split up modules by '/' and indent them to denote the hierarchy

// For compatibility
// https://stackoverflow.com/questions/36713651/typescript-array-from-error-ts2339-property-from-does-not-exist-on-type
interface ArrayConstructor {
    from(arrayLike: any, mapFn?, thisArg?): Array<any>;
}

// https://codereview.stackexchange.com/questions/166160/convert-an-array-to-a-nested-object
function arrayToNest(array: Array<string>): object {
    let res: object = {}
    for(let i: number = array.length - 1; i >= 0 ; i--) {
        if(i == array.length - 1)
          res = { [array[i]] : array[i]}; // assign the value
        else
          res = { [array[i]] : res}; // put the prev object
    }
    return res
}

/*
* Recursively merge properties of two objects
* https://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
*/
function mergeRecursive(obj1: object, obj2: object): object {
    for (const p in obj2) {
      try {
        // Property in destination object set; update its value.
        if (obj2[p].constructor == Object) {
          if (obj1[p].constructor !== Object) {
            // Convert string value to object value
            // Store top-level values as 'Overview'
            obj1[p] = {
              Overview: obj1[p]
            }
          }
          obj1[p] = mergeRecursive(obj1[p], obj2[p]);

        } else {
          obj1[p] = obj2[p];
        }
      } catch(e) {
        // Property in destination object not set; create it and set its value.
        obj1[p] = obj2[p];
      }
    }
    return obj1;
}

/**
 * For SimpleHTMLRecursive (no custom outline), follow the sanitization of the URL to correctly
 * link to what the HTML rendering should have. This useful in cases where a name may be separated
 * by a character like a dash.
 *
 * See https://github.com/TypeStrong/typedoc/blob/14d23b8f13ec9f432ce88c1514326be459af3ccf/src/lib/models/reflections/abstract.ts#L436
 */
function sanitizeModuleName(moduleName: string): string {
  return moduleName.toLowerCase().replace(/[^a-z0-9]/gi, '_')
}

/**
 * Rendering left-hand side outline when custom outline is not available in typedoc.json
 *
 * @param obj List of modules
 * @param package The current parent name
 * @param spacing The current spacing, to display a hierarchy appropriately
 * @return HTML for the left-hand side outline as a string
 */
function renderSimpleHTMLRecursive(obj: object, package: string = '', spacing: string = '&emsp;'): string {
  let html = ''
  const shownPackages = []
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'object') {
      // As this is an object, traversal will continue
      html += renderSimpleHTMLRecursive(obj[key], package + '_' + key, spacing + '&emsp;')
    } else {
      if (shownPackages.indexOf(package) === -1) {
          html += `<div>${package.replace(/_/g, '/')}</div>`
          shownPackages.push(package)
      }
      let href = ''
      if (window.location.href.indexOf('modules') == -1) {
        href = 'modules/'
      }
      if (window.location.href.indexOf('assets') > -1 ||
          window.location.href.indexOf('classes') > -1 ||
          window.location.href.indexOf('enums') > -1 ||
          window.location.href.indexOf('interfaces') > -1 ||
          window.location.href.indexOf('modules') > -1) {
            // Navigate one step up
            href = `../${href}`
      }
      if (package) {
        if (key === 'Overview') {
          // If this is the key, use a simpler page structure
          href += `_${package.substr(1)}_.html`
        } else {
          href += `_${package.substr(1)}_${sanitizeModuleName(key)}_.html`
        }
      } else {
        href += `_${sanitizeModuleName(key)}_.html`
      }
      html += `<a href='${href}'>${key}</a>`
    }
  }
  return html
}

/**
 * Rendering left-hand side outline when custom outline is provided
 *
 * @param obj List of modules
 * @param package The current parent name
 * @param spacing The current spacing, to display a hierarchy appropriately
 * @return HTML for the left-hand side outline as a string
 */
function renderHTMLRecursive(obj: object, package: string = '', spacing: string = '&emsp;'): string {
    let html = ''
    const shownPackages = []
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] == 'object') {
        // is an object
        html += renderHTMLRecursive(obj[key], package + '_' + key, spacing + '&emsp;')
      } else {
        if (shownPackages.indexOf(package) === -1) {
            html += `<div>${package.replace(/_/g, '/').substr(1)}</div>`
            shownPackages.push(package)
        }
        let href = ''
        if (obj[key].indexOf('/') === -1) {
          // If the user provides a simple string, like
          // "Overview": "module_name"
          // It will navigate to "modules/module_name.html"
          href = 'modules/'

          // If the user wants a different kind of page, like
          // "Overview": "interfaces/interface_name"
          // This should navigate to "interfaces/interface_name.html"
        }
        
        if (window.location.href.indexOf('assets') > -1 ||
            window.location.href.indexOf('classes') > -1 ||
            window.location.href.indexOf('enums') > -1 ||
            window.location.href.indexOf('interfaces') > -1 ||
            window.location.href.indexOf('modules') > -1) {
              // Navigate one step up
              href = `../${href}`
        }
        // Check if the user is currently on this page. If so, bold this item.
        const pageName = href + obj[key]
        // Remove any "../" to get a valid page file.
        const pageNamePath = `${pageName.replace("../", '')}.html`
        if (window.location.href.indexOf(pageNamePath) > -1) {
          html += `<a class="selected" href='${pageName}.html'>${key}</a>`
        } else {
          html += `<a href='${pageName}.html'>${key}</a>`
        }
      }
    }
    return html
}

window.addEventListener('load', () => {
  // This element will exist if there is a custom outline defined
  if (document.querySelector('.tsd-navigation.outline')) {
    // Get JSON from element
    const filter = '.tsd-navigation ul'
    const outlineElement: HTMLElement = document.querySelector(filter)
    const outline = JSON.parse(outlineElement.innerHTML)
    outlineElement.innerHTML = renderHTMLRecursive(outline)
    outlineElement.style.display = 'block'
  } else {
    // Get all of the navigation modules as part of a generic outline
    const filter = '.tsd-navigation .tsd-kind-external-module > a'
    const modules = document.querySelectorAll(filter) as NodeListOf<HTMLAnchorElement>
    const hierarchy = {}
    Array.from(modules).forEach(m => {
        const packageArr = m.innerText.split('/');
        const nestedArr = arrayToNest(packageArr);
        mergeRecursive(hierarchy, nestedArr)
    })
    // Delete existing HTML elements that were auto-generated
    const listItemFilter = '.tsd-navigation .tsd-kind-external-module'
    const listItems = document.querySelectorAll(listItemFilter) as NodeListOf<HTMLElement>
    Array.from(listItems).forEach(el => {
        el.remove()
    })
    // Update the contents of the outline based on the new hierarchy
    const navigationFilter = '.tsd-navigation ul'
    document.querySelector(navigationFilter).innerHTML += renderSimpleHTMLRecursive(hierarchy)
  }
})