import '../styles/index.scss';
import * as data from './data.json';
import shuffle from 'shuffle-array';
import { createApp, reactive } from 'vue';
import donutty from 'donutty/dist/donutty';

if (process.env.NODE_ENV === 'development') {
  require('../index.html');
}

const maxQuestions = 2;

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
      // var donut = new Donutty(document.getElementById("donut"));
    }
  },
  updated: function () {
    this.$nextTick(function () {
      if (state.screen === 'results') {
        var score = Math.round(state.goodAnswers / state.totalQuestions * 100);

        var scoreClass;
        if (score <= 50) {
          scoreClass = "score-failure";
        } else if (score <= 75) {
          scoreClass = "score-not-bad";
        } else {
          scoreClass = "score-success";
        }

        var donut = new Donutty(document.getElementById("donut"), {
          min: 0,
          max: state.totalQuestions,
          value: state.goodAnswers,
          text: function(_) {
            return "" + score + "%";
          }
        });
        var fill = document.querySelector('.donut-fill');
        fill.classList.add(scoreClass);
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
