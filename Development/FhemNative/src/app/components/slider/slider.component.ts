import { Component, Input, OnDestroy, OnInit, HostListener, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';

import { FhemService } from '../../services/fhem.service';
import { SettingsService } from '../../services/settings.service';
import { TimeService } from '../../services/time.service';

@Component({
	selector: 'slider',
	template: `
		<div
			*ngIf="!customMode"
			[ngClass]="settings.app.theme"
			class="slider {{arr_data_orientation[0]}}"
			double-click
			[editingEnabled]="settings.modes.roomEdit"
			resize
			[minimumWidth]="minimumWidth"
			[minimumHeight]="minimumHeight"
			id="{{ID}}"
			(resized)="initSlider()"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}" >
			<fhem-container [specs]="{'device': data_device, 'reading': data_reading, 'available': true}">
				<ng-container *ngTemplateOutlet="Slider"></ng-container>
			</fhem-container>
		</div>
		<div *ngIf="customMode" [ngClass]="settings.app.theme" class="slider customMode {{arr_data_orientation[0]}}" [ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left}">
			<ng-container *ngTemplateOutlet="Slider"></ng-container>
		</div>
		<ng-template #Slider>
			<div [ngClass]="arr_data_style[0] === 'slider' ? 'slider-container' : 'container-box'"
				[ngStyle]="{'height': (arr_data_style[0] === 'slider' ? (arr_data_orientation[0] === 'horizontal' ? data_sliderHeight+'px' : '100%') : '100%'),
					'width': (arr_data_style[0] === 'slider' ? (arr_data_orientation[0] === 'vertical' ? data_sliderHeight+'px' : '100%') : '100%')}">
				<button *ngIf="arr_data_style[0] === 'box'" matRipple [matRippleColor]="'#d4d4d480'" class="btn reduce" (click)="setSteps('reduce')">
					<ion-icon name="remove"></ion-icon>
				</button>
				<div [ngClass]="arr_data_style[0] === 'slider' ? 'slider-outlet' : 'slider-box-inner'"
					[ngStyle]="{'height': (arr_data_style[0] === 'box' ? (arr_data_orientation[0] === 'horizontal' ? data_sliderHeight+'px' : 'calc(100% - 100px)') : '100%'),
					'width': (arr_data_style[0] === 'box' ? (arr_data_orientation[0] === 'vertical' ? data_sliderHeight+'px' : 'calc(100% - 100px)') : '100%')}">
					<div class="slider-bg">
						<div class="slider-active" [ngStyle]="{'background': style_fillColor, 'width': arr_data_orientation[0] === 'horizontal' ? move+'%' : '100%',
							'height': arr_data_orientation[0] === 'vertical' ? move+'%' : '100%'}"></div>
					</div>
					<div class="slider-thumb" [ngStyle]="{'width.px': data_thumbWidth, 'height.px': data_thumbWidth, 'background': style_thumbColor,
							'left': arr_data_orientation[0] === 'horizontal' ? move+'%' : '50%', 'bottom': arr_data_orientation[0] === 'vertical' ? move+'%' : '0'}">
						<span 
							class="pin" 
							[ngClass]="showpin ? 'show' : 'hide'" 
							[ngStyle]="{'background':style_fillColor, 'top': arr_data_orientation[0] === 'horizontal' ? (data_thumbWidth * -1)+'px' : '50%', 'left': arr_data_orientation[0] === 'vertical' ? (data_thumbWidth * -1)+'px' : '50%'}">
							{{displayAs(value)+data_labelExtension}}
							<span class="pin-arrow" [style.borderTopColor]="style_fillColor"></span>
						</span>
					</div>
					<div *ngIf="bool_data_showTicks" class="tick-container"></div>
				</div>
				<button *ngIf="arr_data_style[0] === 'box'" matRipple [matRippleColor]="'#d4d4d480'" class="btn add" (click)="setSteps('add')">
					<ion-icon name="add"></ion-icon>
				</button>
			</div>
		</ng-template>
	`,
	styles: [`
		.horizontal.slider{
			height: 30px;
			width: 200px;
		}
		.vertical.slider{
			width: 30px;
			height: 200px;
		}
		.slider{
			position: absolute;
		}
		.slider-container{
			position: absolute;
			width: 100%;
			height: 20px;
			left: 0;
			top: 50%;
			transform: translate3d(0,-50%,0);
		}
		.slider-bg{
			position: relative;
			background: #ddd;
			border-radius: 5px;
			z-index: 1;
			height: 100%;
			width: 100%;
		}
		.slider-active{
			position: absolute;
			left: 0;
			border-radius: 5px;
			z-index: 2;
		}
		.horizontal .slider-active{
			top: 0;
			left: 0;
		}
		.vertical .slider-active{
			bottom: 0;
		}
		.slider-thumb{
			position: absolute;
			border-radius: 50%;
			z-index: 3;
			cursor: pointer;
		}
		.horizontal .slider-thumb{
			top: 50%;
			transform: translate3d(0,-50%,0);
		}
		.vertical .slider-thumb{
			transform: translate3d(-50%,0,0);
		}
		.vertical .slider-container{
			height: 100%;
			top: 0;
			left: 50%;
			transform: translate3d(-50%,0,0);
		}
		.pin{
			position: absolute;
			color: #fff;
			font-size: 12px;
			line-height: 1.333;
			text-shadow: none;
			padding: 1px 5px;
			border-radius: 4px;
			opacity: 0;
			transition: all .2s ease;
		}
		.horizontal .pin{
			transform: translate3d(-50%,20px,0) scale3d(0,0,0);
		}
		.vertical .pin{
			transform: translate3d(20px, -50%,0) scale3d(0,0,0);
		}
		.pin.show{
			opacity: 1;
			transition: all 0s ease;
		}
		.horizontal .pin.show{
			transform: translate3d(-50%,0px,0) scale3d(1,1,1);
		}
		.vertical .pin.show{
			transform: translate3d(-50%, -50%,0) scale3d(1,1,1);
		}
		.pin-arrow{
			position: absolute;
			bottom: -6px;
			width: 0;
			height: 0;
			margin-left: -3px;
			overflow: hidden;
			border: 3px solid transparent;
		}
		.horizontal .pin-arrow{
			left: 50%;
		}
		.vertical .pin-arrow{
			top: 50%;
			transform: translate3d(0,-50%,0) rotate(-90deg);
			right: -6px;
		}
		.container-box{
			position: absolute;
			background: #4a4a4a;
			border-radius: 25px;
		}
		.slider-box-inner{
			position:absolute;
			top: 50%;
			left: 50%;
			transform: translate3d(-50%, -50%,0);
			z-index: 1;
		}
		.btn{
			position: absolute;
			background: transparent;
			width: 45px;
			height: 45px;
			border-radius: 50%;
		}
		.btn:focus{
			outline: 0px;
		}
		.btn ion-icon{
			width: 100%;
			height: 100%;
		}
		.horizontal .btn{
			top: 50%;
			transform: translate3d(0,-50%,0);
		}
		.vertical .btn{
			left: 50%;
			transform: translate3d(-50%,0,0);
		}
		.horizontal .btn.reduce{
			left: 0;
		}
		.horizontal .btn.add{
			right: 0;
		}
		.vertical .btn.reduce{
			bottom: 0;
		}
		.vertical .btn.add{
			top: 0;
		}
	`]
})
export class SliderComponent implements OnInit, OnDestroy {

	constructor(
		private fhem: FhemService,
		public settings: SettingsService,
		private time: TimeService,
		private ref: ElementRef) {}
	public minimumWidth = 200;
	public minimumHeight = 30;
	// Component ID
	@Input() ID: number;

	@Input() data_device = '';
	@Input() data_reading = '';
	@Input() data_setReading = '';

	@Input() data_threshold = '10';

	@Input() data_labelExtension = '';

	@Input() arr_data_style: any = ['slider', 'box'];
	@Input() arr_data_orientation: any = ['horizontal', 'vertical'];

	@Input() data_sliderHeight:any = '5';
	@Input() data_thumbWidth:any = '25';
	@Input() data_steps = '5';

	@Input() bool_data_showPin = true;
	@Input() bool_data_showTicks = false;
	@Input() bool_data_updateOnMove = false;

	@Input() data_ticks = '10';

	@Input() data_min = '0';
	@Input() data_max = '100';

	@Input() style_thumbColor = '#ddd';
	@Input() style_fillColor = '#14a9d5';

	@Input() style_tickColor = '#ddd';

	// position information
	@Input() width: any;
	@Input() height: any;
	@Input() top: any;
	@Input() left: any;
	@Input() zIndex: number;

	@Input() customMode = false;

	public fhemDevice: any;
	// fhem event subscribtions
	private deviceChange: Subscription;

	private waitForThreshold = 0;

	public value: number;
	public move: number = 0;

	public showpin = false;
	private isValueTime = false;

	private sliderEl: any;

	static getSettings() {
		return {
			name: 'Slider',
			component: 'SliderComponent',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: ''},
				{variable: 'data_setReading', default: ''},
				{variable: 'data_threshold', default: '20'},
				{variable: 'data_labelExtension', default: ''},
				{variable: 'data_ticks', default: '10'},
				{variable: 'data_min', default: '0'},
				{variable: 'data_max', default: '100'},
				{variable: 'arr_data_style', default: 'slider,box'},
				{variable: 'arr_data_orientation', default: 'horizontal,vertical'},
				{variable: 'data_sliderHeight', default: '5'},
				{variable: 'data_thumbWidth', default: '25'},
				{variable: 'data_steps', default: '5'},
				{variable: 'bool_data_showPin', default: true},
				{variable: 'bool_data_showTicks', default: false},
				{variable: 'bool_data_updateOnMove', default: false},
				{variable: 'style_thumbColor', default: '#ddd'},
				{variable: 'style_fillColor', default: '#14a9d5'},
				{variable: 'style_tickColor', default: '#ddd'}
			],
			dimensions: {minX: 200, minY: 30}
		};
	}

	@HostListener('mousedown', ['$event', '$event.target'])
	@HostListener('touchstart', ['$event', '$event.target'])
	onTouchstart(event, target) {
		if (this.fhemDevice && target.className.indexOf('slider') !== -1) {
			const whileMove = (e) => {
				this.touch(e, target);
	        };
			const endMove = () => {
				window.removeEventListener('mousemove', whileMove);
				window.removeEventListener('touchmove', whileMove);

	   			window.removeEventListener('mouseup', endMove);
	   			window.removeEventListener('touchend', endMove);

	   			this.showpin = false;

	   			if (parseInt(this.fhemDevice.readings[this.data_reading].Value) !== this.value) {
					this.sendValue(this.value);
				}
	    	};

			window.addEventListener('mousemove', whileMove);
	  		window.addEventListener('mouseup', endMove);

	  		window.addEventListener('touchmove', whileMove);
	  		window.addEventListener('touchend', endMove);
		}
	}

	ngOnInit() {
		this.fhem.getDevice(this.data_device, this.data_reading).then((device) => {
			this.fhemDevice = device;
			if (device) {
				this.value = this.checkForTime(this.fhemDevice.readings[this.data_reading].Value, true);
				this.deviceChange = this.fhem.devicesSub.subscribe(next => {
					this.listen(next);
				});
				setTimeout(() => {
					this.sliderEl = (this.arr_data_style[0] === 'slider') ? this.ref.nativeElement.querySelector('.slider-container') : this.ref.nativeElement.querySelector('.slider-box-inner');
					this.updateValue();
				}, 0);
			}
		});
	}

	private listen(update) {
		if (update.found.device === this.data_device) {
			if (update.change.changed[this.data_reading]) {
				if (parseInt(update.change.changed[this.data_reading]) !== this.value) {
					const oldValue = this.value;
					this.value = this.checkForTime(this.fhemDevice.readings[this.data_reading].Value, false);
					this.animateMove(oldValue);
				}
			}
		}
	}

	public initSlider() {
		setTimeout(() => {
			if (this.arr_data_orientation[0] === 'vertical' && this.arr_data_style[0] === 'slider') {
				this.minimumHeight = 200;
				this.minimumWidth = 30;
			}
			if (this.arr_data_style[0] === 'box' && this.arr_data_orientation[0] === 'horizontal') {
				this.minimumHeight = 60;
				this.minimumWidth = 200;
			}
			if (this.arr_data_style[0] === 'box' && this.arr_data_orientation[0] === 'vertical') {
				this.minimumHeight = 200;
				this.minimumWidth = 60;
			}
			this.updateValue();
			if (this.bool_data_showTicks) {
				this.drawTicks();
			}
		}, 0);
	}

	private updateValue() {
		setTimeout(() => {
			const x: any = Math.round(this.getValuePercentage(this.value) * 100);

			const w = (this.arr_data_orientation[0] === 'horizontal') ? this.sliderEl.clientWidth : this.sliderEl.clientHeight;
			const border: any = Math.round(((parseInt(this.data_thumbWidth) / 2) / w) * 100);
			this.move = x - border;
		});
	}

	private touch(e, target) {
		const x = e.pageX || (e.touches ? e.touches[0].clientX : 0);
		const y = e.pageY || (e.touches ? e.touches[0].clientY : 0);

		if (this.bool_data_showPin) {this.showpin = true; }

		let value = (this.arr_data_orientation[0] === 'horizontal') ?
			this.toValueNumber(((x - this.sliderEl.getBoundingClientRect().left) / this.sliderEl.clientWidth)) :
			this.toValueNumber((((( this.sliderEl.getBoundingClientRect().top + this.sliderEl.clientHeight ) -  y)) / this.sliderEl.clientHeight));
		if (value <= parseInt(this.data_min)) {value = parseInt(this.data_min); }
		if (value >= parseInt(this.data_max)) {value = parseInt(this.data_max); }
		this.value = value;
		this.updateValue();
		if (this.bool_data_updateOnMove) {
			this.waitForThreshold += 1;
			if (this.waitForThreshold === parseInt(this.data_threshold)) {
				this.sendValue(this.value);
				this.waitForThreshold = 0;
			}
		}
	}

	public setSteps(direction) {
		let value = (direction === 'add') ? this.value + parseInt(this.data_steps) : this.value - parseInt(this.data_steps);
		if (value <= parseInt(this.data_min)) {value = parseInt(this.data_min); }
		if (value >= parseInt(this.data_max)) {value = parseInt(this.data_max); }
		if (value !== this.value) {
			this.value = value;
			this.updateValue();
			this.sendValue(this.value);
		}
	}

	private sendValue(val) {
		if (this.data_setReading !== '') {
			this.fhem.setAttr(this.fhemDevice.device, this.data_setReading, this.displayAs(val));
		} else {
			this.fhem.set(this.fhemDevice.device, this.displayAs(val));
		}
	}

	private animateMove(from) {
		const x = Math.round(this.getValuePercentage(this.value) * 100);
		const border = (this.arr_data_orientation[0] === 'horizontal') ?
			Math.round(((parseInt(this.data_thumbWidth) / 2) / this.sliderEl.clientWidth) * 100) :
			Math.round(((parseInt(this.data_thumbWidth) / 2) / this.sliderEl.clientHeight) * 100);
		const to = x - border;
		const Ythis = this;
		let pos = Math.round(this.getValuePercentage(from) * 100);
		const id = setInterval(frame, 5);
		const count = (from > to) ? -1 : 1;
		function frame() {
			if (pos === to) {
				clearInterval(id);
			} else {
				pos = pos + count;
				Ythis.move = pos;
			}
		}
	}

		private drawTicks() {
			const el = this.ref.nativeElement.querySelector('.tick-container');
			for (let i = 0; i <= parseInt(this.data_ticks); i++) {
				const percentage = (100 / parseInt(this.data_ticks)) * i ;
				this.createTick(el, i, percentage);
			}
		}

		private createTick(el, num, move) {
			const tick = document.createElement('span');
			tick.className = 'tick tick-' + num;
			tick.style.position = 'absolute';
			if (this.arr_data_orientation[0] === 'horizontal') {
				tick.style.left = move + '%';
				tick.style.height = '15px';
				tick.style.width = '2px';
				tick.style.top = parseInt(this.data_sliderHeight) - 2 + 'px';
			} else {
				tick.style.top = move + '%';
				tick.style.width = '15px';
				tick.style.height = '2px';
				tick.style.left = parseInt(this.data_sliderHeight) - 2 + 'px';
			}
			tick.style.background = this.style_tickColor;
			tick.style.transition = 'all .2s ease';
			el.append(tick);
		}

	private getValuePercentage(value) {
		return (value - parseInt(this.data_min)) / (parseInt(this.data_max) - parseInt(this.data_min));
	}

	private toValueNumber(factor) {
		return Math.round(factor * (parseInt(this.data_max) - parseInt(this.data_min)) / parseInt(this.data_steps)) * parseInt(this.data_steps) + parseInt(this.data_min);
	}

	private checkForTime(time, init) {
		time = (typeof time === 'number' || time instanceof Number) ? time.toString() : time;
		if (time.substr(2, 1) === ':') {
			this.isValueTime = true;
			this.data_min = (init ? this.time.times(this.data_min).toMin : this.data_min);
			this.data_max = (init ? this.time.times(this.data_max).toMin : this.data_max);
			return this.time.times(time).toMin;
		} else {
			return parseInt(time);
		}
	}

	public displayAs(val) {
		if (this.isValueTime) {
			return this.time.minToTime(val);
		} else {
			return val;
		}
	}

	ngOnDestroy() {
		if (this.deviceChange !== undefined) {
			this.deviceChange.unsubscribe();
		}
	}
}