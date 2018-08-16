// String.prototype.padStart() polyfill
// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength,padString) {
        targetLength = targetLength>>0; //truncate if number or convert non-number to 0;
        padString = String((typeof padString !== 'undefined' ? padString : ' '));
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0,targetLength) + String(this);
        }
    };
}

/*
 * Create a list that holds all of your cards
 */
let cards = [
  'diamond',
  'paper-plane-o',
  'anchor',
  'bicycle',
  'cube',
  'leaf',
  'bomb',
  'diamond',
  'paper-plane-o',
  'anchor',
  'bicycle',
  'cube',
  'leaf',
  'bomb',
  'bolt',
  'bolt'
];

/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */

const deck = document.querySelector('.deck');
createDeck();

function createDeck() {
  // shuffle cards
  cards = shuffle(cards);

  const tempDeck = document.createDocumentFragment();

  // create card HTML for each card
  cards.forEach(card => {
    const li = document.createElement('li');
    li.classList.add('card', 'flipper');

    li.innerHTML = `
      <div class="front"></div>
      <div class="back">
        <i class="fa fa-${card}" data-card="${card}"></i>
      </div>
      `;
    tempDeck.appendChild(li);
  });

  // add cards to deck
  deck.appendChild(tempDeck);
}

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

/**** Gameplay *****/

// let openCards = [], matchedCards = [], moves = 0;
//
// // ensure new cards cannot be flipped while 2 cards are already open
// let checkingForMatch = false;
//
// const moveCounter = document.querySelector('.moves'),
//   stars = document.querySelector('.stars'),
//   // get the individual stars
//   [ bronze, silver, gold ] = stars.children;
//
// // timer
// let start, timerId;
// const hour = document.querySelector('.hour'),
//   minute = document.querySelector('.minute'),
//   second = document.querySelector('.second'),
//   updateTimer = () => {
//     let now = Math.floor(Date.now() / 1000),
//       // seconds since start
//       diff = now - start,
//       hours = Math.floor(diff / 3600),
//       // save remainder of this division
//       minsDiff = diff % 3600,
//       // calculate minutes from this new diff
//       minutes = Math.floor(minsDiff / 60),
//       // remainder of this division are the seconds
//       seconds = minsDiff % 60;
//
//     writeNewTime(hours, minutes, seconds);
//   };
//
// function writeNewTime(hours, minutes, seconds) {
//   hour.textContent = String(hours).padStart(2, '0');
//   minute.textContent = String(minutes).padStart(2, '0');
//   second.textContent = String(seconds).padStart(2, '0');
// }
//
// // handle a clicked card
// deck.addEventListener('click', event => {
//   // start timer
//   if (moves === 0) {
//     start = Math.floor(Date.now() / 1000);
//     timerId = setInterval(updateTimer, 1000);
//   }
//
//   const { target } = event;
//
//   // exit if target is not an LI
//   if (target.tagName !== 'LI') return;
//
//   // exit if 2 cards are currently being evaluated
//   if (checkingForMatch) return;
//
//   // exit if clicked card is already matched
//   if (target.classList.contains('match')) return;
//
//   // exit if the same card was clicked
//   if (openCards.length === 1 && openCards[0] === target) return;
//
//   // increment and display move counter
//   moves++;
//   updateMoves(moves);
//
//   // reduce stars if necessary
//   // an individual star is hidden by setting its color equal to the
//   // parent container's background color
//   if (moves > 74) {
//     // bronze
//     updateStars('#A57164', silver);
//   } else if (moves > 56) {
//     // silver
//     updateStars('silver', gold);
//   }
//
//   // display the card's symbol (put this functionality in another function that you call from this one)
//   target.classList.add('open', 'show');
//
//   // add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
//   openCards.push(target);
//
//   // exit if no other card is open and unmatched
//   if (openCards.length < 2) return;
//
//   checkingForMatch = true;
//
//   if (openCards[0].dataset.card === openCards[1].dataset.card) {
//     openCards.forEach(cardElement => {
//       // lock card in open position
//       cardElement.classList.remove('open', 'show');
//       cardElement.classList.add('match');
//
//       // record that this card has matched
//       matchedCards.push(cardElement);
//     });
//
//     // prepare for next match
//     openCards = [];
//     checkingForMatch = false;
//
//     // if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
//     if (matchedCards.length > 15) {
//       clearInterval(timerId);
//       console.log('You won!');
//     }
//   } else {
//     // if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
//     setTimeout(() => {
//       openCards.forEach(cardElement => {
//         cardElement.classList.remove('open', 'show');
//       });
//       openCards = [];
//       matchedCards.forEach(cardElement => {
//         cardElement.classList.remove('match');
//       });
//       matchedCards = [];
//       checkingForMatch = false;
//     }, 1000);
//   }
// });
//
// function updateMoves(moves) {
//   moveCounter.textContent = moves;
// }
//
// function updateStars(color, star) {
//   colorAllStars(color);
//   colorStar(star);
// };
//
// function colorAllStars(color) {
//   // an empty string will reset the color to the default
//   // see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style#Setting_styles
//   stars.style.color = color;
// }
//
// function colorStar(star, reset = false) {
//   // an empty string will reset the color to the default
//   // see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style#Setting_styles
//   const newColor = reset ? '' : window.getComputedStyle(stars).backgroundColor;
//   star.style.color = newColor;
// }
//
// const restartBtn = document.querySelector('.restart');
// restartBtn.addEventListener('click', event => {
//   /*
//    * idea gotten from Udacity JS performance guide
//    * manipulating the deck while it's hidden gives a performance gain
//    * (backed up by performance.now() data)
//    */
//   // hide deck
//   deck.style.display = 'none';
//
//   [...deck.children].forEach(child => deck.removeChild(child));
//   createDeck();
//
//   // show new deck
//   deck.style.display = '';
//
//   // reset the timer
//   clearInterval(timerId);
//   writeNewTime(0, 0, 0);
//
//   // reset moves
//   moves = 0;
//   updateMoves(moves);
//
//   // reset stars
//   colorAllStars('');
//   colorStar(silver, true);
//   colorStar(gold, true);
//
//   // empty cards arrays
//   openCards = [];
//   matchedCards = [];
// });

let openCard = null,
  matchedCards = [],
  // flag to know when to throttle clicks
  checkingForMatch = false,
  timerId,
  start,
  moves = 0,
  hardDifficulty = false;

const stars = document.querySelector('.stars'),
  [bronze, silver, gold] = stars.children,
  fieldset = document.querySelector('fieldset'),
  hour = document.querySelector('.hour'),
  minute = document.querySelector('.minute'),
  second = document.querySelector('.second'),
  moveCounter = document.querySelector('.moves');

deck.addEventListener('click', event => {
  const { target } = event;

  // exit if click is not from the front of a card
  if (!target.matches('div.front')) return;

  if (moves === 0) {
    // start timer when first card is flipped
    start = Math.floor(Date.now() / 1000);
    timerId = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      let diff = now - start;
      curHour = Math.floor(diff / 3600);

      // new diff is the remaining seconds
      diff = diff % 3600;

      curMin = Math.floor(diff / 60);
      curSec = diff % 60;
      updateTimer(curHour, curMin, curSec);
    }, 1000);

    // deactivate the difficulty selector
    fieldset.setAttribute('disabled', 'true');
  }

  // exit if checking for match
  if (checkingForMatch) return;

  // increment moves
  updateMoveCounter();

  // update stars if necessary
  const goldThreshold = hardDifficulty ? 56 : 28;
  const silverThreshold = hardDifficulty ? 74 : 32;

  if (moves > silverThreshold) {
    // bronze
    stars.classList.add('bronze');
  } else if (moves > goldThreshold) {
    // silver
    stars.classList.add('silver');
  }

  target.parentElement.classList.add('flip');
  const back = target.nextElementSibling;

  if (!cardIsOpen()) {
    // add this card and exit
    openCard = back;
    return;
  }

  checkingForMatch = true;
  const { card } = back.firstElementChild.dataset;
  if (card === openCard.firstElementChild.dataset.card) {
    // we have a match
    [openCard, back].forEach(card => {
      card.classList.add('match');
    });
    matchedCards.push(openCard, back);

    checkingForMatch = false;

    if (matchedCards.length > 15) {
      // stop timer
      clearInterval(timerId);

      console.log('You won!');
    }
  } else {
    // no match
    const tempOpenCard = openCard; // openCard will be null inside timeout callback
    // delay card reset for 1 second
    setTimeout(() => {
      const cardsToReset = [tempOpenCard, back];
      if (hardDifficulty) {
        cardsToReset.push(...matchedCards);
        matchedCards = [];
      }
      cardsToReset.forEach(resetFlippedCard);
      checkingForMatch = false;
    }, 1000);
  }

  // empty the open card variable
  openCard = null;
});

function updateTimer(...args) {
  const [hours, minutes, seconds] = generateTimeString(args);
  hour.textContent = hours;
  minute.textContent = minutes;
  second.textContent = seconds;
}

function generateTimeString(timeArr) {
  return timeArr.map(timeElement => String(timeElement).padStart(2, '0'));
}

function updateMoveCounter(toZero = false) {
  moves = !toZero ? ++moves : 0;
  moveCounter.textContent = moves;
}

function cardIsOpen() {
  return openCard instanceof Element;
}

function resetFlippedCard(card) {
  card.parentElement.classList.remove('flip');
  card.classList.remove('match');
}

// select difficulty
fieldset.addEventListener('change', event => {
  const { target } = event;

  // exit if selection didn't change
  if (target.tagName !== 'INPUT') return;

  hardDifficulty = target.value === 'hard' ? true : false;
});

// restart the game
const restartBtn = document.querySelector('.restart');
restartBtn.addEventListener('click', event => {
  // reset move counter
  updateMoveCounter(true);

  // reset timer
  clearInterval(timerId);
  updateTimer(0, 0, 0);

  // reset stars
  stars.classList.remove('bronze', 'silver');

  // reset open cards
  const cardsToReset = [...matchedCards];
  if (cardIsOpen()) cardsToReset.push(openCard);
  cardsToReset.forEach(resetFlippedCard);
  openCard = null;
  matchedCards = [];

  // delay recreating the deck until the flip animation ends
  setTimeout(() => {
    // recreate deck
    // first hide the deck
    deck.style.display = 'none';
    // remove all cards
    [...deck.children].forEach(card => deck.removeChild(card));
    // create a new arrangement
    createDeck();
    // show new deck
    deck.style.display = '';

    // reactivate the difficulty selector
    fieldset.removeAttribute('disabled');
  }, 300);
});
