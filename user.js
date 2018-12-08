// ==UserScript==
// @name MoachMods
// @description MiniHUD, Autobrake, Turbulence, WindFix and Moar Modz of Moach and Mayhem
// @author Moach
// @namespace GeoFS-Plugins
// @match http://*/geofs.php*
// @match https://*/geofs.php*
// @run-at document-end
// @version 0.1.0
// @grant none
// ==/UserScript==

(function() {
    'use strict';



	var autoBrakesEngaged = false;

	var dfrInit = 50;

		 // some of these should be adjusted for each aircraft, we don't wanna throw an A380's worth of chop on a Piper Cub - Right?
		//
	geofs.trblPwr = 250;    // max initial turbulence strength (scaled to mass)
	geofs.trblOff = .25;    // force application max offset from CoG (scalar of bounding sphere radius)
	geofs.trblVar = 30;     // max cycles between turbulence state shuffles
	geofs.trblFrq = .4; 	// turbulence frequency (frames % with random impulses while in turbulence)
	geofs.trblScl = .001;   // fixed scalar for turbulence end effect
	geofs.trblRte = 2;      // reduction rate for turbulence frames in update cycle (100ms / x)

	geofs.trblInv = 1000 + Math.random() * 6500;   //  inversion layer altitude (less turbulence above)

	geofs.trblArm = true;  // on-off switch for turbulence in general

	var trblLen = 0;
	var trblBuf = [0,0,0,0,0];
	var trblFms = geofs.trblRte;


	geofs.m2 = {};
	geofs.m2.autoBrakesArmed = true;      // master autobrakes toggle
	geofs.m2.autoBrakesCutoffSpeed = 60;  // knots above which autobrakes are engaged
	geofs.m2.autoBrakesArmThrottle = .4;  // autobrakes will deploy if power is below this above cutoff speed - useful for rejected takeoffs
	geofs.m2.autoBrakesReverserPwr = -.5; // minimum power set to thrust reversers on touchdown (control is returned to pilot immediately after)
	geofs.m2.spoilersFlightDetent  = .3;  // max percent of spoiler deployment while in flight
	geofs.m2.reverserInflightLock = true; // prevent opening of reversers while in flight
	geofs.m2.reverserGroundLock = true;   // prevent opening reversers while on ground below autobrakes cutoff speed (makes taxiing easier)
	geofs.m2.autoBrakesGrndReset = 20;    // cycles before autobrakes may reset to flight mode, preventing undeployment on bouncy landings

	geofs.m2.turnCoordSensitivity = 2.5;
	geofs.m2.rudderReCtrMaxBank = 8;

	geofs.m2.ctrlDSensActive = true; // control dynamic sensitivity master toggle

	geofs.m2.ctrlDSensMinTAS = 200; // max airspeed at full nominal sensitivity
	geofs.m2.ctrlDSensMaxTAS = 400; // min speed at softest reduction setting

	geofs.m2.ctrlDSensNominal =   1;  // nominal sensitivity (same as regular setting)
	geofs.m2.ctrlDSensSoftest =  .5;  // sensitivity at and beyond MaxTAS
	geofs.m2.ctrlDSensTouchdn = 2.0;  // sensitivity while autobrake is engaged (reaction boost for fast corrections immediately after touchdown)
	geofs.m2.ctrlDSensTaxiing = 1.5;  // sensitivity for normal ground operations

	geofs.m2.quickSpotCameraMod = true;


	geofs.m2.pushbackPower = .04;

	geofs.m2.yawDamperGrUpFactor = 1; // rudder sensitivity reduction for yaw dampening with landing dears retracted (set to 1 to disable dampening)
	geofs.m2.yawDamperGrDnFactor = 1; // same but for when gears are down

	geofs.m2.cockpitCamCenterSnapTrsh = 10;
	geofs.m2.cockpitCamTurnAutoPanMlt = .1;
	geofs.m2.cockpitCamTurnAutoPanMax = 10;

	geofs.m2.dragTwk = {};
	geofs.m2.dragTwk.enable = false;
	geofs.m2.dragTwk.baseDrag = 1;
	geofs.m2.dragTwk.flapsDragScl   = 1;
	geofs.m2.dragTwk.flapsDragCfg = [0, .4, .6, .8, 1.0]; // non-linear flap drag config - must match number of positions available to a given aircraft

	geofs.m2.powerCurveEnable = false;
	geofs.m2.powerCurveLo = 10000;
	geofs.m2.powerCurveHi = 20000;
	geofs.m2.powerCurveEprMin = .5; // engine performance multiplier at mach 1, dropping with:   epr = ((1-(mach-sat))^2) * (1-eprMin) + eprMin;  clips at mach 1
	geofs.m2.powerCurveEprSat = .1; // EPR mach number saturation (power starts dropping only above this speed, lest takeoff performance does not meet expectations)
	geofs.m2.powerCurveGrdIdleRPM = 1000;
	geofs.m2.powerCurveFltIdleInc = 0;
	geofs.m2.powerCurveFltIdleSpc = .01;


	geofs.m2.hudWarnCfg =
	{

		warnInvl: 10,
		warnFrms: 0,

		warnOverspeed: false,
		warnGearNotDown: false,

		overspeedIAS: 340,
		overspeedMach: .82,

		gearWarnThrClean: .10,
		gearWarnThrFlaps: .30,
		gearWarnMaxFlaps: 10
	};

	geofs.m2.hudTrimHoldT = 5;
	var trimHudFrms = 0;  // ok, so whenever the elevator trim changes from the recorded value, it shows for this many frames, ok?
	var elevTrimRec = 0; //

	geofs.m2.mpTagRangeGnd = 5000;
	geofs.m2.mpTagRangeMin = 500;
	geofs.m2.mpTagRangeMed = 12000;
	geofs.m2.mpTagRangeMax = 25000;

	geofs.m2.hudEngPerfTag = "RPM"; // this can be changed to somthing more apt, like "n1%" on jets
	geofs.m2.hudEngPerfOffset = 0;
	geofs.m2.hudEngPerfScalar = 100;
	geofs.m2.hudEngPerfAltCorrect = true;
	geofs.m2.hudEngPerfAltRescale = 1;
	geofs.m2.hudEngPerfEprPercent = 0;
	geofs.m2.hudEngPerfFltIdleInc = 12;
	geofs.m2.hudEngPerfFltIdleSpc = .01;
	geofs.m2.hudEngPerfCrsAdjust = { enable:false, v: .6, u: 1.1, k: .166 }; // cruise N1% adjustment values for use with the totally intuitive and obvious function below...
	geofs.m2.hudEngPerfAltPctRef = 41000;
	geofs.m2.hudEngPerfAltPercent = 4;

	function perfAdjust(x, v, u, k) // so, yeah there's a graph that shows how this works... no point explaining it again, see here: https://www.desmos.com/calculator/hdqewihsy9
	{
		var q = 1 - v;
		var w = 1 / q;
		var f = x / v;
		var t = (1-q) - ((f+q) * v * w) + w;
		var m = Math.min(1, Math.min(f,t)*u);
		var n = (m*m) * (1-m) + m;

		return x + (k*n) * ( 1 - (k*x) ); // what? you don't get it? - geez man, this is clear basic stuff :P
	}


	geofs.windDirOffset = 180;

	var ctrlDSensUpdate = 10;

	var windFixGroundReset = 0;

	var pushing = false; // this is just to cue the hud to let us know when push back is being applied

	var eprScl = 1;

	var rT = 0;
	var dT = 0;

	function fltUpdate() // this works - we can now tweak the sim as it runs
	{
		//dT = t-rT;
		//rT = t;

			 // DEFERRED INIT
			//
		if (dfrInit > 1)  // allow time for everything to get setup beforehand, lest bad reference errors spew out bloody murder
		{

			if (!geofs) return;
			if (!geofs.aircraft) return;
			if (!geofs.aircraft.instance) return;

			dfrInit--;
			return;

		} else
		if (dfrInit > 0)
		{
			dfrInit = 0;  // one time init

			// GFX settings
			geofs.api.viewer.scene.globe.tileCacheSize = 800;
			geofs.api.viewer.resolutionScale = 1;
			geofs.api.viewer.scene.fxaa = 1;
			geofs.api.viewer.scene.globe.maximumScreenSpaceError = 2;
			geofs.api.setGlobeLighting(geofs.preferences.weather.sun);
			geofs.preferences.graphics.simpleShadow = 1;
			geofs.fx.cloudManager.setCloudCoverToCloudNumber(1);
			geofs.api.viewer.scene.fog.screenSpaceErrorFactor = 2;
			geofs.api.viewer.scene.fog.density = 2.5E-4;


			initOverrides();
		}

		

		if (geofs.pause) return; // pause means pause...





		if (geofs.aircraft.instance.groundContact) // dynamic multiplayer label visibility range
		{
			multiplayer.labelVisibilityRange = geofs.m2.mpTagRangeGnd; // extended minimum range while on the ground (helps checking for incoming traffic)

		} else
		{
			if (controls.gear.target >0) // gear up
				multiplayer.labelVisibilityRange = (geofs.aircraft.instance.animationValue.altitude < 10000)? geofs.m2.mpTagRangeMed : geofs.m2.mpTagRangeMax;
			else
				multiplayer.labelVisibilityRange = geofs.m2.mpTagRangeMin; // minimum range, for decluttering runways on approach
		}


		if (geofs.m2.dragTwk.enable) // drag tweak system, to correct weird drag characteristics on some airplanes...
		{

			geofs.aircraft.instance.setup.dragFactor = geofs.m2.dragTwk.baseDrag;

			     // ensure this is defined first, as it isn't until flaps are moved at least once
			if (geofs.aircraft.instance.animationValue.flapsPositionTarget && geofs.aircraft.instance.animationValue.flapsTarget > 0)
			{
				if (geofs.aircraft.instance.animationValue.flapsPosition != geofs.aircraft.instance.animationValue.flapsTarget)
				{
					var fTgt = geofs.aircraft.instance.setup.flapsPositions[geofs.aircraft.instance.animationValue.flapsTarget];
					var fPrv = geofs.aircraft.instance.setup.flapsPositions[geofs.aircraft.instance.animationValue.flapsTarget-1];

					var lrp = (geofs.aircraft.instance.animationValue.flapsPosition-fPrv) / (fTgt-fPrv);

					var dTgt = geofs.m2.dragTwk.flapsDragCfg[geofs.aircraft.instance.animationValue.flapsTarget];
					var dPrv = geofs.m2.dragTwk.flapsDragCfg[geofs.aircraft.instance.animationValue.flapsTarget-1];

					geofs.aircraft.instance.setup.dragFactor += geofs.m2.dragTwk.flapsDragScl * ( dPrv + (dTgt - dPrv)*lrp );
				} else
				{
					geofs.aircraft.instance.setup.dragFactor += geofs.m2.dragTwk.flapsDragScl * geofs.m2.dragTwk.flapsDragCfg[geofs.aircraft.instance.animationValue.flapsTarget];
				}

			}

			/*
			if (!geofs.aircraft.instance.groundContact)
			{

				if (geofs.m2.dragTwk.inducedDragTweak)
				{
					var att = M33.multiplyV(geofs.aircraft.instance.object3d.worldRotation, geofs.aircraft.instance.airVelocity)[2];
						att = -att / (1+ geofs.aircraft.instance.animationValue.kias);
						att =  Math.max(0, att - geofs.m2.dragTwk.inducedDragMinAtt);

					geofs.aircraft.instance.setup.dragFactor += Math.min(geofs.m2.dragTwk.inducedDragClp, att * geofs.m2.dragTwk.inducedDragScl);
				}

				

				//geofs.aircraft.instance.setup.dragFactor += geofs.m2.dragTwk.machDragScl * geofs.aircraft.instance.animationValue.mach * geofs.aircraft.instance.animationValue.mach * geofs.aircraft.instance.animationValue.mach;
			
			}*/
		}

		if (geofs.m2.powerCurveEnable && geofs.aircraft.instance.engine.on) // non-linear power output for engines (good enough approximation of a realistic thrust-vs-rpm curve)
		{
			if (geofs.m2.powerCurveFltIdleInc > 0)
				geofs.aircraft.instance.setup.minRPM = geofs.m2.powerCurveGrdIdleRPM + geofs.m2.powerCurveFltIdleInc * Math.min(1, (geofs.m2.powerCurveFltIdleSpc * geofs.aircraft.instance.animationValue.kcas ));

			var pwr = Math.max(0, (geofs.aircraft.instance.engine.rpm - geofs.aircraft.instance.setup.minRPM)) * geofs.aircraft.instance.engine.invRPMRange;
			var epr = 1 - Math.max(0, Math.min(1, geofs.aircraft.instance.animationValue.mach-geofs.m2.powerCurveEprSat));
			eprScl = ( epr * epr * (1-geofs.m2.powerCurveEprMin) ) + geofs.m2.powerCurveEprMin;

			for (var i=0; i<geofs.aircraft.instance.engines.length; ++i)
			{

				geofs.aircraft.instance.engines[i].thrust = (geofs.m2.powerCurveLo + ((geofs.m2.powerCurveHi - geofs.m2.powerCurveLo) * pwr)) * eprScl;

			}


		} else
		{
			eprScl = 1;
		}



		// full time update cycle

		if (geofs.m2.quickSpotCameraMod)
		{
			if (camera.currentMode==2) // if camera is switched to no-cockpit view, return it to follow mode - this allows quick switching between cockpit and follow view by pressing 'C'
				camera.set(0); // further camera modes can be selected through the camera menu on the bottom bar
		}

		if (geofs.m2.ctrlDSensActive)
		{
			if (geofs.aircraft.instance.groundContact)
			{
				if (geofs.aircraft.instance.animationValue.ktas > 80 && (controls.throttle < 0))
				{
					 controls.sensitivity = geofs.m2.ctrlDSensTouchdn;
				} else
				{
					 controls.sensitivity = geofs.m2.ctrlDSensTaxiing;
				}
			} else
			{
					 if (geofs.aircraft.instance.animationValue.ktas < geofs.m2.ctrlDSensMinTAS) controls.sensitivity = geofs.m2.ctrlDSensNominal;
				else if (geofs.aircraft.instance.animationValue.ktas > geofs.m2.ctrlDSensMaxTAS) controls.sensitivity = geofs.m2.ctrlDSensSoftest;
				else
				{
					// do the lerp-dee-derp!
					var d = (geofs.aircraft.instance.animationValue.ktas - geofs.m2.ctrlDSensMinTAS) / (geofs.m2.ctrlDSensMaxTAS - geofs.m2.ctrlDSensMinTAS);
					controls.sensitivity = geofs.m2.ctrlDSensSoftest + ((1-d)*(geofs.m2.ctrlDSensNominal-geofs.m2.ctrlDSensSoftest));
				}
			}
		}


		if (!geofs.aircraft.instance.groundContact && geofs.trblArm)
		{



			var agl = geofs.aircraft.instance.object3d.lla[2] - geofs.aircraft.instance.elevationAtPreviousLocation;

			if (trblLen < 0)  /// some random TurBuLEnCe!
			{
				trblLen++; // time counter length of turbulence is negative while turbulence is on, positive in calm air

				if (trblFms > 1) trblFms--; // skip frames to reduce turbulence frequency relative to update cycle
				else
				{
					trblFms = geofs.trblRte;
					if (Math.random() < geofs.trblFrq)
					{
						var windFx = .25 + Math.min(.75, weather.currentWindSpeed * .075);

						var bump = [Math.random()*geofs.trblPwr -geofs.trblPwr*.5, Math.random()*geofs.trblPwr -geofs.trblPwr*.5, Math.random()*geofs.trblPwr -geofs.trblPwr*.5];
						bump[0] *=  windFx;
						bump[1] *=  windFx;
						bump[2] *= (.5 + (windFx * .5)) * (agl < geofs.trblInv)? 1 : .35; // reduce vertical axis above inversion layer

						bump[0] = (bump[0] + trblBuf[0]) *.5;  trblBuf[0] = bump[0];  // buffer out with previous impulse
						bump[1] = (bump[1] + trblBuf[1]) *.5;  trblBuf[1] = bump[1];  // this should cause a smoother, more brownian-noise like feel
						bump[2] = (bump[2] + trblBuf[2]) *.5;  trblBuf[2] = bump[2];

						bump = V3.scale(bump, geofs.aircraft.instance.rigidBody.mass * geofs.trblScl);

						var wpos = geofs.aircraft.instance.object3d.worldPosition;
						var offs = [(Math.random()*geofs.trblOff) - geofs.trblOff*.5, (Math.random()*geofs.trblOff) - geofs.trblOff*.5, 0];
							wpos = V3.add( wpos, V3.scale(offs, ((agl < geofs.trblInv)? 1 : .5) * geofs.aircraft.instance.boundingSphereRadius) ); // reduce torque effects above inversion layer

						geofs.aircraft.instance.rigidBody.applyImpulse(bump, wpos);
					}
				}

				if (trblLen>=0)
				{
					trblBuf = [0,0,0]; // reset buffer on state change cues

					if (Math.random() > .5)
						trblLen = -Math.floor(Math.random() * geofs.trblVar);
					else
						trblLen =  Math.floor(Math.random() * geofs.trblVar);
				}
			} else
			{
				// below inversion turbulence should be much more frequent with stronger wind
				trblLen -= (1 + Math.round(weather.currentWindSpeed * (agl < geofs.trblInv)? .25 : .1));

				if (trblLen <= 0)
				{
					if (Math.random() > .5)
						trblLen = -Math.floor(Math.random() * geofs.trblVar);
					else
						trblLen =  Math.floor(Math.random() * geofs.trblVar);
				}
			}
		}












		if (geofs.aircraft.instance.engine.on)  /// AUTO BRAKES, SPOILER FLIGHT DETENT AND INFLIGHT REVERSER SUPPRESSION
		{		// only when engine is running

			if (!geofs.aircraft.instance.groundContact)
			{
				if (!autoBrakesEngaged) // when autobrakes are engaged, they must stay on until the aircraft has slowed to a safe speed - do not allow bounces to disarm the system
				{
					if (controls.airbrakes.target > geofs.m2.spoilersFlightDetent) controls.airbrakes.target = geofs.m2.spoilersFlightDetent; // apply flight detent while in the air
					if (controls.throttle < 0 && geofs.m2.reverserInflightLock) controls.throttle = 0; // suppress reverser while flying
				}

			} else
			{
				// poor man's auto-brakes
				if ( (geofs.aircraft.instance.animationValue.parkingBrake || controls.throttle <= geofs.m2.autoBrakesArmThrottle ||controls.airbrakes.target >.1) &&
					 (geofs.aircraft.instance.animationValue.kias > geofs.m2.autoBrakesCutoffSpeed) )
				{
					if (!autoBrakesEngaged && geofs.m2.autoBrakesArmed)
					{
						 autoBrakesEngaged = true; // one time only autobrake deployment, then control is returned to the pilot
						
						controls.throttle = geofs.m2.autoBrakesReverserPwr; // low reverse only - more power is up to the pilot
						controls.airbrakes.target = 1;
						controls.airbrakes.delta  = 1;
					}


				} else
				{
					if (geofs.aircraft.instance.animationValue.kias <= geofs.m2.autoBrakesCutoffSpeed || (autoBrakesEngaged && controls.throttle > .9)) // shoving throttles forward will override the autobrakes
					{
						if (autoBrakesEngaged || geofs.m2.reverserGroundLock) // the OR here allows reverser auto-cutoff when ground lock is disabled
						{
							autoBrakesEngaged = false;
							if (controls.throttle < 0) controls.throttle = 0;
						}
					}
				}


			}

			pushing = false;

		} else /// ENGINES OFF - PROVIDE PUSHBACK WHEN ENGINE-OUT REVERSER IS USED ON GROUND
		{		// only when engine is running

			if (geofs.aircraft.instance.groundContact && Math.abs(controls.throttle) > .1 && !geofs.aircraft.instance.animationValue.parkingBrake)
			{
				pushing = true;

				var push = geofs.aircraft.instance.object3d.getWorldFrame()[1];
					push =V3.scale(push, geofs.aircraft.instance.rigidBody.mass * geofs.m2.pushbackPower * ((controls.throttle > 0)? 1 : -1));

				geofs.aircraft.instance.rigidBody.applyImpulse(push, geofs.aircraft.instance.object3d.worldPosition);


			} else
			{
				pushing = false;
				if (geofs.aircraft.instance.animationValue.parkingBrake )
				{
					controls.throttle=0;
				}
			}
		}


		if (flight.recorder.playing)    ///   DIGITAL MINI HUD
		{
			fdd.textContent = "";
		} else
		{

			var fltDat = " IAS ";

			var val = Math.round(geofs.aircraft.instance.animationValue.kcas);
			 fltDat = fltDat + ('000' + val ).slice(-3) + " | ALT ";

				val = Math.round(geofs.aircraft.instance.animationValue.altitude);
			 fltDat = fltDat + ('00000' + val ).slice(-5) + " | VSI ";

				val = Math.abs(Math.round(geofs.aircraft.instance.animationValue.climbrate * .1));
			 fltDat = fltDat + ((geofs.aircraft.instance.animationValue.climbrate >= 0)? "+" : "-") + ('000' + val ).slice(-3) + "0 | HDG ";

				val = Math.round(geofs.aircraft.instance.animationValue.heading360);
			 fltDat = fltDat + ('000' + val ).slice(-3) + " | THR ";

				val = Math.abs(Math.round(geofs.aircraft.instance.animationValue.throttle * 100));
			 fltDat = fltDat + ((geofs.aircraft.instance.animationValue.throttle >= 0)? ('000' + val ).slice(-3) : "REV");


			if (geofs.aircraft.instance.groundContact)
			{
				fltDat = fltDat + "<br> GND "; // display ground speed when landed

					val = Math.round(geofs.aircraft.instance.animationValue.rollingSpeed * 2);
				 fltDat = fltDat + ('000' + val ).slice(-3) + " | ";

			} else
			{
				fltDat = fltDat + "<br> TAS ";  // or show true airspeed while in the air

					val = Math.round(geofs.aircraft.instance.animationValue.ktas);
				 fltDat = fltDat + ('000' + val ).slice(-3) + " | ";
			}


			    val = Math.round(geofs.aircraft.instance.animationValue.mach*100)*.01;
			 fltDat = fltDat + "MACH " + val.toFixed(2) + " | ";
		//	



			



			if (!geofs.aircraft.instance.groundContact) // its VERY difficult to overspeed on the ground, and even more so to do it without noticing. Thus, we may safely bypass the warning when landed
			{

				var overspeedWarn = geofs.m2.hudWarnCfg.warnOverspeed &&
					 (geofs.aircraft.instance.animationValue.mach > geofs.m2.hudWarnCfg.overspeedMach || geofs.aircraft.instance.animationValue.kcas > geofs.m2.hudWarnCfg.overspeedIAS);

				if (overspeedWarn) // warning is ON - you're overspeeding, hasty boy!
				{
					if (geofs.m2.hudWarnCfg.warnFrms < geofs.m2.hudWarnCfg.warnInvl)
					{
						if (geofs.m2.hudWarnCfg.warnFrms < 0) overspeedWarn = false; // warning flag OFF to make the turn coordinator blink IN  while counter is above zero
							geofs.m2.hudWarnCfg.warnFrms++;	// once the counter tops up, revert to negative interval, so that the turn thingy blinks OUT until zero
						if (geofs.m2.hudWarnCfg.warnFrms > geofs.m2.hudWarnCfg.warnInvl) geofs.m2.hudWarnCfg.warnFrms = -geofs.m2.hudWarnCfg.warnInvl;
					}

				}

				if (overspeedWarn)
				{
					 fltDat = fltDat + "OVERSPEED"; // conveniently this has the name number of characters as there is room for in that spot

				} else // show turn coordinator in normal conditions
				{
					var slp = M33.multiplyV(geofs.aircraft.instance.object3d.worldRotation, geofs.aircraft.instance.airVelocity)[0] * geofs.m2.turnCoordSensitivity;
						val = Math.max(-4, Math.min( 4, Math.round( slp ) ));
					 fltDat = fltDat + ("....◘....").replaceAt(4+val, (Math.abs(val) < 1)? "█" : (slp < val)? "▌" : "▐");
				}

			} else
			{
				if (!pushing)
				{
					if (geofs.aircraft.instance.animationValue.parkingBrake) fltDat = fltDat + "WHL(℗)BRK";
					else												     fltDat = fltDat + "....◘....";
				} else
				{
					 fltDat = fltDat + ((controls.throttle < 0)? "PUSH▄BACK" : "PUSH▀FRWD" );
				}
			}




			if (elevTrimRec != geofs.aircraft.instance.animationValue.trim)
			{
				elevTrimRec = geofs.aircraft.instance.animationValue.trim;
				trimHudFrms = geofs.m2.hudTrimHoldT;
			}

			if (trimHudFrms>0)
			{
				trimHudFrms--;
				fltDat = fltDat + " | P™" + (((geofs.aircraft.instance.animationValue.trim > 0)? "↑ " : "↓ ") + ('000' + Math.round( Math.abs(geofs.aircraft.instance.animationValue.trim * 100))).slice(-3));
			} else
			{
			 	fltDat = fltDat + " | F" + ((geofs.aircraft.instance.animationValue.flapsPositionTarget)? ('00' + controls.flaps.positionTarget ).slice(-2) : "00") + " LG"+ ((controls.gear.target >0)? "↑" : "↓");
			}


//geofs.m2.hudEngPerfAltPctRef = 41000;
//geofs.m2.hudEngPerfAltPercent = 4;
//
			if (geofs.aircraft.instance.engine.on)
			{
				val = (geofs.aircraft.instance.engine.rpm - geofs.aircraft.instance.setup.minRPM) * geofs.aircraft.instance.engine.invRPMRange;

				if (geofs.m2.hudEngPerfAltCorrect) // correct for direct altitude effect on RPM (unrealistic oversimplification, RPM should remain relatively constant despite thrust output dropping as you climb)
					val *= 1 + ((geofs.aircraft.instance.animationValue.altitude / geofs.aircraft.instance.setup.zeroRPMAltitude) * geofs.m2.hudEngPerfAltRescale);

				if (geofs.m2.hudEngPerfCrsAdjust.enable)
					val = perfAdjust( val, geofs.m2.hudEngPerfCrsAdjust.v, geofs.m2.hudEngPerfCrsAdjust.u, geofs.m2.hudEngPerfCrsAdjust.k );

				var eps = (1-eprScl) * geofs.m2.hudEngPerfEprPercent;
				var alt = (geofs.aircraft.instance.animationValue.altitude / geofs.m2.hudEngPerfAltPctRef) * geofs.m2.hudEngPerfAltPercent;
				var off = geofs.m2.hudEngPerfOffset + Math.min(1, (geofs.aircraft.instance.animationValue.kcas * geofs.m2.hudEngPerfFltIdleSpc)) * geofs.m2.hudEngPerfFltIdleInc;

				geofs.aircraft.instance.animationValue.rpmPct = (val * geofs.m2.hudEngPerfScalar) - (val * ((eps*eps) + alt)) + ((1-val) * off);

				fltDat = fltDat + (" | " + geofs.m2.hudEngPerfTag + " ") + ('000' + Math.round( geofs.aircraft.instance.animationValue.rpmPct )).slice(-3);

			} else
			{
				fltDat = fltDat + " | ENG OFF";

			}



			fdd.innerHTML = fltDat;

		}


	}

	//geofs.api.addFrameCallback(fltUpdate);
	setInterval(fltUpdate, 100); // milliseconds between display updates


	var chatToggle = true;







	function initOverrides()
	{
		geofs._flyTo = geofs.flyTo; // fly-to wrapper to preserve current airspeed whenever it exceeds the aircraft's minimum (or use minimum if not)
		geofs.flyTo = function(a,b)
		{
			if (a)
			{
				var setupVmin = geofs.aircraft.instance.setup.minimumSpeed;

				if (!geofs.aircraft.instance.groundContact && geofs.aircraft.instance.animationValue.ktas > geofs.aircraft.instance.setup.minimumSpeed)
				{
					geofs.aircraft.instance.setup.minimumSpeed = geofs.aircraft.instance.animationValue.ktas;
				}

				geofs._flyTo(a, b);

				geofs.aircraft.instance.setup.minimumSpeed = setupVmin;
			}

		}



		camera.saveRotation = function()
		{
			if (camera.definitions)
			{
				if (camera.currentMode == 1 && Math.abs(camera.definitions[camera.currentModeName].orientations.current[0]) < geofs.m2.cockpitCamCenterSnapTrsh)
				{

					camera.definitions[camera.currentModeName].orientations.current[0] = 0;
					camera.definitions[camera.currentModeName].orientations.last[0] = 0;
				}

				var a = camera.definitions[camera.currentModeName];
				a.orientations.last = V3.dup(a.orientations.current)

			}
		};



		  // fix wind being 180 degreess off (noticed by ADS traffic using downwind runways everywhere) --
		 //   also, disable gusts while landed to avoid awkward jerks and jumps during taxi
		weather.Wind.prototype.randomize = function()
		{
			if (geofs.m2.groundWindFix && geofs.aircraft.instance.groundContact)
			{
				this.direction = fixAngle(this.mainDirection + geofs.windDirOffset); //  + 180
				this.speed = this.mainSpeedMs;
			} else
			{
				this.speedOffset += (Math.random() - .5) * this.randomizerSpeed;
				this.speedOffset = clamp(this.speedOffset, -this.maxSpeedDelta, this.maxSpeedDelta);
				this.directionOffset += (Math.random() - .5) * this.randomizerSpeed;
				this.directionOffset = clamp(this.directionOffset, -this.maxDirectionDelta, this.maxDirectionDelta);
				this.direction = fixAngle(this.mainDirection + this.directionOffset + geofs.windDirOffset); //  + 180
				this.speed = this.mainSpeedMs + this.speedOffset;
			}

			geofs.trblInv = 1000 + Math.random() * 6500; // shuffle inversion height along with wind changes
		}


		 geofs.api.map.prototype.setGenericLocationPopup = function() // override map popup to add an option to move the aircraft maintaining the same current alt and heading
		 {
            var a = this, b = L.popup();
            this.map.on("contextmenu click", function(c)
			{
                if (2 == c.originalEvent.button || geofs.isApp)
				{
                    b.closePopup();

                    var d = c.latlng.lat + "," + c.latlng.lng;
                    b.setContent('<div class="geofs-map-popup"><ul><li><a href="http://flyto://' + d + ',' +  geofs.aircraft.instance.llaLocation[2] + ',' + geofs.aircraft.instance.htr[0] + ', true">Flight Level</a></li><li><a href="http://flyto://' + d + ', 0, 0, true">On the ground</a></li><li><a href="http://flyto://' + d + ', 304, 0, true">At 1,000 feet</a></li><li><a href="http://flyto://' + d + ', 914, 0, true">At 3,000 feet</a></li><li><a href="http://flyto://' + d + ', 3048, 0, true">At 10,000 feet</a></li><li><a href="http://flyto://' + d + ', 6096, 0, true">At 20,000 feet</a></li><li><a href="http://flyto://' + d + ', 9144, 0, true">At 30,000 Feet</a></li></ul></div>').setLatLng(c.latlng).openOn(a.map);
                    c.originalEvent.preventDefault()
                }
            })
        }

			 // joystick setup function replacement, checks devices in reverse order -  should allow VJoy devices being detected before raw input
		    //
		controls.joystick.startWatchEvents = function()
		{
			controls.joystick.eventInterval || (controls.joystick.eventInterval = window.setInterval(function()
																									 {
				controls.joystick.buttons.forEach(function(a, b)
												  {
					var c = a.pressed;
					if (c != a.oldValue)
					{
						if (b = c ? controls.joystick.buttonHandlers.buttondown[b] : controls.joystick.buttonHandlers.buttonup[b])
							for (var d = b.length-1; d >= 0; d--)
								b[d]();

						a.oldValue = c
					}
				})
			}, 10))
		};


		controls.updateKeyboard = function(a)
		{

			var b = controls.keyboard.rollIncrement * a * geofs.preferences.keyboard.sensitivity;

			controls.states.left  ? controls.roll -= b :
			controls.states.right ? controls.roll += b :
				(geofs.aircraft.instance.controllers.roll.recenter && !geofs.aircraft.instance.groundContact) &&
					(controls.roll -= [controls.roll - 0] * controls.keyboard.recenterRatio * geofs.preferences.keyboard.sensitivity);

			b = controls.keyboard.pitchIncrement * a * geofs.preferences.keyboard.sensitivity * geofs.aircraft.instance.controllers.pitch.sensitivity;

			controls.states.up ?   controls.rawPitch -= b * geofs.aircraft.instance.controllers.pitch.ratio :
			controls.states.down ? controls.rawPitch += b * geofs.aircraft.instance.controllers.pitch.ratio :
				geofs.aircraft.instance.controllers.pitch.recenter && (controls.rawPitch -= [controls.rawPitch - 0] * b);

			b = controls.keyboard.yawIncrement * a * geofs.preferences.keyboard.sensitivity;

			if (!geofs.aircraft.instance.groundContact) b *= ( (controls.gear.target >0)? geofs.m2.yawDamperGrUpFactor : geofs.m2.yawDamperGrDnFactor ); // yaw damper when airborne (as defined)

			controls.states.rudderLeft  ? controls.yaw -= b :
			controls.states.rudderRight ? controls.yaw += b :
				((geofs.aircraft.instance.controllers.yaw.recenter && Math.abs(geofs.aircraft.instance.animationValue.aroll) < geofs.m2.rudderReCtrMaxBank) || (controls.gear.target <0)) &&
					(controls.yaw -= [controls.yaw - 0] * controls.keyboard.recenterRatio * geofs.preferences.keyboard.sensitivity);

			a *= controls.keyboard.throttleIncrement * .5;
			controls.states.increaseThrottle ? controls.throttle += a : controls.states.decreaseThrottle && (controls.throttle -= a)
		};


		controls.recenter = function()
		{
			controls.mouse.xValue = 0;
			controls.mouse.yValue = 0;
			controls.yaw = 0;
			controls.roll = 0;
			controls.rawPitch = 0
		};


	}

	//

	var insertDiv = document.createElement ('div');   /// MINI HUD HTML CONTAINER
		insertDiv.innerHTML = '\
		<div id="dfd" style="\
		background-color: #000000;\
		color: lime;\
		align-content: center;\
		padding: 2px;\
		font-family: monospace;\
		text-align: justify;\
		z-index: 1500;\
		user-select: none;\
		width: fit-content;\
		position: absolute;\
		border: 0px solid #000000;\
		border-radius: 6px;\
		padding-left: 4px;\
		padding-right: 4px;\
		bottom: 2px;\
		right: 2px;\
		line-height: 14px;\
		"><div id="fdd"></div></div>\
	';

	document.body.appendChild (insertDiv);

	var fdd = document.getElementById('fdd');

	String.prototype.replaceAt=function(index, replacement)
	{
		return this.substr(0, index) + replacement + this.substr(index + replacement.length);
	}

	function getBaseLog(x, y)
	{
  		return Math.log(y) / Math.log(x);
	}


})();