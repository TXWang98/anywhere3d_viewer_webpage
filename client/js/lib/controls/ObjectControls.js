import {
	Spherical,
	Vector3
} from 'three';
import { Math as MathUtils} from 'three';

const _lookDirection = new Vector3();
const _spherical = new Spherical();
const _target = new Vector3();

class ObjectControls {

	constructor( object, domElement ) {

		if ( domElement === undefined ) {

			console.warn( 'THREE.FirstPersonControls: The second parameter "domElement" is now mandatory.' );
			domElement = document;

		}

		this.object = object;
		this.domElement = domElement;

		// API

		this.enabled = true;

		this.movementSpeed = 1.0;
		this.lookSpeed = 0.005;

		this.lookVertical = true;
		this.autoForward = false;

		this.activeLook = true;

		this.heightSpeed = false;
		this.heightCoef = 1.0;
		this.heightMin = 0.0;
		this.heightMax = 1.0;

		this.constrainVertical = false;
		this.verticalMin = 0;
		this.verticalMax = Math.PI;

		// this.mouseDragOn = false;

		// internals

		this.autoSpeedFactor = 0.0;

		// this.mouseX = 0;
		// this.mouseY = 0;

		this.moveForward = false;
		this.moveBackward = false;
		this.moveLeft = false;
		this.moveRight = false;

		this.viewHalfX = 0;
		this.viewHalfY = 0;

		// private variables

		let lat = 0;
		let lon = 0;

		//

		this.handleResize = function () {

			if ( this.domElement === document ) {

				this.viewHalfX = window.innerWidth / 2;
				this.viewHalfY = window.innerHeight / 2;

			} else {

				this.viewHalfX = this.domElement.offsetWidth / 2;
				this.viewHalfY = this.domElement.offsetHeight / 2;

			}

		};


		this.onKeyDown = function ( event ) {

			switch ( event.code ) {

				// // case 'ArrowUp':
				// case 'KeyW': this.moveForward = true & event.shiftKey; break;

				// // case 'ArrowLeft':
				// case 'KeyA': this.moveLeft = true & event.shiftKey; break;

				// // case 'ArrowDown':
				// case 'KeyS': this.moveBackward = true& event.shiftKey; break;

				// // case 'ArrowRight':
				// case 'KeyD': this.moveRight = true& event.shiftKey; break;

				// case 'ArrowLeft': this.rotate_left = true& event.shiftKey; break;
				// case 'ArrowRight': this.rotate_right = true& event.shiftKey; break;

				case 'ArrowRight': this.rotate_left = true& event.ctrlKey & event.shiftKey; break;
				case 'ArrowLeft': this.rotate_right = true& event.ctrlKey & event.shiftKey; break;

			}

		};

		this.onKeyUp = function ( event ) {

			switch ( event.code ) {

				// // case 'ArrowUp':
				// case 'KeyW': this.moveForward = false; break;

				// // case 'ArrowLeft':
				// case 'KeyA': this.moveLeft = false; break;

				// // case 'ArrowDown':
				// case 'KeyS': this.moveBackward = false; break;

				// // case 'ArrowRight':
				// case 'KeyD': this.moveRight = false; break;

				case 'ArrowRight': this.rotate_left = false; break;
				case 'ArrowLeft': this.rotate_right = false; break;

			}

		};

		this.lookAt = function ( x, y, z ) {

			if ( x.isVector3 ) {

				_target.copy( x );

			} else {

				_target.set( x, y, z );

			}

			// this.object.lookAt( _target );

			setOrientation( this );

			return this;

		};

		this.update = function () {

			const targetPosition = new Vector3();

			return function update( delta ) {

				if ( this.enabled === false ) return;

				if ( this.heightSpeed ) {

					const y = MathUtils.clamp( this.object.position.y, this.heightMin, this.heightMax );
					const heightDelta = y - this.heightMin;

					this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );

				} else {

					this.autoSpeedFactor = 0.0;

				}

				const actualMoveSpeed = delta * this.movementSpeed;

				if ( this.moveForward || ( this.autoForward && ! this.moveBackward ) ) this.object.translateX(-actualMoveSpeed);//translateOnAxis(this.object.worldToLocal(new Vector3(1, 0, 0)), -actualMoveSpeed );
				if ( this.moveBackward ) this.object.translateX(actualMoveSpeed);//translateOnAxis(this.object.worldToLocal(new Vector3(1, 0, 0)), actualMoveSpeed );

				if ( this.moveLeft ) this.object.translateY(-actualMoveSpeed);
				if ( this.moveRight ) this.object.translateY(actualMoveSpeed);

				if ( this.rotate_left ) {
					this.object.rotateZ( -actualMoveSpeed );
				}
				if ( this.rotate_right ) {
					this.object.rotateZ( actualMoveSpeed );
				}

				let actualLookSpeed = delta * this.lookSpeed;

				if ( ! this.activeLook ) {

					actualLookSpeed = 0;

				}

				let verticalLookRatio = 1;

				if ( this.constrainVertical ) {

					verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );

				}

				// lon -= this.mouseX * actualLookSpeed;
				// if ( this.lookVertical ) lat -= this.mouseY * actualLookSpeed * verticalLookRatio;

				lat = Math.max( - 85, Math.min( 85, lat ) );

				let phi = MathUtils.degToRad( 90 - lat );
				const theta = MathUtils.degToRad( lon );

				if ( this.constrainVertical ) {

					phi = MathUtils.mapLinear( phi, 0, Math.PI, this.verticalMin, this.verticalMax );

				}

				const position = this.object.position;

				targetPosition.setFromSphericalCoords( 1, phi, theta ).add( position );

				// this.object.lookAt( targetPosition );

			};

		}();

		this.dispose = function () {

			this.domElement.removeEventListener( 'contextmenu', contextmenu );
			// this.domElement.removeEventListener( 'mousedown', _onMouseDown );
			// this.domElement.removeEventListener( 'mousemove', _onMouseMove );
			// this.domElement.removeEventListener( 'mouseup', _onMouseUp );

			window.removeEventListener( 'keydown', _onKeyDown );
			window.removeEventListener( 'keyup', _onKeyUp );

		};

		// const _onMouseMove = this.onMouseMove.bind( this );
		//const _onMouseDown = this.onMouseDown.bind( this );
		//const _onMouseUp = this.onMouseUp.bind( this );
		const _onKeyDown = this.onKeyDown.bind( this );
		const _onKeyUp = this.onKeyUp.bind( this );

		this.domElement.addEventListener( 'contextmenu', contextmenu );
		//this.domElement.addEventListener( 'mousemove', _onMouseMove );
		//this.domElement.addEventListener( 'mousedown', _onMouseDown );
		//this.domElement.addEventListener( 'mouseup', _onMouseUp );

		window.addEventListener( 'keydown', _onKeyDown );
		window.addEventListener( 'keyup', _onKeyUp );

		function setOrientation( controls ) {

			const quaternion = controls.object.quaternion;

			_lookDirection.set( 0, 0, - 1 ).applyQuaternion( quaternion );
			_spherical.setFromVector3( _lookDirection );

			lat = 90 - MathUtils.radToDeg( _spherical.phi );
			lon = MathUtils.radToDeg( _spherical.theta );

		}

		this.handleResize();

		setOrientation( this );

	}

}

function contextmenu( event ) {

	event.preventDefault();

}

export { ObjectControls };