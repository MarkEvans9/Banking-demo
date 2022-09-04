// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2,
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2022-03-28T09:15:04.904Z',
    '2022-04-30T10:17:24.185Z',
    '2022-07-01T14:11:59.604Z',
    '2022-08-28T17:01:17.194Z',
    '2022-09-03T13:36:17.929Z',
    '2022-09-04T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

let fasad;
let current;

function timer() {
  const tick = () => {
    const minute = `${Math.trunc(time / 60)}`.padStart(2, 0);
    const seconds = `${time % 60}`.padStart(2, 0).padStart(2, 0);

    labelTimer.textContent = `${minute}:${seconds}`;
    if (time === 0) {
      clearInterval(fasad);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = `Log in to get started`;
    }
    time--;
  };

  let time = 300;

  tick();
  const fasad = setInterval(tick, 1000);
  return fasad;
}

function formatNumber(val, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(val);
}

const formattedDate = function (date) {
  const calcDays = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));
  const daysPassed = calcDays(new Date(), date);

  if (daysPassed === 0) {
    return 'Today';
  }
  if (daysPassed === 1) {
    return 'Yesterday';
  }
  if (daysPassed === 2) {
    return `${daysPassed} Days ago`;
  }
  if (daysPassed > 2 && daysPassed < 7) {
    return `${daysPassed} Days ago`;
  }
  if (daysPassed === 7) {
    return `${daysPassed} Days ago`;
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, 0);
  const day = `${date.getDate()}`.padStart(2, 0);

  return `${new Intl.DateTimeFormat(current.locale).format(new Date(date))}`;
};

// Creating username
const createUserName = function (accounts) {
  accounts.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUserName(accounts);

// movemensts
function displayMovements(acc, sort = false) {
  containerMovements.innerHTML = '';
  const movs = sort ? acc.movements.slice().sort() : acc.movements;
  movs.forEach(function (mov, i) {
    const dispalyDate = formattedDate(new Date(acc.movementsDates[i]));

    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `  <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__date">${dispalyDate} </div>
          <div class="movements__value">${formatNumber(
            mov,
            acc.locale,
            acc.currency
          )}</div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
}

//Ui update
const updateUi = function (acc) {
  // display Movements
  displayMovements(acc);

  // calculate total balance
  calcBalance(acc);

  //DIsplay summary
  displaySummary(acc);
};

//total amount
const calcBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, cur) => acc + cur, 0);
  labelBalance.textContent = formatNumber(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

//summary
const displaySummary = function (acc) {
  //deposits
  const deposits = acc.movements
    .filter(movs => movs > 0)
    .reduce((acc, val) => acc + val, 0);
  labelSumIn.textContent = `${formatNumber(
    deposits,
    acc.locale,
    acc.currency
  )}`;

  //withdrawal
  const withdraw = acc.movements
    .filter(movs => movs < 0)
    .reduce((acc, val) => acc + Math.abs(val), 0);
  labelSumOut.textContent = `${formatNumber(
    withdraw,
    acc.locale,
    acc.currency
  )}`;

  //interest
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * acc.interestRate) / 100)
    .filter(mov => mov >= 1)
    .reduce((acc, val) => acc + val, 0);
  labelSumInterest.textContent = `${formatNumber(
    interest,
    acc.locale,
    acc.currency
  )}`;
};

///Login

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  current = accounts.find(acc => acc.username === inputLoginUsername.value);
  if (current?.pin === +inputLoginPin.value) {
    //Ui Update and message
    containerApp.style.opacity = 100;
    labelWelcome.textContent = `Welcome Back ${current.owner.split(' ')[0]}`;

    //  current date
    labelDate.textContent = `${new Intl.DateTimeFormat(current.locale).format(
      new Date()
    )}`;
    d;
    // clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //TImer
    if (fasad) clearInterval(fasad);
    fasad = timer();

    // UI Update
    updateUi(current);
  }
});

//transfer functionality
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  timer();
  const amout = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  if (
    amout > 0 &&
    amout < current.balance &&
    receiverAcc &&
    receiverAcc?.username !== current.username
  ) {
    // transferring
    current.movements.push(-amout);
    current.movementsDates.push(new Date().toISOString());
    receiverAcc.movements.push(amout);
    receiverAcc.movementsDates.push(new Date().toISOString());

    // UI Update
    updateUi(current);
  }
});

//LOan functionality
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(+inputLoanAmount.value);
  if (amount > 0 && current.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(() => {
      //add movement
      current.movements.push(amount);
      current.movementsDates.push(new Date().toISOString());
      //Update UI

      updateUi(current);
    }, 2000);
    timer();
  }
  inputLoanAmount.value = '';
});

//delete user
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  inputClosePin.blur();

  if (
    inputCloseUsername.value === current.username &&
    +inputClosePin.value === current.pin
  ) {
    const delAcc = accounts.findIndex(acc => acc.username === current.username);
    // deleting user
    accounts.splice(delAcc, 1);

    //Hiding Ui
    containerApp.style.opacity = 0;

    labelWelcome.textContent = 'Log in to get started';
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(current, !sorted);

  sorted = !sorted;
});
