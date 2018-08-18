'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// String.prototype.padStart() polyfill
// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength, padString) {
    targetLength = targetLength >> 0; //truncate if number or convert non-number to 0;
    padString = String(typeof padString !== 'undefined' ? padString : ' ');
    if (this.length > targetLength) {
      return String(this);
    } else {
      targetLength = targetLength - this.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
      }
      return padString.slice(0, targetLength) + String(this);
    }
  };
}

/*
 * Create a list that holds all of your cards
 */
var cards = ['diamond', 'paper-plane-o', 'anchor', 'bicycle', 'cube', 'leaf', 'bomb', 'diamond', 'paper-plane-o', 'anchor', 'bicycle', 'cube', 'leaf', 'bomb', 'bolt', 'bolt'];

/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */

var deck = document.querySelector('.deck');
createDeck();

function createDeck() {
  // shuffle cards
  cards = shuffle(cards);

  var tempDeck = document.createDocumentFragment();

  // create card HTML for each card
  cards.forEach(function (card) {
    var li = document.createElement('li');
    li.classList.add('card', 'flipper');

    li.innerHTML = '\n      <div class="front"></div>\n      <div class="back">\n        <i class="fa fa-' + card + '" data-card="' + card + '"></i>\n      </div>\n      ';
    tempDeck.appendChild(li);
  });

  // add cards to deck
  deck.appendChild(tempDeck);
}

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
  var currentIndex = array.length,
      temporaryValue,
      randomIndex;

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

var openCard = null,
    matchedCards = [],

// flag to know when to throttle clicks
flippingIsPaused = false,
    timerId = void 0,
    start = void 0,
    moves = 0,
    hardDifficulty = false,
    restartingGame = false;

var stars = document.querySelector('.stars'),
    _stars$children = _slicedToArray(stars.children, 3),
    bronze = _stars$children[0],
    silver = _stars$children[1],
    gold = _stars$children[2],
    fieldset = document.querySelector('fieldset'),
    hour = document.querySelector('.hour'),
    minute = document.querySelector('.minute'),
    second = document.querySelector('.second'),
    moveCounter = document.querySelector('.moves');


deck.addEventListener('click', function (event) {
  var target = event.target;

  // exit if click is not from the front of a card

  if (!target.matches('div.front')) return;

  // exit if checking for match
  if (flippingIsPaused) return;

  if (moves === 0) {
    // start timer when first card is flipped
    start = Math.floor(Date.now() / 1000);
    timerId = setInterval(function () {
      var now = Math.floor(Date.now() / 1000);
      var diff = now - start;
      var curHour = Math.floor(diff / 3600);

      // new diff is the remaining seconds
      diff = diff % 3600;

      var curMin = Math.floor(diff / 60);
      var curSec = diff % 60;
      updateTimer(curHour, curMin, curSec);
    }, 1000);

    // deactivate the difficulty selector
    fieldset.setAttribute('disabled', 'true');
  }

  // increment moves
  updateMoveCounter();

  // update stars if necessary
  var goldThreshold = hardDifficulty ? 56 : 28;
  var silverThreshold = hardDifficulty ? 74 : 32;

  if (moves > silverThreshold) {
    // bronze
    stars.classList.add('bronze');
  } else if (moves > goldThreshold) {
    // silver
    stars.classList.add('silver');
  }

  target.parentElement.classList.add('flip');
  var back = target.nextElementSibling;

  if (!cardIsOpen()) {
    // add this card and exit
    openCard = back;
    return;
  }

  flippingIsPaused = true;
  var card = back.firstElementChild.dataset.card;

  if (card === openCard.firstElementChild.dataset.card) {
    // we have a match
    [openCard, back].forEach(function (card) {
      card.classList.add('match');
    });
    matchedCards.push(openCard, back);

    flippingIsPaused = false;

    if (matchedCards.length > 15) {
      // stop timer
      clearInterval(timerId);

      // assign necessary metrics to congrats modal

      var _ref = [].concat(_toConsumableArray(document.querySelectorAll('.metric-value'))),
          difficulty = _ref[0],
          rating = _ref[1],
          finalMoves = _ref[2],
          time = _ref[3];

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
    var tempOpenCard = openCard; // openCard will be null inside timeout callback
    // delay card reset for 1 second
    setTimeout(function () {
      var cardsToReset = [tempOpenCard, back];
      if (hardDifficulty) {
        cardsToReset.push.apply(cardsToReset, _toConsumableArray(matchedCards));
        matchedCards = [];
      }
      cardsToReset.forEach(resetFlippedCard);
      flippingIsPaused = false;
    }, 1000);
  }

  // empty the open card variable
  openCard = null;
});

function updateTimer() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var _generateTimeString = generateTimeString(args),
      _generateTimeString2 = _slicedToArray(_generateTimeString, 3),
      hours = _generateTimeString2[0],
      minutes = _generateTimeString2[1],
      seconds = _generateTimeString2[2];

  hour.textContent = hours;
  minute.textContent = minutes;
  second.textContent = seconds;
}

function generateTimeString(timeArr) {
  return timeArr.map(function (timeElement) {
    return String(timeElement).padStart(2, '0');
  });
}

function updateMoveCounter() {
  var toZero = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

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

function recreateDeck() {
  var event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

  /*
   * idea gotten from Udacity JS performance guide
   * manipulating the deck while it's hidden gives a performance gain
   * (backed up by performance.now() data)
   */
  // first hide the deck
  deck.style.display = 'none';
  // remove all cards
  [].concat(_toConsumableArray(deck.children)).forEach(function (card) {
    return deck.removeChild(card);
  });
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
fieldset.addEventListener('change', function (event) {
  var target = event.target;

  // exit if selection didn't change

  if (target.tagName !== 'INPUT') return;

  hardDifficulty = target.value === 'hard' ? true : false;
});

// restart the game
var restartBtn = document.querySelector('.restart');
restartBtn.addEventListener('click', function (event) {
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
  var cardsToReset = [].concat(_toConsumableArray(matchedCards));

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
var overlay = document.querySelector('.overlay');
overlay.addEventListener('click', function (event) {
  if (event.target.matches('section.overlay.shown')) hideModal(event.target);
});

function hideModal(overlay) {
  overlay.classList.remove('shown');
}

/* Display introductory guide using IntroJS library */

var intro = introJs();

// intro tooltips and settings
intro.setOptions({
  steps: [{
    element: 'h1',
    intro: 'Hello and welcome to the Memory Game!'
  }, {
    element: 'form',
    intro: 'Always choose a difficulty <strong><em>before</em></strong> making your first move.'
  }, {
    element: restartBtn,
    intro: 'Clicking this button will restart the game.\n        No need for that... <em>yet</em>. \uD83D\uDE09'
  }, {
    element: '.score-panel',
    intro: 'Keep track of your performance with these metrics.'
  }, {
    element: deck,
    intro: 'Now you\'re ready!<br>\n        Click any card get to started.<br>\n        Then click another card to see if you found a match... \uD83E\uDD1E.<br>\n        Find all the matches to win. Good luck!'
  }],
  hidePrev: true,
  hideNext: true,
  tooltipPosition: 'auto',
  scrollTo: 'tooltip',

  // for hints
  hints: [{
    hint: 'Click this button to restart the game.',
    element: '.fa-repeat'
  }]
});

// show guide after page and JS have loaded
intro.start();

var closeModalBtn = document.querySelector('.button[name="close"]');
closeModalBtn.addEventListener('click', function (event) {
  // invoke a click on the background so the modal is dismissed
  overlay.click();

  // show hint on restart button
  intro.showHints();
});

var modalRestartBtn = document.querySelector('.button[name="restart"]');
modalRestartBtn.addEventListener('click', function (event) {
  // invoke a click on the background so the modal is dismissed
  overlay.click();

  // invoke a click on the actual restart button so the grid & game reset
  restartBtn.click();
});

//# sourceMappingURL=game.js.map