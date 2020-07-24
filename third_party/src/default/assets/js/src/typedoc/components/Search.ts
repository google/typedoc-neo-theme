/// <reference types='lunr' />

declare module typedoc.search {
  interface IDocument {
    id:number
    kind:number
    name:string
    url:string
    classes:string
    parent?:string
  }

  interface IData {
    kinds:{[kind:number]:string}
    rows:IDocument[]
    index:object;
  }

  let data:IData
}

module typedoc.search {
  /**
   * Loading state definitions.
   */
  enum SearchLoadingState {
    Idle, Loading, Ready, Failure,
  }

  /**
   * The element holding the search widget and results.
   */
  const $el:JQuery = $('#tsd-search')

  /**
   * The input field of the search widget.
   */
  const $field:JQuery = $('#tsd-search-field')

  /**
   * The result list wrapper.
   */
  const $results:JQuery = $('.results')

  /**
   * The base url that must be prepended to the indexed urls.
   */
  const base:string = $el.attr('data-base') + '/'

  /**
   * The current query string.
   */
  let query = ''

  /**
   * The state the search is currently in.
   */
  let loadingState:SearchLoadingState = SearchLoadingState.Idle

  /**
   * Is the input field focused?
   */
  let hasFocus = false

  /**
   * Should the next key press be prevents?
   */
  let preventPress = false

  /**
   * The lunr index used to search the documentation.
   */
  let index:lunr.Index

  /**
   * Has a search result been clicked?
   * Used to stop the results hiding before a user can fully click on a result.
   */
  let resultClicked = false

  /**
   * When the search system initializes, pull our priority results and put them
   * in an array to access later.
   */
  function initializePriorityResults() {
    const priorityResultsDom: Node[] =
      Array.from(document.querySelectorAll(`.results-priority li`))
    this.priorityResults = priorityResultsDom.map((node: Node) => {
      const element = node as HTMLElement
      return {
        name: element.dataset['name'],
        subtitle: element.dataset['subtitle'],
      }
    })
  }

  /**
   * Lazy load the search index and parse it.
   */
  function loadIndex() {
    if (loadingState != SearchLoadingState.Idle || data) return;

    setTimeout(() => {
      if (loadingState == SearchLoadingState.Idle) {
        setLoadingState(SearchLoadingState.Loading);
      }
    }, 500);

    const url = $el.attr('data-index');
    if (!url) {
      setLoadingState(SearchLoadingState.Failure);
      return;
    }
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('The search index is missing');
        }

        return response.json();
      })
      .then((source: IData) => {
        data = source;
        index = lunr.Index.load(source.index);

        initializePriorityResults();
        setLoadingState(SearchLoadingState.Ready);
      })
      .catch((error) => {
        setLoadingState(SearchLoadingState.Failure);
      });
  }

  /**
   * Update the visible state of the search control.
   */
  function updateResults() {
    // Mediate the search order to highlight priority results
    const priorityResults = []
    const otherResults = []

    if (loadingState !== SearchLoadingState.Ready) return
    $results.empty()

    const res = index.search(query)
    for (let i = 0, c = Math.min(10, res.length); i < c; i++) {
      const row = data.rows[res[i].ref]
      let name = row.name
      const fullName = `${row.parent}.${name}`
      if (row.parent) name = `<span class="parent">${row.parent}.</span>${name}`

      // See if this is a high-priority search result
      let priority = false
      for (const result of this.priorityResults) {
        // Perform regex search against priority results array.
        // This allows priority results to be regular expressions.
        if (fullName.match(result.name)) {
          priorityResults.push(`<li class="${row.classes}">` +
            `<a href="${base}${row.url}" class="tsd-kind-icon">${name}&emsp;|` +
            `&emsp;${result.subtitle}&emsp;|` +
            `&emsp;${getKind(row.classes)}</li>`)
          priority = true
          break
        }
      }
      if (!priority) {
        otherResults.push(`<li class="${row.classes} low-priority"><a href="${base}${row.url}">${name}</li>`)
      }
    }

    // Reconstruct the order of results
    for (const result of priorityResults) {
      $results.append(result)
    }
    for (const result of otherResults) {
      $results.append(result)
    }
  }

  function getKind(classes: string): string {
    if (classes.indexOf('tsd-kind-class') > -1) {
      return 'Class'
    } else if (classes.indexOf('tsd-kind-interface') > -1) {
      return 'Interface'
    } else if (classes.indexOf('tsd-kind-property') > -1) {
      return 'Property'
    } else if (classes.indexOf('tsd-kind-method') > -1) {
      return 'Method'
    } else if (classes.indexOf('tsd-kind-type-alias') > -1) {
      return 'Type'
    } else if (classes.indexOf('tsd-kind-function') > -1) {
      return 'Function'
    } else if (classes.indexOf('tsd-kind-external-module') > -1) {
      return 'Module'
    }
  }

  /**
   * Set the loading state and update the visual state accordingly.
   */
  function setLoadingState(value:SearchLoadingState) {
    if (loadingState === value) return

    $el.removeClass(SearchLoadingState[loadingState].toLowerCase())
    loadingState = value
    $el.addClass(SearchLoadingState[loadingState].toLowerCase())

    if (value === SearchLoadingState.Ready) {
      updateResults()
    }
  }

  /**
   * Set the focus state and update the visual state accordingly.
   */
  function setHasFocus(value:boolean) {
    if (hasFocus === value) return
    hasFocus = value
    $el.toggleClass('has-focus')

    if (!value) {
      $field.val(query)
    } else {
      setQuery('')
      $field.val('')
    }
  }

  /**
   * Set the query string and update the results.
   */
  function setQuery(value:string) {
    query = $.trim(value)
    updateResults()
  }

  /**
   * Move the highlight within the result set.
   */
  function setCurrentResult(dir:number) {
    const $current = $results.find('.current')
    if ($current.length === 0) {
      $results.find(dir === 1 ? 'li:first-child' : 'li:last-child').addClass('current')
    } else {
      const $rel = dir === 1 ? $current.next('li') : $current.prev('li')
      if ($rel.length > 0) {
        $current.removeClass('current')
        $rel.addClass('current')
      }
    }
  }

  /**
   * Navigate to the highlighted result.
   */
  function gotoCurrentResult() {
    let $current = $results.find('.current')

    if ($current.length === 0) {
      $current = $results.find('li:first-child')
    }

    if ($current.length > 0) {
      window.location.href = $current.find('a').prop('href')
      $field.blur()
    }
  }

  /**
   * Intercept mousedown and mouseup events so we can correctly
   * handle clicking on search results
   */
  $results
    .on('mousedown', () => {
      resultClicked = true
    })
    .on('mouseup', () => {
      resultClicked = false
      setHasFocus(false)
    })

  /**
   * Bind all required events on the input field.
   */
  $field.on('focusin', () => {
    setHasFocus(true)
    loadIndex()
  }).on('focusout', () => {
    // If the user just clicked on a search result, then
    // don't lose the focus straight away, as this prevents
    // them from clicking the result and following the link
    if(resultClicked) {
      resultClicked = false
      return
    }

    setTimeout(() => setHasFocus(false), 100)
  }).on('input', () => {
    setQuery($.trim($field.val()))
  }).on('keydown', (e:JQueryKeyEventObject) => {
    if (e.keyCode === 13 || e.keyCode === 27 ||
        e.keyCode === 38 || e.keyCode === 40) {
      preventPress = true
      e.preventDefault()

      if (e.keyCode === 13) {
        gotoCurrentResult()
      } else if (e.keyCode === 27) {
        $field.blur()
      } else if (e.keyCode === 38) {
        setCurrentResult(-1)
      } else if (e.keyCode === 40) {
        setCurrentResult(1)
      }
    } else {
      preventPress = false
    }
  }).on('keypress', (e) => {
    if (preventPress) e.preventDefault()
  })

  /**
   * Start searching by pressing a key on the body.
   */
  $('body').on('keydown', (e:JQueryKeyEventObject) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return
    if (!hasFocus && e.keyCode > 47 && e.keyCode < 112) {
      $field.focus()
    }
  })
}
