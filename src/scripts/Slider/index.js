class Slider {
  constructor(el, options) {
    this.defaultOptions = {
      arrows: false,
      dots: true,
      backgrounds: [],
			titles: [],
      items: 1
    };
    if (!el) {
      throw new Error('Element is not defined!');
    }
    this.el = el;
    this.options = Object.assign({}, this.defaultOptions, options);
    this.container = document.querySelector(this.el);
    this.activeIndex = 0

    this._init();
  }

  _init() {
    this._create();
    if (this.options.dots) {
      this._createDots();
    }
    this._createBackgrounds(this.activeIndex)
		this._createTitleSlide(this.activeIndex)
  }

  _create() {
    const sliderWidth = this.container.getBoundingClientRect().width;
    this.container.classList.add('ui-slider');
    this.slides = [...this.container.querySelectorAll('.slide')];
    const wrapper = document.createElement('DIV');
    wrapper.classList.add('ui-slider__wrapper');


    this.slides.forEach(item => {
      item.style.width = `${sliderWidth / this.options.items}px`;
    });

    const inner = document.createElement('DIV');
    inner.classList.add('ui-slider__inner');
    inner.style.width = `${this.slides.length * this.slides[0].getBoundingClientRect().width}px`;
    wrapper.appendChild(inner);

    this.slides.forEach(item => {
      inner.appendChild(item);
    });

    [...this.container.querySelectorAll(':not(.ui-slider__wrapper)')]
    .forEach(item => {
      item.parentNode.removeChild(item);
    });

    this.container.appendChild(wrapper);
  }

  _createDots() {
    const dotsContainer = document.createElement('DIV');
    dotsContainer.classList.add('ui-slider__dots');
    this.container.appendChild(dotsContainer);

    const fragment = document.createDocumentFragment();

    this.slides.forEach((slide, index) => {
      const dot = document.createElement('SPAN');
      dot.classList.add('ui-slider__dot');
      dot.addEventListener('click', function (e) {
        for (let item of e.target.parentNode.children) {
          item.classList.remove('ui-slider__dot--active');
        }
        e.target.classList.add('ui-slider__dot--active');
        this.activeIndex = index;
        this._createBackgrounds(index)
				this._createTitleSlide(index)
      }.bind(this));
      fragment.appendChild(dot);
    });

    dotsContainer.appendChild(fragment);

    this.dots = [...dotsContainer.querySelectorAll('.ui-slider__dot')]
    this.dots[this.activeIndex].classList.add('ui-slider__dot--active');
  }

  _createBackgrounds(index) {
    const _body = document.querySelector('body');
    _body.classList.add('ui-slider__bg')
    _body.style.backgroundImage = `url(${this.options.backgrounds[index]})`;
  }

  _createTitleSlide(index) {
  	const _titleSlide = document.querySelector('.slide-title')
	//	_titleSlide.classList.add('.slide-title')
		_titleSlide.innerText = `${this.options.titles[index]}`
	}
}

export default Slider;
