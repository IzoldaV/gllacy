export default class Range {
	constructor(el, options) {
		this.defaultOptions = {
			min: 0,
			max: 100,
			from: 10,
			to: 50,
			step: 1,
			output: {
				class: "range__output",
				template: "%value1% - %value2%"
			}
		}
		if (!el) {
			throw new Error("Element is not defined!")
		}
		this.el = el
		this.options = Object.assign({}, this.defaultOptions, options)
		this.container = document.querySelector(this.el)
		this.innerProps = {
			handleWidth: 0,
			sliderWidth: 0,
			sliderLeft: 0,
			innerStep: 0,
			stepSize: 0,
			stepCount: 1,
			stepMult: 1,
			isDragging: false,
			handles: {
				active: undefined,
				min: {
					x: 0
				},
				max: {
					x: 0
				}
			},
			values: {
				min: 0,
				max: 0
			}
		}
		this._init()
	}

	_init() {
		this._createRange()
	}

	createEvents(el, ev, callback) {
		const events = ev.split(" ")

		events.forEach(event => {
			el.addEventListener(event, callback)
		})
	}

	_createRange() {
		this.range = document.createElement("DIV")
		this.range.classList.add("range")

		this.main = document.createElement("DIV")
		this.main.classList.add("range__main")

		this.line = document.createElement("DIV")
		this.line.classList.add("range__line")

		this.range.appendChild(this.main)
		this.main.appendChild(this.line)
		this._createHandles()
		this._createBar()

		this.container.appendChild(this.range)

		this._setInitialValues()

		this._setHandle()
		this._setBar()
		this._createOutput()
		this._render()
	}

	_createOutput() {
		this.output = document.createElement("p")
		this.output.classList.add(this.options.output.class)
		this.output.textContent = this.options.output.template
		this.container.insertBefore(this.output, this.range)
	}

	_createBar() {
		this.bar = document.createElement("DIV")
		this.bar.classList.add("range__bar")
		this.main.appendChild(this.bar)
	}

	_createHandles() {
		const body = document.querySelector("body")

		this.handleMin = document.createElement("span")
		this.handleMin.classList.add("range__handle", "range__handle--min")

		this.handleMax = document.createElement("span")
		this.handleMax.classList.add("range__handle", "range__handle--max")

		this.main.appendChild(this.handleMin)
		this.main.appendChild(this.handleMax)

		this.createEvents(body, "touchmove mousemove", this._move.bind(this))
		this.createEvents(body, "touchend mouseup", this._drop.bind(this))

		this.createEvents(this.handleMax, "touchstart mousedown", this._grab.bind(this))
		this.createEvents(this.handleMin, "touchstart mousedown", this._grab.bind(this))
	}

	_move(e) {
		const { sliderLeft, handleWidth, isDragging, handles } = this.innerProps

		if (!isDragging || !handles.active) {
			return
		}

		const coords = e.touches ? e.touches[0].pageX - sliderLeft - handleWidth / 2 : e.pageX - sliderLeft - handleWidth / 2

		const activeHandle = handles.active
		handles[activeHandle].x = coords

		this._setValues()
	}

	_setInitialValues() {
		const { min, max, from, to, step } = this.options

		this.innerProps.handleWidth = this.handleMin.getBoundingClientRect().width
		this.innerProps.sliderLeft = this.line.getBoundingClientRect().left
		this.innerProps.sliderWidth = this.line.getBoundingClientRect().width

		this.innerProps.stepCount = max / step
		this.innerProps.stepSize = this.innerProps.sliderWidth / this.innerProps.stepCount
		this.innerProps.innerStep = step / max
		this.innerProps.stepMult = this.innerProps.innerStep * step

		let { handles, innerStep, stepSize, stepMult } = this.innerProps
		let innerMin = (handles.min.x * 100) / stepSize
		innerMin = innerMin >= step ? innerMin : min

		handles.min.x = ((from * innerStep) / stepMult) * stepSize
		handles.max.x = ((to * innerStep) / stepMult) * stepSize

		this.innerProps.values = {
			min: Math.ceil(innerMin),
			max: Math.ceil((handles.max.x * 100) / stepSize)
		}
	}

	/**
	 * Set rangeSlider values
	 *
	 * @private
	 */
	_setValues() {
		const { innerStep, stepSize, sliderWidth, handles, handleWidth } = this.innerProps
		const activeHandle = handles.active
		const coords = handles[activeHandle].x

		let x = Math.round(Math.round(coords / innerStep) / sliderWidth) * stepSize

		if (x < stepSize) {
			x = handleWidth / 2
		} else if (x > sliderWidth) {
			x = sliderWidth
		}

		handles[activeHandle].x = x
		this._setHandle()
		this._setBar()
		this._calcValues()
		this._render()
	}

	_calcValues() {
		const { handles, stepSize } = this.innerProps
		const { min, step } = this.options

		let innerMin = (handles.min.x * 100) / stepSize
		innerMin = innerMin >= step ? innerMin : min

		this.innerProps.values = {
			min: Math.ceil(innerMin),
			max: Math.ceil((handles.max.x * 100) / stepSize)
		}
	}

	_render() {
		const { values } = this.innerProps
		this.output.textContent = this.options.output.template.replace("%value1%", values.min).replace("%value2%", values.max)
	}

	_grab(e) {
		e.preventDefault()
		const { handles } = this.innerProps

		if (e.target.classList.contains("range__handle--max")) {
			this.innerProps.isDragging = true
			handles.active = "max"
			this.range.classList.add("range--dragging")
		} else if (e.target.classList.contains("range__handle--min")) {
			this.innerProps.isDragging = true
			handles.active = "min"
			this.range.classList.add("range--dragging")
		}

		return false
	}

	_drop(e) {
		e.preventDefault()

		this.range.classList.remove("range--dragging")
		this.innerProps.isDragging = false
		this.innerProps.handles.active = ""
	}

	_setHandle() {
		const { handles } = this.innerProps
		const min = handles.min.x
		const max = handles.max.x
		this.handleMin.style.left = `${min}px`
		this.handleMax.style.left = `${max}px`
	}

	_setBar() {
		const { handles } = this.innerProps
		const min = handles.min.x
		const max = handles.max.x

		const width = max - min

		this.bar.style.left = `${min}px`
		this.bar.style.width = `${width}px`
	}
}

// todo: Вынести вычислениe X/initialX в методы-хелперы
// todo: Задать минимальное значение равным максимальному при их равенстве и наоборот
// todo: Задавать значение ближайшего к курсору ползунка при клике на шкалу
