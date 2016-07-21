(() => {
  'use strict';

  let cards = [],
      level = 2,
      flipCount = 0,
      correctCount = 0,
      firstCard = null,
      secondCard = null;

  const transition = 800;

  const stage = document.getElementById('js-stage');
  const btn = document.getElementById('js-btn');

  const init = () => {
    correctCount = 0;
    btn.classList.remove('game__btn--visible');

    while (stage.firstChild) {
      stage.removeChild(stage.firstChild);
    }

    const createCard = (num) => {
      const inner = `
        <div class="game__card-back">?</div>
        <div class="game__card-front">${num}</div>
      `;

      const card = document.createElement('div');
      card.classList.add('game__card');
      card.innerHTML = inner;
      card.addEventListener('click', function (e) {
        flipCard(this);
      }, false);

      const flipCard = (card) => {
        // 三枚目がめくれないようにする
        // （二枚目をめくったらそれ以上はめくれない）
        if (firstCard !== null && secondCard !== null) return;

        // 裏返しのカードをクリックしたら処理を開始
        if (!card.classList.contains('game__card--open')) {
          card.classList.add('game__card--open');
          flipCount++;

          // 一枚目のカードをめくった場合
          if (flipCount % 2 === 1) {
            firstCard = card;

          // 二枚目のカードをめくった場合
          } else {
            secondCard = card;

            // カードがめくられてからjudge関数を実行
            setTimeout(() => {
              judge();
            }, transition + 100);
          }
        }
      }

      // カードが揃ったかどうかを判定
      const judge = () => {
        const firstCardNumber = firstCard.querySelector('.game__card-front').textContent;
        const secondCardNumber = secondCard.querySelector('.game__card-front').textContent;

        if (firstCardNumber === secondCardNumber) {
          correctCount++;

          // 全てのカードが揃ったら次のレベルに行くボタンを表示
          if (correctCount == level) {
            btn.classList.add('game__btn--visible');
          }

        } else {
          firstCard.classList.remove('game__card--open');
          secondCard.classList.remove('game__card--open');
        }

        [firstCard, secondCard] = [null, null];
      }

      const container = document.createElement('div');
      container.classList.add('game__container');
      container.appendChild(card);

      return container;
    }

    for (let i = 1; i <= level; i++) {
      // それぞれの数字で２枚ずつカードを生成
      cards[cards.length] = createCard(i);
      cards[cards.length] = createCard(i);
    }

    // カードをページに追加
    while (cards.length) {
      let pos = Math.floor(Math.random() * cards.length);
      let card = cards.splice(pos, 1)[0];
      stage.appendChild(card);
    }

  };

  init();

  btn.addEventListener('click', function (e) {
    level++;
    init();
  }, false);

})();
