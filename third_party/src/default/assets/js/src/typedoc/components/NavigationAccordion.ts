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

function renderSimpleHTMLRecursive(obj: object, package: string = '', spacing: string = '&emsp;'): string {
  let html = ''
  const shownPackages = []
  for (const key of Object.keys(obj)) {
      if (typeof obj[key] == 'object') {
          // is an object
          // html += key + '<br>' + spacing + renderHTMLRecursive(obj[key], package + '_' + key, spacing + '&emsp;')
          html += renderHTMLRecursive(obj[key], package + '_' + key, spacing + '&emsp;')
      } else {
          if (shownPackages.indexOf(package) === -1) {
              html += `<div>${package.replace(/_/g, '/')}</div>`
              shownPackages.push(package)
          }
          let href = ''
          if (window.location.href.indexOf('modules') == -1) {
            href = 'modules/'
          }
          if (window.location.href.indexOf('interfaces') > -1 ||
              window.location.href.indexOf('assets') > -1 ||
              window.location.href.indexOf('classes') > -1) {
                href = '../modules/'
          }
          if (package) {
            if (key === 'Overview') {
              // If this is the key, we use a simpler page structure
              href += `${package.substr(1)}.html`
            } else {
              href += `${package.substr(1)}_${key}.html`
            }
          } else {
            href += `${key}.html`
          }
          html += `<a href='${href}'>${key}</a>`
      }
  }
  return html
}

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
            
            if (window.location.href.indexOf('interfaces') > -1 ||
                window.location.href.indexOf('assets') > -1 ||
                window.location.href.indexOf('modules') > -1 ||
                window.location.href.indexOf('classes') > -1) {
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
  if (document.querySelector('.tsd-navigation.outline')) {
    // Get JSON from element
    const filter = '.tsd-navigation ul'
    const outlineElement: HTMLElement = document.querySelector(filter)
    const outline = JSON.parse(outlineElement.innerHTML)[0]
    outlineElement.innerHTML = renderHTMLRecursive(outline)
    outlineElement.style.display = 'block'
  } else {
    // Get all of the navigation modules
    const filter = '.tsd-navigation .tsd-kind-external-module > a'
    const modules = document.querySelectorAll(filter) as NodeListOf<HTMLAnchorElement>
    const hierarchy = {}
    Array.from(modules).forEach(m => {
        const packageArr = m.innerText.split('/');
        const nestedArr = arrayToNest(packageArr);
        mergeRecursive(hierarchy, nestedArr)
    })
    const listItemFilter = '.tsd-navigation .tsd-kind-external-module'
    const listItems = document.querySelectorAll(listItemFilter) as NodeListOf<HTMLElement>
    Array.from(listItems).forEach(el => {
        el.remove()
    })
    const navigationFilter = '.tsd-navigation ul'
    document.querySelector(navigationFilter).innerHTML += renderSimpleHTMLRecursive(hierarchy)
  }
})