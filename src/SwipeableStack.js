import React, { createRef, useState, useMemo } from 'react'
import SwipeCard from './swipe-card/index'

const db = [
  {
    name: 'Card - 9',
    url: './img/card-9.jpeg'
  },
  {
    name: 'Card - 8',
    url: './img/card-8.jpeg'
  },
  {
    name: 'Card - 7',
    url: './img/card-7.jpeg'
  },
  {
    name: 'Card - 6',
    url: './img/card-6.jpeg'
  },
  {
    name: 'Card - 5',
    url: './img/card-5.jpeg'
  },
  {
    name: 'Card - 4',
    url: './img/card-4.jpeg'
  },
  {
    name: 'Card - 3',
    url: './img/card-3.jpeg'
  },
  {
    name: 'Card - 2',
    url: './img/card-2.jpeg'
  },
  {
    name: 'Card - 1',
    url: './img/card-1.jpeg'
  }
]

function SwipeableStack () {
  const characters = db
  const dbLength = db?.length - 1
  const [runAnimi, setRunAnimi] = useState(false)
  const [isClick, setIsClick] = useState(false)

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

  const swipe = async (dir) => {
    if (canSwipe && isClick) {
      await childRefs[db.length - 1].current.swipe(dir) // Swipe the card!
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
              key={character.name}
              onClick={() => swipe(randomDir)}
              isClick={setIsClick}
              onSwipe={(dir) => swiped(character)}
              onCardLeftScreen={() => outOfFrame(character.name)}>
              <div
                className={`card ${idx !== db.length - 1 && (idx % 2 === 1 ? 'rot-left' : 'rot-right')}`}
                style={{
                  backgroundImage: 'url(' + character.url + ')',
                  // transform: idx !== db.length - 1 && `rotate(${rotation}deg)`,
                }}>
                  {/* {character.name} */}
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
