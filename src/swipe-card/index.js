/* global WebKitCSSMatrix */

import React from 'react'
import sleep from 'p-sleep'

const settings = {
  snapBackDuration: 300,
  maxTilt: 5,
  bouncePower: 0.085,
  swipeThreshold: 300 // px/s
}

const getElementSize = (elementRef) => {
  const elementStyles = window.getComputedStyle(elementRef)
  const widthString = elementStyles.getPropertyValue('width')
  const width = Number(widthString.split('px')[0])
  const heightString = elementStyles.getPropertyValue('height')
  const height = Number(heightString.split('px')[0])
  return { x: width, y: height }
}

const pythagoras = (x, y) => {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
}

const normalize = (vector, multiplier = 1) => {
  const length = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2))
  return { x: vector.x * multiplier / length, y: vector.y * multiplier / length }
}

const animateOut = async (elementRef, speed, easeIn = false) => {
  const startPos = getTranslate(elementRef)
  const bodySize = getElementSize(document.body)
  const diagonal = pythagoras(bodySize.x, bodySize.y)

  const velocity = pythagoras(speed.x, speed.y)
  // const time = diagonal / velocity
  const time = 0.6
  const multiplier = diagonal / velocity
  // const translateString = translationString(speed.x * multiplier + startPos.x, -speed.y * multiplier + startPos.y)
  const translateString = translationString((speed.x * multiplier + startPos.x) >= 0 ? 850 : -850, 0)
  let rotateString = ''

  // const rotationPower = 200
  if (easeIn) {
    elementRef.style.transition = 'ease ' + time + 's'
  } else {
    elementRef.style.transition = 'ease-out ' + time + 's'
  }

  if (getRotation(elementRef) === 0) {
    // rotateString = rotationString((Math.random() - 0.5) * rotationPower)
    rotateString = rotationString(Math.random() > 0.5 ? 15 : -15)
  } else {
    rotateString = rotationString(getRotation(elementRef) > 0 ? 15 : -15)
  }

  elementRef.style.transform = translateString + rotateString

  await sleep(time * 500)
}

const animateBack = async (elementRef) => {
  elementRef.style.transition = settings.snapBackDuration + 'ms'
  // const startingPoint = getTranslate(elementRef)
  // const translation = translationString(startingPoint.x * -settings.bouncePower, startingPoint.y * -settings.bouncePower)
  // const rotation = rotationString(getRotation(elementRef) * -settings.bouncePower)
  // elementRef.style.transform = translation // + rotation

  await sleep(settings.snapBackDuration * 0.75)
  elementRef.style.transform = 'none'

  await sleep(settings.snapBackDuration)
  elementRef.style.transition = '200ms'
}

const getSwipeDirection = (property) => {
  if (Math.abs(property.x) > Math.abs(property.y)) {
    if (property.x > settings.swipeThreshold) {
      return 'right'
    } else if (property.x < -settings.swipeThreshold) {
      return 'left'
    }
  } else {
    if (property.y > settings.swipeThreshold) {
      return 'up'
    } else if (property.y < -settings.swipeThreshold) {
      return 'down'
    }
  }
  return 'none'
}

const calcSpeed = (oldLocation, newLocation) => {
  const dx = newLocation.x - oldLocation.x
  const dy = oldLocation.y - newLocation.y
  const dt = (newLocation.time - oldLocation.time) / 1000
  return { x: dx / dt, y: dy / dt }
}

const translationString = (x, y) => {
  const translation = 'translate(' + x + 'px, ' + y + 'px)'
  return translation
}

const rotationString = (rot) => {
  const rotation = 'rotate(' + rot + 'deg)'
  return rotation
}

const getTranslate = (elementRef) => {
  const style = window.getComputedStyle(elementRef)
  const matrix = new WebKitCSSMatrix(style.webkitTransform)
  const ans = { x: matrix.m41, y: -matrix.m42 }
  return ans
}

const getRotation = (elementRef) => {
  const style = window.getComputedStyle(elementRef)
  const matrix = new WebKitCSSMatrix(style.webkitTransform)
  const ans = -Math.asin(matrix.m21) / (2 * Math.PI) * 360
  return ans
}

const dragableTouchmove = (coordinates, elementRef, offset, lastLocation) => {
  const pos = { x: coordinates.x + offset.x, y: coordinates.y + offset.y }
  const newLocation = { x: pos.x, y: pos.y, time: new Date().getTime() }
  const translation = translationString(pos.x, pos.y)
  // const rotCalc = calcSpeed(lastLocation, newLocation).x / 1000
  // const rotation = rotationString(rotCalc * settings.maxTilt)
  const rotation = rotationString(newLocation.x > 0 ? 3 : -3)
  elementRef.style.transform = translation + rotation
  return newLocation
}

const touchCoordinatesFromEvent = (e) => {
  const touchLocation = e.targetTouches[0]
  return { x: touchLocation.clientX, y: touchLocation.clientY }
}

const mouseCoordinatesFromEvent = (e) => {
  return { x: e.clientX, y: e.clientY }
}

const SwipeCard = React.forwardRef((
  { flickOnSwipe = true,
    children,
    onSwipe,
    onClick,
    setIsClick,
    onCardLeftScreen,
    className,
    preventSwipe = [],
    swipeRequirementType = 'velocity',
    swipeThreshold = settings.swipeThreshold,
    onSwipeRequirementFulfilled,
    onSwipeRequirementUnfulfilled,
  }, ref) => {
  settings.swipeThreshold = swipeThreshold
  const swipeAlreadyReleased = React.useRef(false)

  const elementRef = React.useRef()

  React.useImperativeHandle(ref, () => ({
    async swipe(dir = 'right') {
      if (onSwipe) onSwipe(dir)
      const power = 1000
      const disturbance = (Math.random() - 0.5) * 100
      if (dir === 'right') {
        await animateOut(elementRef.current, { x: power, y: disturbance }, true)
      } else if (dir === 'left') {
        await animateOut(elementRef.current, { x: -power, y: disturbance }, true)
      } else if (dir === 'up') {
        await animateOut(elementRef.current, { x: disturbance, y: power }, true)
      } else if (dir === 'down') {
        await animateOut(elementRef.current, { x: disturbance, y: -power }, true)
      }
      elementRef.current.style.display = 'block'
      if (onCardLeftScreen) onCardLeftScreen(dir)
    },
    async restoreCard() {
      elementRef.current.style.display = 'block'
      await animateBack(elementRef.current)
    }
  }))

  const handleSwipeReleased = React.useCallback(async (elementRef, speed) => {
    if (swipeAlreadyReleased.current) { return }
    swipeAlreadyReleased.current = true

    const currentPostion = getTranslate(elementRef)
    // Check if this is a swipe
    const dir = getSwipeDirection(swipeRequirementType === 'velocity' ? speed : currentPostion)

    if (dir !== 'none') {
      if (onSwipe) onSwipe(dir)

      if (flickOnSwipe) {
        if (!preventSwipe.includes(dir)) {
          const outVelocity = swipeRequirementType === 'velocity' ? speed : normalize(currentPostion, 600)
          await animateOut(elementRef, outVelocity, true)
          elementRef.style.display = 'block'
          if (onCardLeftScreen) {
            elementRef.style.transform = 'unset'
            // elementRef.style.transition = 'unset'
            onCardLeftScreen(dir)
          }
          return
        }
      }
    }

    // Card was not flicked away, animate back to start
    animateBack(elementRef)
  }, [swipeAlreadyReleased, flickOnSwipe, onSwipe, onCardLeftScreen, preventSwipe, swipeRequirementType])

  const handleSwipeStart = React.useCallback(() => {
    swipeAlreadyReleased.current = false
  }, [swipeAlreadyReleased])

  React.useLayoutEffect(() => {
    let offset = { x: null, y: null }
    let speed = { x: 0, y: 0 }
    let lastLocation = { x: 0, y: 0, time: new Date().getTime() }
    let mouseIsClicked = false
    let swipeThresholdFulfilledDirection = 'none'
    let start = new Date()
    let end = new Date()

    elementRef.current.addEventListener(('touchstart'), (ev) => {
      handleSwipeStart()
      offset = { x: -touchCoordinatesFromEvent(ev).x, y: -touchCoordinatesFromEvent(ev).y }
    })

    elementRef.current.addEventListener(('touchend'), (ev) => {
      handleSwipeReleased(elementRef.current, speed)
    })

    elementRef.current.addEventListener(('mousedown'), (ev) => {
      ev.preventDefault()
      mouseIsClicked = true
      start = new Date()
      handleSwipeStart()
      offset = { x: -mouseCoordinatesFromEvent(ev).x, y: -mouseCoordinatesFromEvent(ev).y }
    })

    const handleMove = (coordinates) => {
      // Check fulfillment
      if (onSwipeRequirementFulfilled || onSwipeRequirementUnfulfilled) {
        const dir = getSwipeDirection(swipeRequirementType === 'velocity' ? speed : getTranslate(elementRef.current))
        if (dir !== swipeThresholdFulfilledDirection) {
          swipeThresholdFulfilledDirection = dir
          if (swipeThresholdFulfilledDirection === 'none') {
            if (onSwipeRequirementUnfulfilled) onSwipeRequirementUnfulfilled()
          } else {
            if (onSwipeRequirementFulfilled) onSwipeRequirementFulfilled(dir)
          }
        }
      }

      // Move
      const newLocation = dragableTouchmove(coordinates, elementRef.current, offset, lastLocation)
      speed = calcSpeed(lastLocation, newLocation)
      lastLocation = newLocation
    }

    elementRef.current.addEventListener(('touchmove'), (ev) => {

      ev.preventDefault()
      handleMove(touchCoordinatesFromEvent(ev))
    })

    elementRef.current.addEventListener(('mousemove'), (ev) => {


      ev.preventDefault()
      if (mouseIsClicked) {
        handleMove(mouseCoordinatesFromEvent(ev))
      }
    })



    elementRef.current.addEventListener(('mouseup'), (ev) => {


      if (mouseIsClicked) {
        ev.preventDefault()
        mouseIsClicked = false
        end = new Date()
        const isOneClick = (end - start) <= 127

        setIsClick(isOneClick)

        handleSwipeReleased(elementRef.current, speed)
      }
    })

    elementRef.current.addEventListener(('mouseleave'), (ev) => {

      if (mouseIsClicked) {
        ev.preventDefault()
        mouseIsClicked = false
        handleSwipeReleased(elementRef.current, speed)
      }
    })
    return () => {

    }
  }, [
    handleSwipeReleased,
    handleSwipeStart,
    onSwipeRequirementFulfilled,
    onSwipeRequirementUnfulfilled,
    swipeRequirementType,
    setIsClick,
  ]) // TODO fix so swipeRequirementType can be changed on the fly. Pass as dependency cleanup eventlisteners and update new eventlisteners.

  return (
    <div
      onClick={onClick}
      // onClick={() => 
      ref={elementRef}
      className={className}
    >
      {children}
    </div>
  )
})

export default SwipeCard
