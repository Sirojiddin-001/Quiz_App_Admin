const question = document.getElementById("question");
const counter = document.getElementById("counter");
const addOptionBtn = document.getElementById("add");
const optionsBlock = document.getElementById("options_block");
const prevBtn = document.getElementById("prev");
const quitBtn = document.getElementById("quit");
const nextBtn = document.getElementById("next");
const openQuizBtn = document.getElementById("open_quiz");
const closeQuizBtn = document.getElementById("close_quiz");

let count = 1;
let questionsCount;
let optionsCount = document.querySelectorAll(".option").length;
let object = {};

openQuizBtn.addEventListener("click", () => {
  questionsCount = document.getElementById("count_questions").value;
  object.name = document.getElementById("test_name").value;
  object.duration = document.getElementById("test_duration").value;
  object.questions = questionsCount;
  object.reopen = document.getElementById("count_reopen").value;
  hiddenBtn();
  counterInit();
  quitBtn.addEventListener("click", quitQuiz);
});

closeQuizBtn.addEventListener("click", () => {
  count = 1;
  object = {};
  allClear();
});

function hiddenBtn() {
  if (count == questionsCount) {
    nextBtn.classList.add("uk-hidden");
    quitBtn.classList.remove("uk-hidden");
  } else {
    nextBtn.classList.remove("uk-hidden");
    quitBtn.classList.add("uk-hidden");
  }
  if (count < 2) {
    prevBtn.classList.add("uk-hidden");
  } else {
    prevBtn.classList.remove("uk-hidden");
  }
}

function newQuill(id) {
  new Quill(id, {
    modules: {
      toolbar: toolbarOptions,
    },
    theme: "bubble",
  });
}

function addOption() {
  optionsCount++;
  editors.push(`#option_${optionsCount}`);
  let element = document.createElement("div");
  element.className = `answer-block uk-flex uk-flex-between uk-flex-middle uk-margin`;
  element.innerHTML = `<div class="answer"><input class="uk-radio" type="radio" name="answer"></div><div class="option" id="option_${optionsCount}"></div>`;
  let deleteBtn = document.createElement("span");
  deleteBtn.id = `option_${optionsCount}`;
  deleteBtn.className = "delete";
  deleteBtn.setAttribute("uk-icon", "icon: trash;ratio: 1.3");
  deleteBtn.setAttribute("title", "Удалить");
  deleteBtn.addEventListener("click", function () {
    deleteOption(this);
  });
  element.appendChild(deleteBtn);
  optionsBlock.append(element);
  newQuill(`#option_${optionsCount}`);
}

function deleteOption(el) {
  el.parentElement.remove();
  if (optionsCount > 2) optionsCount--;
}

function counterInit() {
  counter.innerHTML = `${count}/${questionsCount}`;
}

function errorToast(message = "Поле не может быть пустым !") {
  UIkit.notification({
    message: message,
    pos: "bottom-right",
    status: "danger",
  });
}

function successToast(message = "Выполнено !") {
  UIkit.notification({
    message: message,
    pos: "bottom-right",
    status: "success",
  });
}

function allClear() {
  question.firstChild.innerHTML = "";
  document.querySelectorAll(".option").forEach((el) => {
    el.firstChild.innerHTML = "";
  });
  document.getElementsByName("answer").forEach((el) => {
    if (el.checked) {
      el.checked = false;
    }
  });
}

function addQuestion(num = 0) {
  object[`question_${count + num}`] = {};
  object[`question_${count + num}`].question = question.firstChild.innerHTML;
  document.querySelectorAll(".option").forEach((el, i) => {
    object[`question_${count + num}`][`option_${i + 1}`] =
      el.firstChild.innerHTML;
  });
  object[`question_${count + num}`].answer =
    object[`question_${count + num}`][`option_${answerSelect() + 1}`];
}

function answerSelect() {
  let idx = 0;
  document.getElementsByName("answer").forEach((el, i) => {
    if (el.checked) {
      idx = i;
    }
  });
  return idx;
}

function viewQuestion(num = 0) {
  question.firstChild.innerHTML = object[`question_${count + num}`].question;
  document.querySelectorAll(".option").forEach((el, i) => {
    el.firstChild.innerHTML =
      object[`question_${count + num}`][`option_${i + 1}`];
    if (el.firstChild.innerHTML == object[`question_${count + num}`].answer) {
      document.getElementsByName("answer")[i].checked = true;
    }
  });
}

function moreAddOptions(num = 0) {
  if (
    document.querySelectorAll(".option").length <
    Object.keys(object[`question_${count + num}`]).length - 2
  ) {
    for (
      let i = document.querySelectorAll(".option").length;
      i < Object.keys(object[`question_${count + num}`]).length - 2;
      i++
    ) {
      addOption();
    }
  }
}

function moreDeleteOptions(num = 0) {
  if (
    document.querySelectorAll(".option").length >
    Object.keys(object[`question_${count + num}`]).length - 2
  ) {
    for (
      let i = document.querySelectorAll(".option").length;
      i > Object.keys(object[`question_${count + num}`]).length - 2;
      i--
    ) {
      document.querySelectorAll(".option")[i - 1].parentElement.remove();
    }
  }
}

function prevQuestion() {
  if (count > 1) {
    count--;
    counterInit();
  }
  moreAddOptions();
  moreDeleteOptions();
  viewQuestion();
  hiddenBtn();
}

function nextQuestion() {
  if (count <= questionsCount) {
    if (question.firstChild.innerHTML == "") {
      errorToast();
      return;
    }

    for (let i = 0; i < document.querySelectorAll(".option").length; i++) {
      if (
        document.querySelectorAll(".option")[i].firstChild.textContent == ""
      ) {
        errorToast();
        document.querySelectorAll(".option")[i].firstChild.focus();
        return false;
      }
    }

    let check = 0;
    for (let i = 0; i < document.getElementsByName("answer").length; i++) {
      if (document.getElementsByName("answer")[i].checked) {
        check++;
        break;
      }
    }

    if (!check) {
      errorToast("Выбирайте правильный ответ");
      return false;
    }

    if (count < Object.keys(object).length - 4) {
      addQuestion();
      moreAddOptions(1);
      moreDeleteOptions(1);
      viewQuestion(1);
    } else {
      addQuestion();
      allClear();
    }

    if (count < questionsCount) {
      count++;
      counterInit();
    }
  }
  hiddenBtn();
}

let quizzesData = firebase.database().ref("quizzesCount");
let quizzesCount;
quizzesData.on("value", (snapshot) => {
  const data = snapshot.val();
  quizzesCount = data || 0;
});

function quitQuiz() {
  if (question.firstChild.innerHTML == "") {
    errorToast();
    return;
  }

  for (let i = 0; i < document.querySelectorAll(".option").length; i++) {
    if (document.querySelectorAll(".option")[i].firstChild.textContent == "") {
      errorToast();
      document.querySelectorAll(".option")[i].firstChild.focus();
      return false;
    }
  }

  let check = 0;
  for (let i = 0; i < document.getElementsByName("answer").length; i++) {
    if (document.getElementsByName("answer")[i].checked) {
      check++;
      break;
    }
  }

  if (!check) {
    errorToast("Выбирайте правильный ответ");
    return false;
  }

  addQuestion();
  allClear();

  quizzesCount++;

  firebase.database().ref("/quizzesCount").set(quizzesCount);
  firebase.database().ref(`/quizzes/quiz_${quizzesCount}`).set(object);

  closeQuizBtn.click();
  render();
  successToast();
}

addOptionBtn.addEventListener("click", addOption);
prevBtn.addEventListener("click", prevQuestion);
nextBtn.addEventListener("click", nextQuestion);
quitBtn.addEventListener("click", quitQuiz);

function removeQuiz(e) {
  if (quizzesCount > 0) {
    quizzesCount--;
    firebase.database().ref("/quizzesCount").set(quizzesCount);
  }
  let key = e.parentElement.dataset.id;
  firebase.database().ref(`/quizzes/${key}`).remove();
  render();
}

function updateQuiz(e) {
  let key = e.parentElement.dataset.id;
  let query = firebase.database().ref("quizzes").orderByKey();
  query
    .once("value")
    .then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        if (childSnapshot.key == key) {
          object = childSnapshot.val();
          questionsCount = childSnapshot.val().questions;
        }
      });
    })
    .then(() => {
      quitBtn.removeEventListener("click", quitQuiz);
      quitBtn.addEventListener("click", () => {
        if (question.firstChild.innerHTML == "") {
          return;
        }

        for (let i = 0; i < document.querySelectorAll(".option").length; i++) {
          if (
            document.querySelectorAll(".option")[i].firstChild.textContent == ""
          ) {
            document.querySelectorAll(".option")[i].firstChild.focus();
            return false;
          }
        }

        let check = 0;
        for (let i = 0; i < document.getElementsByName("answer").length; i++) {
          if (document.getElementsByName("answer")[i].checked) {
            check++;
            break;
          }
        }

        if (!check) {
          errorToast("Выбирайте правильный ответ");
          return false;
        }
        addQuestion();
        firebase.database().ref(`/quizzes/${key}`).set(object);
        closeQuizBtn.click();
        render();
        successToast();
      });
      hiddenBtn();
      counterInit();
      moreAddOptions();
      moreDeleteOptions();
      viewQuestion();
    });
}

function render() {
  document.getElementById("category").innerHTML = "";
  let query = firebase.database().ref("quizzes").orderByKey();
  query.once("value").then(function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      let id = childSnapshot.key;
      let name = childSnapshot.val().name;
      let duration = childSnapshot.val().duration;
      let questionsC = childSnapshot.val().questions;
      let reopenCount = childSnapshot.val().reopen;
      document.getElementById("category").insertAdjacentHTML(
        "afterbegin",
        `<div>
          <div class="uk-card uk-card-default uk-card-hover">
            <div class="uk-card-header">
              <div class="uk-width-1-1 uk-flex uk-flex-between uk-flex-middle">
                <h3 class=" uk-card-title uk-margin-remove-bottom">${name}</h3>
                  <div class="uk-inline">
                      <a href="##" uk-icon="icon: more-vertical"></a>
                      <div uk-dropdown="mode: click">
                        <ul class="uk-nav uk-dropdown-nav">
                          <li data-id="${id}"><button onclick="updateQuiz(this)" class="uk-button uk-button-primary uk-width-1-1 uk-margin-bottom"  href="#modal-full" uk-toggle>Изменить</button></li>
                          <li data-id="${id}"><button onclick="removeQuiz(this)" id="data_remove" class="uk-button uk-button-danger uk-width-1-1">Удалить</button></li>
                        </ul>
                       </div>
                   </div>
              </div>
            </div>
            <div class="uk-card-body">
                <p>
                    Время теста: ${duration} мин.<br>
                    Количество вопросов: ${questionsC}<br>
                    Количество попыток: ${reopenCount}<br>
                </p>
            </div>
          </div>
        </div>`
      );
    });
  });
}

document.addEventListener("DOMContentLoaded", render);

const inputValidate = (el) => {
  const element = document.getElementById(el);
  const validateTrue = () => {
    element.classList.remove("uk-form-danger");
    element.classList.add("uk-form-success");
  };
  const validateFalse = (text) => {
    errorToast(text);
    element.classList.remove("uk-form-success");
    element.classList.add("uk-form-danger");
  };
  const classContains = () => {
    if (
      document.querySelectorAll(`#data .uk-form-success`).length ==
      document.querySelectorAll(`#data .uk-input`).length
    ) {
      document.getElementById("open_quiz").removeAttribute("disabled");
    } else {
      document.getElementById("open_quiz").setAttribute("disabled", "");
    }
  };
  element.addEventListener("input", function () {
    if (this.value.length < 1) {
      validateFalse("Поле не может быть пустым !");
    } else {
      validateTrue();
    }
    classContains();
  });
};

inputValidate("test_name");
inputValidate("test_duration");
inputValidate("count_questions");
inputValidate("count_reopen");
