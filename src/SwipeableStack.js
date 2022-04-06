import React, { createRef, useState, useMemo } from 'react'
import SwipeCard from './swipe-card/index'

const db = [
  {
    id: 9,
    name: 'Card - 9',
    url: './img/card-9.jpeg'
  },
  {
    id: 8,
    name: 'Card - 8',
    url: './img/card-8.jpeg'
  },
  {
    id: 7,
    name: 'Card - 7',
    url: './img/card-7.jpeg'
  },
  {
    id: 6,
    name: 'Card - 6',
    url: './img/card-6.jpeg'
  },
  {
    id: 5,
    name: 'Card - 5',
    url: './img/card-5.jpeg'
  },
  {
    id: 4,
    name: 'Card - 4',
    url: './img/card-4.jpeg'
  },
  {
    id: 3,
    name: 'Card - 3',
    url: './img/card-3.jpeg'
  },
  {
    id: 2,
    name: 'Card - 2',
    url: './img/card-2.jpeg'
  },
  {
    id: 1,
    name: 'Card - 1',
    url: './img/card-1.jpeg'
  }
]

function SwipeableStack() {
  const characters = db
  const dbLength = db?.length - 1
  const [runAnimi, setRunAnimi] = useState(false)
  const [allowClick, setAllowClick] = useState(true)

  const childRefs = useMemo(
    () =>
      Array(db.length)
        .fill(0)
        .map((i) => createRef()),
    []
  )

  const canSwipe = dbLength >= 0

  const swiped = (character) => {
    const nameToDelete = character.name
    console.log('removing: ' + nameToDelete)
    setRunAnimi(true)
    setTimeout(() => {
      characters.unshift(character)
      characters.pop()
      setRunAnimi(false)
    }, 300);
  }

  const outOfFrame = (name) => {
    console.log(name + ' left the screen!')
  }

  console.log(runAnimi)

  const swipe = (dir) => {
    if (canSwipe && !runAnimi) {
      childRefs[db.length - 1].current.swipe(dir) // Swipe the card!
    }
  }

  const randomDir = Math.random() > 0.5 ? 'right' : 'left';
  return (
    <div>
      <link href='https://fonts.googleapis.com/css?family=Damion&display=swap' rel='stylesheet' />
      <link href='https://fonts.googleapis.com/css?family=Alatsi&display=swap' rel='stylesheet' />
      {/* <h1 style={{ paddingBottom: '2rem' }}>Swipeable Card Stack</h1> */}
      <div className='cardContainer'>
        {characters.map((character, idx) => {
          //  const rotation = (idx % 2 === 1 ? 0.3 : 0.7) * (5 - -5) + -5;
          return (
            <SwipeCard
              ref={childRefs[idx]}
              className='swipe'
              key={character.id}
              onClick={() => swipe(randomDir)}
              setAllowClick={setAllowClick}
              onSwipe={(dir) => swiped(character)}
              onCardLeftScreen={() => outOfFrame(character.name)}
            >
              <div
                className={`card ${idx !== db.length - 1 && (idx % 2 === 1 ? 'rot-left' : 'rot-right')}`}
                style={{
                  cursor: 'pointer',
                  backgroundImage: 'url(' + character.url + ')',
                  // transform: idx !== db.length - 1 && `rotate(${rotation}deg)`,
                }}>
                {character.name}
              </div>
            </SwipeCard>
          )
        }
        )}
      </div>
    </div>
  )
}

export default SwipeableStack
