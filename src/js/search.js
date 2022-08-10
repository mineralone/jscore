import imgClose from '../images/close.svg';

const getTemplate = () => {
  return `
    <input
          type="text"
          class="search__input"
          placeholder='Type to search..'
          style="white-space: no-wrap"
          data-type="input"
        />
        <ul class="search__subscribtion"></ul>
    `
}

function debounce(callee, timeoutMs) {
  return function perform(...args) {
    let previousCall = this.lastCall;
    this.lastCall = Date.now()
    if (previousCall && this.lastCall - previousCall <= timeoutMs) {
      clearTimeout(this.lastCallTimer)
    }
    this.lastCallTimer = setTimeout(() => callee(...args), timeoutMs)
  }
}

export class Search {

    constructor(selector) {
      this.$el = document.querySelector(selector);
      this.#render();
      this.#setup();
    }

  open() {
    this.$el.classList.add('open');
  }
  close() {
    this.$el.classList.remove('open');
    }
  
  #render() {
    this.$el.innerHTML = getTemplate();
  }

  #setup() {
    this.$listRep = this.$el.querySelector('.search__subscribtion');
    this.$input = this.$el.querySelector('.search__input');

    this.clickHandler = this.clickHandler.bind(this);
    this.inputValueChange = this.inputValueChange.bind(this);
    
    this.$el.addEventListener('click', this.clickHandler);
    this.$input.addEventListener('input', debounce(this.inputValueChange, 400));
  }

  createElement(tagName, className, dataAtrArray, textCont, textInner) {
    const $elem = document.createElement(tagName);
    if (className) $elem.classList.add(className);
    if (dataAtrArray) dataAtrArray.forEach(item => $elem.dataset[item[0]] = item[1]);
    if (textCont) $elem.textContent = textCont;
    if (textInner) $elem.innerText = textInner;
    return $elem;
  }

  renderDrop(array) {
    const delUl = document.querySelector('.search__dropdown');
    if (delUl) this.$el.removeChild(delUl);
    const $ul = this.createElement('ul', 'search__dropdown')
    this.$input.after($ul);
    
    for (let item of array) {
      let $li = this.createElement('li', 'search__item',
        [ ['type', 'item'],
          ['name', `${item.name}`],
          ['owner', `${item.owner.login}`],
          ['stars', `${item['stargazers_count']}`] ], `${item.name}`)
        $ul.appendChild($li);
      }
  }

  clickHandler(event) {
    const { type } = event.target.dataset;
    if (type === 'item') {
      this.close();
      this.$input.value = '';
      this.addRepository(event.target.dataset);
    } else if (type === 'cardDelete') {
      this.delCard((event.target).closest('li'));
    }
  }

  addRepository(obj) {
    const $card = this.createElement('li', 'repository', [['type', 'card']]);
    const $cardText = this.createElement('div', 'repository__text-info', null, null, `Name: ${obj['name']}
    Owner: ${obj['owner']}
    Stars: ${obj['stars']}
    `)
    const $btnDel = this.createElement('button', 'repository__btn-delete')
    const $imgDel = this.createElement('img', 'repository__btn-icon', [['type', 'cardDelete']]);
    $imgDel.src = `${imgClose}`;
    $btnDel.appendChild($imgDel);
    $card.appendChild($cardText);
    $card.appendChild($btnDel);
    this.$listRep.appendChild($card);
  }

  delCard(card) {
    this.$listRep.removeChild(card);
  }

  async inputValueChange(event) {
    try {
      let { value } = event.target;
      if (value.length > 0) {
        let data = await this.sendRequest(value);
        await this.renderDrop(data.items);
        await this.open();
      } else {
        this.close();
      }
    } catch (e) {
      console.log('Error', e)
    }
  }
  
  async sendRequest(key) {
    try {
      let url = `https://api.github.com/search/repositories?q=${key}&per_page=5`;
      let req = await fetch(url, {
        headers: {
          'Content-type': 'application/json; charset=UTF-8'
        }
      });
      return req.json();
    } catch(e) {
      console.log('Error', e);
    }
  }
}
