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

function createDeck() {
  // shuffle cards
  cards = shuffle(cards);

  const tempDeck = document.createDocumentFragment();

  // create card HTML for each card
  cards.forEach(card => {
    const li = document.createElement('li');
    li.classList.add('card');

    // identify card type with data attribute
    li.dataset.card = card;

    li.innerHTML = `<i class="fa fa-${card}"></i>`;
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

// TODO: reset the game when reset button is clicked

let openCards = [], matchedCards = [], moves = 0;

// ensure new cards cannot be flipped while 2 cards are already open
let checkingForMatch = false;

const moveCounter = document.querySelector('.moves'),
  stars = document.querySelector('.stars'),
  // get the individual stars
  [ bronze, silver, gold ] = stars.children,
  // function for changing stars
  changeStar = (color, star) => {
    stars.style.color = color;
    star.style.color = window.getComputedStyle(stars).backgroundColor;
  };

// timer
let start, timerId;
const hour = document.querySelector('.hour'),
  minute = document.querySelector('.minute'),
  second = document.querySelector('.second'),
  updateTimer = () => {
    let now = Math.floor(Date.now() / 1000),
      // seconds since start
      diff = now - start,
      hours = Math.floor(diff / 3600),
      // save remainder of this division
      minsDiff = diff % 3600,
      // calculate minutes from this new diff
      minutes = Math.floor(minsDiff / 60),
      // remainder of this division are the seconds
      seconds = minsDiff % 60;

    hour.textContent = String(hours).padStart(2, '0');
    minute.textContent = String(minutes).padStart(2, '0');
    second.textContent = String(seconds).padStart(2, '0');
  };

deck.addEventListener('click', event => {
  // start timer
  if (moves === 0) {
    start = Math.floor(Date.now() / 1000);
    timerId = setInterval(updateTimer, 1000);
  }

  const { target } = event;

  // exit if target is not an LI
  if (target.tagName !== 'LI') return;

  // exit if 2 cards are currently being evaluated
  if (checkingForMatch) return;

  // exit if clicked card is already matched
  if (target.classList.contains('match')) return;

  // exit if the same card was clicked
  if (openCards.length === 1 && openCards[0] === target) return;

  // increment and display move counter
  moves++;
  moveCounter.textContent = moves;

  // reduce stars if necessary
  // an individual star is hidden by setting its color equal to the
  // parent container's background color
  if (moves > 74) {
    // bronze
    changeStar('#A57164', silver);
  } else if (moves > 56) {
    // silver
    changeStar('silver', gold);
  }

  // display the card's symbol (put this functionality in another function that you call from this one)
  target.classList.add('open', 'show');

  // add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
  openCards.push(target);

  // exit if no other card is open and unmatched
  if (openCards.length < 2) return;

  checkingForMatch = true;

  if (openCards[0].dataset.card === openCards[1].dataset.card) {
    openCards.forEach(cardElement => {
      // lock card in open position
      cardElement.classList.remove('open', 'show');
      cardElement.classList.add('match');

      // record that this card has matched
      matchedCards.push(cardElement);
    });

    // prepare for next match
    openCards = [];
    checkingForMatch = false;

    // if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
    if (matchedCards.length > 15) {
      clearInterval(timerId);
      console.log('You won!');
    }
  } else {
    // if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
    setTimeout(() => {
      openCards.forEach(cardElement => {
        cardElement.classList.remove('open', 'show');
      });
      openCards = [];
      matchedCards.forEach(cardElement => {
        cardElement.classList.remove('match');
      });
      matchedCards = [];
      checkingForMatch = false;
    }, 1000);
  }
});
