"use strict"

import Slider from "./Slider"
import Range from "./Range"
import "babel-polyfill"

const main = () => {
	// Map
	function initMap() {
		const mapOptions = {
			zoom: 16,
			center: new google.maps.LatLng(59.9395, 30.331),
			panControl: false,
			zoomControl: false,
			scaleControl: false,
			streetViewControl: false,
			overviewMapControl: false,
			mapTypeControl: false,
			disableDefaultUI: true,
			disableDoubleClickZoom: true,
			scrollwheel: false
		}
		const map = document.getElementById("map") && new google.maps.Map(document.getElementById("map"), mapOptions)

		const myLatLng = new google.maps.LatLng(59.93857, 30.3245)
		const marker = new google.maps.Marker({
			position: myLatLng,
			icon: "img/pin.png",
			map: map
		})

		marker.setMap(map)
	}
	google && google.maps.event.addDomListener(window, "load", initMap)

	// Popup
	const popup = document.querySelector(".popup")

	const openPopupButton = document.querySelector(".btn-popup-show")

	const closePopupButton = popup && popup.querySelector(".btn-popup-close")

	openPopupButton.addEventListener("click", e => {
		e.preventDefault()
		popup.classList.add("popup--open")
	})

	closePopupButton.addEventListener("click", e => {
		e.preventDefault()
		popup.classList.remove("popup--open")
	})

	document.addEventListener("keydown", e => {
		if (e.keyCode === 27) {
			popup.classList.remove("popup--open")
		}
	})

	document.addEventListener("click", e => {
		if (!e.target.className.includes("popup")) {
			popup.classList.remove("popup--open")
		}
	})

	// Slider
	new Slider(".slider", {
		backgrounds: ["img/slide-1.png", "img/slide-2.png", "img/slide-3.png"]
	})
}

// Range
const catalog = () => {
	new Range(".filter__block--range", {
		min: 100,
		max: 1000,
		from: 200,
		to: 500,
		step: 100,
		output: {
			class: "block-title",
			template: "Цена: %value1% руб. - %value2% руб."
		}
	})
}

if (location.pathname === "/") {
	main()
}
if (location.pathname === "/catalog.html") {
	catalog()
}

/*
  x = 0 -> 0% from = 0
  x = 100 -> 52% from = 155

  0.52 x = 30
*/
