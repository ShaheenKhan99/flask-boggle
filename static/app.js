class BoggleGame {
  /* make a new game at this id */

  constructor(boardId, timeLeft = 60){
    this.timeLeft = timeLeft; //game length
    this.showTimer();

    this.score = 0;
    this.words = new Set();
    this.board = $('#' + boardId);

    //every 1000 milliseconds, updateTimer
    this.timer = setInterval(this.updateTimer.bind(this), 1000);

    $('.add-word', this.board).on('submit', this.handleSubmit.bind(this));
  }

    /* Display word in list of words on page */

    showWord(word) {
      $('.words', this.board).append($('<li>', { text: word }));
    }


    /* Display score on page */

    showScore(){
    $('.score', this.board).text(this.score);
    }


    /* Display a status message */
    showMessage(msg, cls){
      $('.msg', this.board)
        .text(msg)
        .removeClass()
        .addClass(`msg ${cls}`);
    }


    /* Handle submission of word: if unique an dvalid, score and show */

    async handleSubmit(evt){
      evt.preventDefault();
      const $word = $('.word', this.board);

      let word = $word.val();
      if (!word) return;

      if (this.words.has(word)){
        this.showMessage(`Already found ${word}`, 'err');
        $word.val('');
        return;
      }

    /* Check server for validity */
    const resp = await axios.get('/check-word', { params: { word: word }});
    console.log(resp.data.result);
    if (resp.data.result === 'not-word'){
      this.showMessage(`${word} is not a valid English word`, 'err');
    } else if (resp.data.result === 'not-on-board'){
      this.showMessage(`${word} is not a valid word on this board`, 'err');
    } else {
      this.showWord(word);
      this.score += word.length;
      this.showScore();
      this.words.add(word);
      this.showMessage(`Added: ${word}`, 'ok');
    }
    
    $word.val('').focus();
  }


  /* Update timer in DOM */

  showTimer() {
    $('.timer', this.board).text(this.timeLeft);
  }

  /* Handle a second passing in game */

  async updateTimer() {
    this.timeLeft -= 1;
    this.showTimer();

    if (this.timeLeft === 0) {
      clearInterval(this.timer);
      await this.scoreGame();
    }
  }

  /* End of game: score and update message */

  async scoreGame() {
    $('.add-word', this.board).hide();
    const resp = await axios.post('/post-score', { score: this.score });
    if (resp.data.brokeRecord) {
      this.showMessage(`New record: ${this.score}`, 'ok');
    } else {
      this.showMessage(`Final score: ${this.score}`, 'ok');
    }
  }
}

