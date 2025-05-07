import icons from "url:../../img/icons.svg";

export default class View {
  _data;

  /**
   * render the recived object to the dom
   * @param {Object| Object[]} data  The data to be rendered
   * @param {boolean} [render=true]  if false create markup instead of rendering to the DOM
   * @returns  {undefined | string} A markup string is returnable if render= false
   * @this {Object} View instance
   */
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length == 0))
      return this.renderError();
    this._data = data;

    const markup = this._generateMarkup();
    if (!render) return markup;
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  update(data) {
    this._data = data;

    const newMarkup = this._generateMarkup();

    const newDOM = document.createRange().createContextualFragment(newMarkup);

    const newElement = Array.from(newDOM.querySelectorAll("*"));

    const currElement = Array.from(this._parentElement.querySelectorAll("*"));

    newElement.forEach((newEl, i) => {
      const currEl = currElement[i];
      if (
        !newEl.isEqualNode(currEl) &&
        newEl.firstChild?.nodeValue.trim() !== ""
      ) {
        currEl.textContent = newEl.textContent;
      }

      if (!newEl.isEqualNode(currEl)) {
        Array.from(newEl.attributes).forEach((attr) =>
          currEl.setAttribute(attr.name, attr.value)
        );
      }
    });
  }

  renderSpinner = () => {
    const markup = `<div class="spinner">
                <svg>
                  <use href="${icons}#icon-loader"></use>
                </svg>
              </div>`;
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  };

  renderError = (msg = this._errorMessage) => {
    const markup = `
          <div class="error">
            <div>
              <svg>
                <use href="${icons}#icon-alert-triangle"></use>
              </svg>
            </div>
            <p>${msg}</p>
          </div>
          `;
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  };

  renderMessage = (msg = this._message) => {
    const markup = `
          <div class="message">
            <div>
              <svg>
                <use href="${icons}#icon-smile"></use>
              </svg>
            </div>
            <p>${msg}</p>
          </div>
          `;
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  };

  _clear() {
    this._parentElement.innerHTML = "";
  }
}
