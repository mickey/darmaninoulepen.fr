import '../styles/index.scss';
import * as data from './data.json';
import shuffle from 'shuffle-array';
import { createApp, reactive } from 'vue';
import donutty from 'donutty/dist/donutty';

if (process.env.NODE_ENV === 'development') {
  require('../index.ejs');
}

const maxQuestions = 12;

function randomQuestions() {
  var darmanin = shuffle.pick(data["darmanin"], {
    'picks': maxQuestions / 2
  });
  if (!Array.isArray(darmanin)) {
    darmanin = [darmanin];
  }
  for (const element of darmanin) {
    element["who"] = "darmanin";
  }

  var lepen = shuffle.pick(data["lepen"], {
    'picks': maxQuestions / 2
  });
  if (!Array.isArray(lepen)) {
    lepen = [lepen];
  }
  for (const element of lepen) {
    element["who"] = "lepen";
  }

  return shuffle(lepen.concat(darmanin));
}

function randomTitle(titleData) {
  return shuffle.pick(data[titleData]);
}

const state = reactive({
  currentQuestionIndex: 1,
  totalQuestions: maxQuestions,
  goodAnswers: 0,
  start: Date.now(),
  score: null,
  screen: 'question',
  currentAnswer: null,
  quizQuestions: randomQuestions()
});

function getCurrentQuestion() {
  var question = state.quizQuestions[state.currentQuestionIndex - 1];
  return {
    who: question.who,
    quote: question.quote,
    sourceType: question.source_type,
    source: question.source,
    sourceTitle: question.source_title,
    sourceImage: question.source_image,
    sourceDesc: question.source_description
  };
}

function getElapsedTime() {
  var timeToFinishInSeconds = Math.round((Date.now() - state.start) / 1000);
  var minutes = Math.floor(timeToFinishInSeconds / 60);
  var seconds = timeToFinishInSeconds - minutes * 60;
  var elapsedTime = "";
  if (minutes > 0) {
    elapsedTime += minutes + "mn ";
  }
  elapsedTime += seconds + "s";

  return elapsedTime;
}

function getShareLinks() {
  var url = "https://darmaninoulepen.fr";
  var twitterText = "Mon score: " + state.score + "%. Darmanin ou Le Pen, trouves qui l'a dit ? " + url;
  var redditTitle = "Darmanin ou Le Pen, trouves qui l'a dit ?";


  return {
    reddit: encodeURI("https://reddit.com/submit/?url=" + url + "resubmit=true&amp;title=" + redditTitle),
    twitter: encodeURI("https://twitter.com/intent/tweet/?text=" + twitterText),
    facebook: encodeURI("https://facebook.com/sharer/sharer.php?u=" + url),
    whatsapp: encodeURI("whatsapp://send?text=" + twitterText)
  };
}

const Quiz = {
  data() {
    return {
      state: state,
      currentQuestion: getCurrentQuestion()
    };
  },
  methods: {
    answer: function(name) {
      var answerLabel = getCurrentQuestion().who === name ? 'ok' : 'ko';

      state.screen = 'answer';
      state.currentAnswer = answerLabel;
      state.currentTitle = randomTitle(answerLabel);
      state.currentTitlePre = state.currentAnswer === 'ok' ? '✅' : '❌';

      if (state.currentAnswer === 'ok') {
        state.goodAnswers += 1;
      }
      twttr.widgets.load();
    },
    next: function() {
      state.screen = 'question';
      state.currentQuestionIndex += 1;
      state.currentAnswer = null;
      this.currentQuestion = getCurrentQuestion();
    },
    finish: function() {
      state.screen = 'results';
      state.currentAnswer = null;
      state.score = Math.round(state.goodAnswers / state.totalQuestions * 100);

      if (state.score <= 50) {
        this.scoreClass = "color-failure";
        this.resultTitle = data["result_title_failure"];
      } else if (state.score <= 75) {
        this.scoreClass = "color-not-bad";
        this.resultTitle = data["result_title_not_bad"];
      } else {
        this.scoreClass = "color-success";
        this.resultTitle = data["result_title_success"];
      }

      this.elapsedTime = getElapsedTime();
      this.shareLinks = getShareLinks();
    }
  },
  updated: function () {
    this.$nextTick(function () {
      if (state.screen === 'results') {
        var donut = new Donutty(document.getElementById("donut"), {
          min: 0,
          max: state.totalQuestions,
          value: state.goodAnswers,
          text: function(_) {
            return "" + state.score + "%";
          }
        });
        var fill = document.querySelectorAll('.donut-fill,.donut-text');
        for (var i = 0; i < fill.length; ++i) {
          fill[i].classList.add(this.scoreClass);
        }

      }
    });
  },
  computed: {
    titleClass() {
      return {
        'ok': state.currentAnswer === 'ok',
        'ko': state.currentAnswer === 'ko'
      };
    },
    borderClass() {
      return {
        'border-primary': state.screen !== 'answer',
        'border-success': state.currentAnswer === 'ok',
        'border-failure': state.currentAnswer === 'ko'
      };
    },
    statsBGClass() {
      return {
        'background-primary': state.screen !== 'answer',
        'background-success': state.currentAnswer === 'ok',
        'background-failure': state.currentAnswer === 'ko'
      };
    }
  }
};

createApp(Quiz).mount('#quiz');
