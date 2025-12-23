"use strict";

async function DataTable(config) {
  const container = document.querySelector(config.parent);
  container.innerHTML = "";

  const addModal = document.createElement("div");
  addModal.classList.add("modal");
  container.appendChild(addModal);
  config.columns.forEach((column) => {
    if (column.input) {
      const input = document.createElement("input");
      column.input instanceof Array
        ? Object.entries(column.input).forEach((attribute) => {
            const inputElement = document.createElement("input");
            inputElement.setAttribute(attribute[0], attribute[1]);
            addModal.appendChild(inputElement);
          })
        : input.setAttribute("type", column.input.type);
      input.name = column.input.name;
      addModal.appendChild(input);
    }
  });

  const addButton = document.createElement("button");
  addButton.textContent = "Додати";
  addButton.classList.add("add-button");
  addButton.addEventListener("click", () => {});
  container.appendChild(addButton);

  let processData = (data) => {
    const table = document.createElement("table");
    const tableHeader = document.createElement("thead");
    const headerRow = document.createElement("tr");

    const firstCell = document.createElement("th");
    firstCell.textContent = "№";
    headerRow.appendChild(firstCell);

    config.columns
      .map((c) => c.title)
      .forEach((title) => {
        const cell = document.createElement("th");
        cell.textContent = title;
        headerRow.appendChild(cell);
      });

    const lastCell = document.createElement("th");
    lastCell.textContent = "Дії";
    headerRow.appendChild(lastCell);

    tableHeader.appendChild(headerRow);
    table.appendChild(tableHeader);

    const tableBody = document.createElement("tbody");

    let number = 0;
    data.forEach((element) => {
      const bodyRow = document.createElement("tr");

      const firstCell = document.createElement("td");
      firstCell.textContent = ++number;
      bodyRow.appendChild(firstCell);

      config.columns
        .map((c) => c.value)
        .forEach((value) => {
          const cell = document.createElement("td");
          const content =
            value instanceof Function ? value(element[1]) : element[1][value];
          if (content instanceof HTMLElement) {
            cell.appendChild(content);
          } else {
            cell.innerHTML = content;
          }
          bodyRow.appendChild(cell);
        });

      const lastCell = document.createElement("td");
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Видалити";
      deleteButton.classList.add("delete-button");
      deleteButton.addEventListener("click", async () => {
        await fetch(`${config.apiUrl}/${element[0]}`, {
          method: "DELETE",
        }).then(() => DataTable(config));
      });
      lastCell.appendChild(deleteButton);

      bodyRow.appendChild(lastCell);
      tableBody.appendChild(bodyRow);
    });
    table.appendChild(tableBody);

    container.appendChild(table);
  };

  await fetch(config.apiUrl)
    .then((response) => response.json())
    .then((json) => Object.entries(json.data))
    .then((data) => processData(data));
}

let getAge = (birthday) => {
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

let getColorLabel = (color) => {
  const label = document.createElement("div");
  label.style.backgroundColor = color;
  label.style.width = "100%";
  label.style.height = "100%";
  return label;
};

const config1 = {
  parent: "#usersTable",
  columns: [
    { title: "Ім’я", value: "name", input: { type: "text" } },
    { title: "Прізвище", value: "surname", input: { type: "text" } },
    { title: "Вік", value: (user) => getAge(user.birthday) }, // функцію getAge вам потрібно створити
    {
      title: "Фото",
      value: (user) =>
        `<img src="${user.avatar}" alt="${user.name} ${user.surname}"/>`,
    },
  ],
  apiUrl: "https://mock-api.shpp.me/pbondarenko/users",
};

DataTable(config1);

const config2 = {
  parent: "#productsTable",
  columns: [
    { title: "Назва", value: "title", input: { type: "text" } },
    {
      title: "Ціна",
      value: (product) => `${product.price} ${product.currency}`,
      input: [
        { type: "number", name: "price", label: "Ціна" },
        {
          type: "select",
          name: "currency",
          label: "Валюта",
          options: ["$", "€", "₴"],
          required: false,
        },
      ],
    },
    {
      title: "Колір",
      value: (product) => getColorLabel(product.color),
      input: { type: "color", name: "color" },
    }, // функцію getColorLabel вам потрібно створити
  ],
  apiUrl: "https://mock-api.shpp.me/pbondarenko/products",
};

DataTable(config2);
