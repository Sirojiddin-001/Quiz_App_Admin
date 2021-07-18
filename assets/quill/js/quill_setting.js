let toolbarOptions = [
  ["bold"],
  [{ script: "sub" }, { script: "super" }],
  ["code-block"],
  ["formula"],
  [
    {
      list: "ordered",
    },
    {
      list: "bullet",
    },
  ],
  [
    {
      color: [],
    },
  ],

  ["clean"],
];

let editors = ["#question", "#option_1", "#option_2"];

editors.forEach((i) => {
  setTimeout(() => {
    new Quill(i, {  
      modules: {
        syntax: true,
        toolbar: toolbarOptions,
      },
      theme: "bubble",
    });
  }, 50);
});
