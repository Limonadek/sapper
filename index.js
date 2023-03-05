import './index.html';
import './index.css';

const WIDTH = 16;
const HEIGHT = 16;
const BOMBS_COUNT = 40;

const counterPics = {
    0: "<div class='counter__item0'></div>",
    1: "<div class='counter__item1'></div>",
    2: "<div class='counter__item2'></div>",
    3: "<div class='counter__item3'></div>",
    4: "<div class='counter__item4'></div>",
    5: "<div class='counter__item5'></div>",
    6: "<div class='counter__item6'></div>",
    7: "<div class='counter__item7'></div>",
    8: "<div class='counter__item8'></div>",
    9: "<div class='counter__item9'></div>",
}

startGame(WIDTH, HEIGHT, BOMBS_COUNT);


function updateCount(count) {
    const counterPic = document.querySelector('.counter');

    if (count > 9) {
        counterPic.innerHTML = `${counterPics[0]}${counterPics[Math.floor(count / 10)]}${counterPics[count % 10]}`;
    }
    
    if (count < 9) {
        counterPic.innerHTML = `${counterPics[0]}${counterPics[0]}${counterPics[count]}`;
    }
}


function startGame(width, height, bombsCount) {

    let countFlag = bombsCount;
    updateCount(countFlag);

    let timerId = 0;
    const timer = document.querySelector('.timer');
        
    const time1 = document.createElement('div');
    time1.classList.add('timer0');
    const time2 = document.createElement('div');
    time2.classList.add('timer0');
    const time3 = document.createElement('div');
    time3.classList.add('timer0');

    timer.append(time3, time2, time1);

    let i = 0;
    let j = 0;
    let x = 0;

    const timers = {
        0: 'timer0',
        1: 'timer1',
        2: 'timer2',
        3: 'timer3',
        4: 'timer4',
        5: 'timer5',
        6: 'timer6',
        7: 'timer7',
        8: 'timer8',
        9: 'timer9',
        10: 'timer10'
    }

    function updateNum() {
        time1.classList.replace(timers[i % 10], timers[(i % 10) + 1]);
        i++;

        if (i % 10 === 0) {
            time2.classList.replace(timers[j % 10], timers[(j % 10) + 1]);
            j++;
        }

        if (i % 100 === 0) {
            time3.classList.replace(timers[x % 10], timers[(x % 10) + 1]);
            x++;
        }

        time3.classList.replace(timers[10], timers[(x % 10)]);
        time2.classList.replace(timers[10], timers[(j % 10)]);
        time1.classList.replace(timers[10], timers[(i % 10)]);

        if(i === 999) {
            clearInterval(timerId);
        }
    }

    const stateField = { 
        NonClick: 'NonClick',
        Click: 'Click',
        Flag: 'Flag',
        Question: 'Question'
    };

    let startGameFlag = false;
    let overGame = false;
    let timerFlag = false;


    const field = document.querySelector('.field');
    const smile = document.querySelector('.smile');

    const cellsCount = width * height;
    field.innerHTML = `<button value=${stateField.NonClick} class="button"></button>`.repeat(cellsCount);

    const cells = [...field.children];
    let closeCount = cellsCount;
    let bombs = [];


    field.addEventListener('click', clickForButton);


    function clickForButton(event) {
        if (event.target.tagName !== 'BUTTON') {
            return;
        }

        if (!timerFlag) {
            timerId = setInterval(updateNum, 1000);
            timerFlag = true;
        }

        const index = cells.indexOf(event.target);
        const column = index % width;
        const row = Math.floor(index / width);

        if (event.target.value === stateField.NonClick) {
            event.target.value = stateField.Click;
        }

        if (event.target.value === stateField.Click) {
            open(row, column);
        }
    }


    function open(row, column) {
        if (!isValid(row, column)) return;

        const index = row * width + column;
        let cell = cells[index];

        if (!startGameFlag) {
            startGameFlag = true;
            const newBomb = [...Array(cellsCount).keys()].sort(() => Math.random() - 0.5).slice(0, bombsCount);
            let targetBomb = index;

            if (newBomb.includes(index)) {
                targetBomb = Math.floor(Math.random() * cells.length);

                while(newBomb.includes(targetBomb)) {
                    targetBomb = Math.floor(Math.random() * cells.length);
                }
            }

            bombs = newBomb.map((value) => {
                if (value === index) {
                    value = targetBomb;
                    return value;
                }
                return value;
            })

        }


        if (cell.value === stateField.NonClick && cell.value !== stateField.Flag) {
            cell.value = stateField.Click;
        }

        if (cell.disabled === true) return;
        
        cell.disabled = true;

        if (cell.value === stateField.Flag && cell.value === stateField.Flag) {
            countFlag += 1;
            updateCount(countFlag);
        }

        if (isBomb(row, column)) {
            smile.classList.add('smile-death');
            overGame = true;
            clearInterval(timerId);

            const bomb = document.createElement('div');
            bomb.classList.add('bomb');

            cell.innerHTML = '<div class="active-bomb"></div>';
            cell.value = 'ActiveBomb';

            bombs.forEach(elem => {
                let newCell = cells[elem];
                newCell.disabled = true;

                if (newCell.value === 'ActiveBomb') {
                    return;
                }

                if (newCell.value === stateField.Flag) {
                    newCell.innerHTML = '<div class="flag-in-bomb"></div>';
                    return;
                }

                newCell.value = stateField.Click;
                newCell.innerHTML = '<div class="bomb"></div>';
                return;
            });

            cells.forEach((elem) => {
                if (elem.value === 'ActiveBomb') return;
                if (elem.value !== stateField.Click && elem.value !== stateField.Flag) {
                    elem.disabled = true;
                    elem.innerHTML = '<div class="over-game"></div>';
                }
            })

            return;
        }

        const count = getCount(row, column);
        closeCount--;

        if (count !== 0) {
            const number = document.createElement('div');
            number.classList.add(`num${count}`);
            cell.append(number);

            if (closeCount <= bombsCount) {
                overGame = true;
                clearInterval(timerId);
                bombs.forEach((elem) => {
                    cell = cells[elem];
                    cell.disabled = true;
                    cell.innerHTML = '<div class="over-game"></div>';
                })
                smile.classList.add('smile-win');
            }   
            return;
        }

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                open(row + y, column + x);
            }
        }
    }


    field.addEventListener('mousedown', (event) => {
        if (event.target.value === stateField.NonClick && event.button === 0) {
            smile.classList.add('scared');
        }
    })


    field.addEventListener('mouseup', (event) => {
        if (smile && event.button === 0) {
            smile.classList.remove('scared');
        }
    })


    smile.addEventListener('click', () => {
        clearInterval(timerId);
        smile.classList.remove('smile-death');
        smile.classList.remove('smile-win');
        
        field.innerHTML = '';
        timer.innerHTML = '';

        startGame(width, height, bombsCount);
    })


    field.addEventListener('contextmenu', (event) => {
        event.preventDefault();

        const index = cells.indexOf(event.target);
        const cell = cells[index];

        if (overGame) return;

        switch(cell.value) {
            case stateField.NonClick:
                cell.value = stateField.Flag;

                if (countFlag > 0) {
                    countFlag -= 1;
                }
                updateCount(countFlag);

                return cell.classList.add('flag');

            case stateField.Flag:
                cell.value = stateField.Question;

                countFlag += 1;
                updateCount(countFlag);

                cell.classList.remove('flag');
                return cell.classList.add('question');

            case stateField.Question:
                cell.value = stateField.NonClick;
                return cell.classList.remove('question');
        }
    })


    function getCount(row, column) {
        let count = 0;
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                if (isBomb(row + y, column + x) && count < 8) {
                    count++;
                }
            }
        }

        return count;
    }
    

    function isValid(row, column) {
        return row >= 0
        && row < height
        && column >= 0
        && column < width;
    }


    function isBomb(row, column) {
        if (!isValid(row, column)) return false;
        const index = row * width + column;
        return bombs.includes(index);
    }

}
