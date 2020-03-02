module typedoc {
  function getVendorInfo(tuples) {
    for (const name in tuples) {
      if (!tuples.hasOwnProperty(name)) {
        continue
      }
      if (typeof (document.body.style[name]) !== 'undefined') {
        return { name, endEvent: tuples[name] }
      }
    }
    return null
  }


  export let transition = getVendorInfo({
    transition: 'transitionend',
    OTransition: 'oTransitionEnd',
    msTransition: 'msTransitionEnd',
    MozTransition: 'transitionend',
    WebkitTransition: 'webkitTransitionEnd',
  })


  export function noTransition($el, callback) {
    $el.addClass('no-transition')
    callback()
    $el.offset()
    $el.removeClass('no-transition')
  }


  export function animateHeight($el: JQuery, callback: Function,
      success?: Function) {
    const from = $el.height()
    let to
    noTransition($el, () => {
      callback()

      $el.css('height', '')
      to = $el.height()
      if (from !== to && transition) $el.css('height', from)
    })

    if (from !== to && transition) {
      $el.css('height', to)
      $el.on(transition.endEvent, () => {
        noTransition($el, () => {
          $el.off(transition.endEvent).css('height', '')
          if (success) success()
        })
      })
    } else {
      if (success) success()
    }
  }
}
