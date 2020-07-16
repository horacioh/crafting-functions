import React from "react"
import { render } from "react-dom"

import {
  useBroadcaster,
  useListener,
  forOf,
  createTimeout,
} from "./broadcasters"
import {
  mapSequence,
  hardCode,
  targetValue,
  mapBroadcaster,
  waitFor,
} from "./operators"

import { pipe } from "lodash/fp"

//https://api.github.com/users/johnlindquist

let getURL = url => listener => {
  fetch(url)
    .then(response => {
      return response.json()
    })
    .then(json => {
      listener(json)
    })

  return () => {
    //cancel
  }
}

let cancel = getURL(
  "https://api.github.com/users/johnlindquist"
)(console.log)

console.log(cancel)

let delayMessage = value =>
  hardCode(value)(createTimeout(500))

let messageSequence = message =>
  mapSequence(delayMessage)(forOf(message.split(" ")))

let App = () => {
  let onInput = useListener()

  let inputValue = targetValue(onInput)

  let inputToMessage = pipe(
    waitFor(500),
    mapBroadcaster(messageSequence)
  )(inputValue)

  let state = useBroadcaster(inputToMessage)

  let profile = useBroadcaster(
    getURL("https://api.github.com/users/johnlindquist"),
    { login: "" }
  )

  return (
    <div>
      <input type="text" onInput={onInput} />
      <p>{state}</p>
      <p>{profile.login}</p>
    </div>
  )
}

render(<App></App>, document.querySelector("#root"))
