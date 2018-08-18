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

let openCard = null,
  matchedCards = [],
  // flag to know when to throttle clicks
  flippingIsPaused = false,
  timerId,
  start,
  moves = 0,
  hardDifficulty = false,
  restartingGame = false;

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

  // exit if checking for match
  if (flippingIsPaused) return;

  if (moves === 0) {
    // start timer when first card is flipped
    start = Math.floor(Date.now() / 1000);
    timerId = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      let diff = now - start;
      const curHour = Math.floor(diff / 3600);

      // new diff is the remaining seconds
      diff = diff % 3600;

      const curMin = Math.floor(diff / 60);
      const curSec = diff % 60;
      updateTimer(curHour, curMin, curSec);
    }, 1000);

    // deactivate the difficulty selector
    fieldset.setAttribute('disabled', 'true');
  }

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

  flippingIsPaused = true;
  const { card } = back.firstElementChild.dataset;
  if (card === openCard.firstElementChild.dataset.card) {
    // we have a match
    [openCard, back].forEach(card => {
      card.classList.add('match');
    });
    matchedCards.push(openCard, back);

    flippingIsPaused = false;

    if (matchedCards.length > 15) {
      // stop timer
      clearInterval(timerId);

      // assign necessary metrics to congrats modal
      const [difficulty, rating, finalMoves, time] = [...document.querySelectorAll('.metric-value')];
      difficulty.textContent = hardDifficulty ? 'HARD' : 'EASY';
      // for stars, show the same content and display from score panel
      // outerHTML contains the <ul> tag for the list
      rating.innerHTML = stars.outerHTML;
      finalMoves.textContent = moves;
      // for time, show the same content/display from score panel
      // innerHTML contains the relevant info
      time.innerHTML = document.querySelector('.time-display').innerHTML;

      // display the modal
      document.querySelector('.overlay').classList.add('shown');
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
      flippingIsPaused = false;
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

function resetFlippedCard(card, index, origArray) {
  if (index === origArray.length - 1 && restartingGame) {
    // this is the last card being flipped when the game is being reset
    // so recreate the deck after it has flipped
    card.parentElement.addEventListener('transitionend', recreateDeck);
  }
  card.parentElement.classList.remove('flip');
  card.classList.remove('match');
}

function recreateDeck(event = null) {
  /*
   * idea gotten from Udacity JS performance guide
   * manipulating the deck while it's hidden gives a performance gain
   * (backed up by performance.now() data)
   */
  // first hide the deck
  deck.style.display = 'none';
  // remove all cards
  [...deck.children].forEach(card => deck.removeChild(card));
  // create a new arrangement
  createDeck();
  // show new deck
  // an empty string will reset the style value to the default
  // see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style#Setting_styles
  deck.style.display = '';

  // reactivate the difficulty selector
  fieldset.removeAttribute('disabled');

  restartingGame = false;
  flippingIsPaused = false;

  if (event) {
    // recreateDeck() was invoked as an event listener
    // remove it to prevent firing at the wrong time
    event.target.removeEventListener('transitionend', recreateDeck);
  }
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
  // game has not started
  if (moves < 1) return;

  restartingGame = true;
  flippingIsPaused = true;

  // reset move counter
  updateMoveCounter(true);

  // reset timer
  clearInterval(timerId);
  updateTimer(0, 0, 0);

  // reset stars
  stars.classList.remove('bronze', 'silver');

  // reset open cards
  const cardsToReset = [...matchedCards];

  // final card is always a matched card
  if (cardIsOpen()) cardsToReset.unshift(openCard);

  if (cardsToReset.length < 1) {
    // no matched or open cards but player has seen some cards already
    // resetFlippedCard() will never be invoked, and consequently recreateDeck() too
    // resetFlippedCard() doesn't need to invoked, but recreateDeck() must be
    // no argument is passed because no need to remove event listener
    recreateDeck();
  } else {
    cardsToReset.forEach(resetFlippedCard);
  }

  openCard = null;
  matchedCards = [];
});

// hide congrats modal
const overlay = document.querySelector('.overlay');
overlay.addEventListener('click', event => {
  if (event.target.matches('section.overlay.shown')) hideModal(event.target);
});

function hideModal(overlay) {
  overlay.classList.remove('shown');
}

const closeModalBtn = document.querySelector('.button[name="close"]');
// invoke a click on the background so the modal is dismissed
closeModalBtn.addEventListener('click', event => overlay.click());

const modalRestartBtn = document.querySelector('.button[name="restart"]');
modalRestartBtn.addEventListener('click', event => {
  // invoke a click on the background so the modal is dismissed
  overlay.click();
  // invoke a click on the actual restart button so the grid & game reset
  restartBtn.click();
});
